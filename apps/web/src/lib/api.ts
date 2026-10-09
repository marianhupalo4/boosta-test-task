/** Error returned by the API, with field errors from validation if any. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

/** Calls the API through the same-origin `/api` rewrite (browser only). */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const message = typeof body.message === "string" ? body.message : "Something went wrong";
    throw new ApiError(res.status, message, body);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}
