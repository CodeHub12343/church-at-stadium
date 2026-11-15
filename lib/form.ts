/**
 * Shared client-side form helpers.
 *
 * `submitJson` POSTs/PATCHes JSON and returns a tagged result —
 * it never throws, so form components can show a clean error without
 * leaving the page or swallowing promise rejections. Network failures,
 * non-JSON responses, and server-returned errors all surface here.
 */

export type SubmitResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

export async function submitJson<T = unknown>(
  url: string,
  body: unknown,
  init?: { method?: 'POST' | 'PATCH' | 'PUT' | 'DELETE' }
): Promise<SubmitResult<T>> {
  try {
    const res = await fetch(url, {
      method: init?.method ?? 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });

    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      /* non-JSON response — leave data null */
    }

    if (!res.ok) {
      const err = (data as { error?: string } | null)?.error;
      return {
        ok: false,
        status: res.status,
        error:
          err ||
          (res.status === 401
            ? 'You need to sign in to do that.'
            : res.status === 403
            ? "You don't have permission for that."
            : res.status === 409
            ? 'That already exists.'
            : res.status === 404
            ? 'Not found.'
            : res.status >= 500
            ? 'Something went wrong on our end. Try again shortly.'
            : 'The server rejected the request.'),
      };
    }
    return { ok: true, data: (data as T) ?? ({} as T) };
  } catch (err) {
    const msg =
      err instanceof Error && err.name === 'AbortError'
        ? 'Request cancelled'
        : 'Network error. Check your connection and try again.';
    return { ok: false, error: msg };
  }
}

// ---- client-side validators ----

export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(v: string): boolean {
  return emailRe.test(v.trim());
}

export function isValidPassword(v: string, min = 8): boolean {
  return typeof v === 'string' && v.length >= min;
}

export function required(v: string | undefined | null): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

export function joinErrors(errors: Array<string | null | undefined | false>): string | null {
  const first = errors.find((e) => typeof e === 'string' && e.length > 0);
  return (first as string) || null;
}
