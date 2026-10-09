import type { CookieOptions } from 'express';

export const SESSION_COOKIE = 'session';
export const ATTEMPT_CLAIM_COOKIE = 'attempt_claim';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SEVEN_DAYS_MS,
  };
}

export const SESSION_TTL_SECONDS = SEVEN_DAYS_MS / 1000;

/** clearCookie must match the attributes the cookie was set with, minus maxAge. */
export function clearCookieOptions(): CookieOptions {
  const { maxAge: _maxAge, ...options } = cookieOptions();
  return options;
}
