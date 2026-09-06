import crypto from "crypto";
import type { Request, Response } from "express";
import { dbConfigured, newId, query } from "./db.js";

/** Magic-link sign-in: no passwords for parents to lose or children to guess. */

const SESSION_COOKIE = "mwc_session";
const SESSION_DAYS = 60;
const LINK_MINUTES = 20;

export interface Account {
  id: string;
  email: string;
  plan: string;
  plan_status: string | null;
  period_end: Date | null;
  stripe_customer: string | null;
  stripe_sub: string | null;
}

export interface Child {
  id: string;
  account_id: string;
  name: string;
  grade: number;
}

const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
const randomToken = () => crypto.randomBytes(32).toString("base64url");

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export function normalizeEmail(raw: unknown): string | null {
  const email = String(raw ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? email : null;
}

/** Issue a single-use sign-in token and return the link to email. */
export async function createLoginLink(email: string, appUrl: string): Promise<string> {
  const token = randomToken();
  const expires = new Date(Date.now() + LINK_MINUTES * 60_000);
  await query(
    `INSERT INTO login_tokens (token_hash, email, expires_at) VALUES ($1, $2, $3)`,
    [hash(token), email, expires]
  );
  return `${appUrl.replace(/\/$/, "")}/api/auth/verify?token=${encodeURIComponent(token)}`;
}

/** Spend a sign-in token, creating the account on first use. */
export async function redeemLoginToken(token: string): Promise<Account | null> {
  const rows = await query<{ email: string }>(
    `UPDATE login_tokens SET used_at = now()
      WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
      RETURNING email`,
    [hash(token)]
  );
  if (!rows.length) return null;
  const email = rows[0].email;

  const existing = await query<Account>(`SELECT * FROM accounts WHERE email = $1`, [email]);
  if (existing.length) return existing[0];

  const created = await query<Account>(
    `INSERT INTO accounts (id, email) VALUES ($1, $2) RETURNING *`,
    [newId("acc"), email]
  );
  return created[0];
}

export async function startSession(res: Response, accountId: string): Promise<void> {
  const token = randomToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await query(
    `INSERT INTO sessions (token_hash, account_id, expires_at) VALUES ($1, $2, $3)`,
    [hash(token), accountId, expires]
  );
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export async function endSession(req: Request, res: Response): Promise<void> {
  const token = readCookie(req, SESSION_COOKIE);
  if (token) await query(`DELETE FROM sessions WHERE token_hash = $1`, [hash(token)]).catch(() => []);
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

/** The signed-in account, or null. Never throws — callers degrade to anonymous. */
export async function currentAccount(req: Request): Promise<Account | null> {
  if (!dbConfigured()) return null;
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;
  try {
    const rows = await query<Account>(
      `SELECT a.* FROM sessions s JOIN accounts a ON a.id = s.account_id
        WHERE s.token_hash = $1 AND s.expires_at > now()`,
      [hash(token)]
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/** A subscription counts while Stripe says it is live and not past its period. */
export function isSubscriptionActive(account: Account | null): boolean {
  if (!account) return false;
  if (account.plan !== "pro") return false;
  if (account.plan_status && !["active", "trialing", "comp"].includes(account.plan_status)) return false;
  if (account.period_end && account.period_end.getTime() < Date.now()) return false;
  return true;
}

export async function listChildren(accountId: string): Promise<Child[]> {
  return query<Child>(
    `SELECT id, account_id, name, grade FROM children WHERE account_id = $1 ORDER BY created_at`,
    [accountId]
  );
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

export async function sendLoginEmail(email: string, link: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set.");
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || "Maple Writing Coach <onboarding@resend.dev>";
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Your Maple Writing Coach sign-in link",
    text: `Hi!

Click here to sign in to Maple Writing Coach:
${link}

This link works once and expires in ${LINK_MINUTES} minutes. If you didn't ask
to sign in, you can ignore this email.`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;line-height:1.6">
  <h2 style="margin:0 0 8px">Sign in to Maple Writing Coach</h2>
  <p style="color:#57534e;margin:0 0 20px">Click the button below and you're in.</p>
  <p style="margin:0 0 20px">
    <a href="${link}" style="background:#1c1917;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;display:inline-block">Sign in</a>
  </p>
  <p style="color:#a8a29e;font-size:13px;margin:0">
    This link works once and expires in ${LINK_MINUTES} minutes.
    If you didn't ask to sign in, you can ignore this email.
  </p>
</div>`,
  });
  if (error) throw new Error(`Email failed: ${error.message ?? String(error)}`);
}
