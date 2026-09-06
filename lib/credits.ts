import { dbConfigured, query } from "./db.js";

/**
 * Free-tier metering, counted server-side against an anonymous device id so
 * clearing site data doesn't hand out fresh credits. Pieces are recorded one
 * row each, which makes finishing idempotent and lets callers tell "the piece
 * I already paid for" from "a brand new one".
 *
 * With no database the limit falls back to the client's own bookkeeping.
 */

export const FREE_CREDITS = 3;

const cleanId = (raw: unknown): string | null => {
  const id = String(raw ?? "").trim();
  return /^[A-Za-z0-9_-]{6,64}$/.test(id) ? id : null;
};

export interface CreditState {
  used: number;
  left: number;
  /** True when this specific piece has already spent its credit. */
  counted: boolean;
}

export async function creditState(deviceId: unknown, pieceId?: unknown): Promise<CreditState> {
  const device = cleanId(deviceId);
  if (!dbConfigured() || !device) return { used: 0, left: FREE_CREDITS, counted: false };
  try {
    const rows = await query<{ piece_id: string }>(
      `SELECT piece_id FROM finished_pieces WHERE device_id = $1`,
      [device]
    );
    const piece = cleanId(pieceId);
    return {
      used: rows.length,
      left: Math.max(0, FREE_CREDITS - rows.length),
      counted: !!piece && rows.some((r) => r.piece_id === piece),
    };
  } catch {
    // Never lock a writer out over a database blip.
    return { used: 0, left: FREE_CREDITS, counted: false };
  }
}

/** Spend one credit on a piece. Refuses once the free allowance is gone. */
export async function spendCredit(
  deviceId: unknown,
  pieceId: unknown
): Promise<CreditState & { allowed: boolean }> {
  const device = cleanId(deviceId);
  const piece = cleanId(pieceId);
  if (!dbConfigured() || !device || !piece) {
    return { used: 0, left: FREE_CREDITS, counted: false, allowed: true };
  }
  try {
    const before = await creditState(device, piece);
    if (before.counted) return { ...before, allowed: true };
    if (before.used >= FREE_CREDITS) return { ...before, allowed: false };
    await query(
      `INSERT INTO finished_pieces (device_id, piece_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [device, piece]
    );
    const after = await creditState(device, piece);
    return { ...after, allowed: true };
  } catch {
    return { used: 0, left: FREE_CREDITS, counted: false, allowed: true };
  }
}

/** May this request use the AI at all? Pro always may; free writers may until spent. */
export async function mayUseAi(
  isPro: boolean,
  deviceId: unknown,
  pieceId?: unknown
): Promise<boolean> {
  if (isPro || !dbConfigured()) return true;
  const state = await creditState(deviceId, pieceId);
  return state.counted || state.used < FREE_CREDITS;
}
