import "server-only";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
/** Long enough for a cold start of a free-tier API instance, short enough not to hang the page. */
const TIMEOUT_MS = 60_000;

/**
 * Server-side API call that forwards the visitor's cookies, so server
 * components see the same session as the browser.
 */
export async function serverFetch(path: string): Promise<Response> {
  const cookieHeader = (await cookies()).toString();
  return fetch(`${API_URL}/api${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

export async function isSignedIn(): Promise<boolean> {
  const jar = await cookies();
  if (!jar.has("session")) return false;
  return (await serverFetch("/auth/me")).ok;
}
