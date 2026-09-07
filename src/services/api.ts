import type { ChatMessage, CoachAction, Grade, GenreId, ReportCard, Stage } from "../types";
import { deviceId } from "./account";

export interface CoachPayload {
  grade: Grade;
  genre: GenreId;
  stage: Stage;
  topic: string;
  studentName?: string;
  plan: Record<string, string>;
  draft: string;
  messages: ChatMessage[];
  action: CoachAction;
  checklist: string[];
  piece: string;
}

/** Report cards are the slowest call in the app; never let one hang forever. */
const REPORT_CARD_TIMEOUT_MS = 75_000;

export async function fetchReportCard(payload: {
  grade: Grade;
  genre: GenreId;
  topic: string;
  studentName?: string;
  draft: string;
  checklist: string[];
  piece: string;
}): Promise<ReportCard> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), REPORT_CARD_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch("/api/report-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, device: deviceId() }),
      signal: abort.signal,
    });
  } catch (error) {
    if (abort.signal.aborted) {
      throw new Error("That took too long. Tap Try again — it is usually quicker the second time.");
    }
    throw error instanceof Error ? error : new Error("The report card couldn't be written.");
  } finally {
    clearTimeout(timer);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `The report card couldn't be written (HTTP ${res.status}).`);
  }
  return data as ReportCard;
}

export async function askCoach(payload: CoachPayload): Promise<string> {
  const res = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, device: deviceId() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `The coach couldn't answer (HTTP ${res.status}).`);
  }
  return String(data.reply ?? "");
}
