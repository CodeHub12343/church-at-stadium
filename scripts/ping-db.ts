import 'dotenv/config';
import { dbConnect } from '../lib/mongodb';

async function main() {
  const conn = await dbConnect();
  console.log('[ok] connected to', conn.connection.name, '@', conn.connection.host);
  await conn.disconnect();
}

main().catch((err) => {
  console.error('[fail]', err?.message || err);
  process.exit(1);
});
