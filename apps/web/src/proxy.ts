import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic check only: visitors without a session cookie go straight to
 * sign in. The API still validates the session on every request.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("session")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/report",
};
