import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from './mongodb';
import { User } from './models/User';
import { checkLockout, recordLoginFailure, clearLoginFailures } from './loginAttempts';
import { recordAudit } from './audit';

// How often (ms) to re-read the user's role from the DB inside the JWT.
const ROLE_REFRESH_MS = 5 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Email + password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();

        // Account lockout check
        const lockout = await checkLockout(email);
        if (lockout.locked) {
          await recordAudit({
            action: 'auth.signin.locked',
            description: `Sign-in attempt on locked account ${email}`,
            severity: 'alert',
          });
          throw new Error(`Account temporarily locked. Try again in ${Math.ceil(lockout.retryAfterSeconds / 60)} minutes.`);
        }

        await dbConnect();
        const user = await User.findOne({ email }).lean();
        if (!user) {
          await recordLoginFailure(email);
          await recordAudit({
            action: 'auth.signin.failure',
            description: `Failed sign-in for ${email} (no such account)`,
            severity: 'alert',
          });
          return null;
        }
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) {
          await recordLoginFailure(email);
          await recordAudit({
            actorId: String(user._id),
            action: 'auth.signin.failure',
            description: `Failed sign-in for ${email} (bad password)`,
            severity: 'alert',
          });
          return null;
        }

        await clearLoginFailures(email);
        await recordAudit({
          actorId: String(user._id),
          action: 'auth.signin.success',
          description: `Sign-in success for ${email}`,
          severity: 'success',
        });

        return {
          id: String(user._id),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
          churchId: user.churchId ? String(user.churchId) : undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { id: string; role: string; churchId?: string };
        token.id = u.id;
        token.role = u.role;
        token.churchId = u.churchId;
        token.roleCheckedAt = Date.now();
      } else if (token.id) {
        const checkedAt = typeof token.roleCheckedAt === 'number' ? token.roleCheckedAt : 0;
        if (Date.now() - checkedAt > ROLE_REFRESH_MS) {
          try {
            await dbConnect();
            const u = await User.findById(token.id).select('role churchId').lean();
            if (u) {
              token.role = u.role;
              token.churchId = u.churchId ? String(u.churchId) : undefined;
            }
            token.roleCheckedAt = Date.now();
          } catch (err) {
            console.error('[authOptions] role refresh failed', err);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.churchId = token.churchId as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
