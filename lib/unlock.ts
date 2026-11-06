import crypto from "crypto";
import type { Request, Response } from "express";

/**
 * Unlock codes: an owner's way into the full app without Stripe, and a comp
 * pass for teachers or beta families.
 *
 * Redeeming one sets a signed cookie, so it works with no database, no email
 * and no billing configured — which is the state the app ships in. When a
 * database IS configured and the redeemer is signed in, the account is also
 * marked comp so the pass follows them to another browser.
 */

const PASS_COOKIE = "mwc_pass";
const PASS_DAYS = 365;

/**
 * Demo mode: the whole app, unmetered, with every trace of money removed —
 * no credit counter, no paywall, no upgrade prompts, no unlock box, and the
 * billing endpoints answering 404. For showing the platform to a teacher or a
 * school without a price tag in the room.
 *
 * It is a single environment variable so it can be turned off again without
 * touching code: unset DEMO_MODE and redeploy and everything comes back.
 */
export function demoMode(): boolean {
  return /^(1|true|on|yes)$/i.test((process.env.DEMO_MODE ?? "").trim());
}

export function unlockCodes(): string[] {
  return (process.env.PRO_UNLOCK_CODES ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean)
    .sort();
}

export function unlockConfigured(): boolean {
  return unlockCodes().length > 0;
}

/**
 * The signing key is derived from the codes themselves (plus UNLOCK_SECRET if
 * set), so there is nothing extra to configure — and editing or removing a
 * code revokes every pass issued under it, which is the only revocation an
 * app with no user table can offer.
 */
function signingKey(): string | null {
  const codes = unlockCodes();
  if (!codes.length) return null;
  return crypto
    .createHash("sha256")
    .update(`mwc-unlock|${process.env.UNLOCK_SECRET?.trim() ?? ""}|${codes.join(",")}`)
    .digest("hex");
}

const sign = (key: string, payload: string) =>
  crypto.createHmac("sha256", key).update(payload).digest("base64url");

/** Constant-time equality for two strings of any length. */
function sameSecret(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/** Does this string match one of the configured codes? */
export function codeIsValid(given: unknown): boolean {
  const code = String(given ?? "").trim().toUpperCase();
  if (!code) return false;
  // Every code is compared, so a wrong guess takes the same time whichever
  // position it would have matched in.
  return unlockCodes().reduce((hit, candidate) => sameSecret(code, candidate) || hit, false);
}

export function issuePass(res: Response): void {
  const key = signingKey();
  if (!key) return;
  const expires = new Date(Date.now() + PASS_DAYS * 86_400_000);
  const stamp = String(expires.getTime());
  res.cookie(PASS_COOKIE, `${stamp}.${sign(key, stamp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export function clearPass(res: Response): void {
  res.clearCookie(PASS_COOKIE, { path: "/" });
}

/** True when this browser holds a valid, unexpired unlock pass. */
export function hasPass(req: Request): boolean {
  const key = signingKey();
  if (!key) return false;
  const raw = readCookie(req, PASS_COOKIE);
  if (!raw) return false;
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return false;
  const stamp = raw.slice(0, dot);
  const expires = Number(stamp);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  return sameSecret(raw.slice(dot + 1), sign(key, stamp));
}

/** Express has no cookie parser here; the header is simple enough to read. */
function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
