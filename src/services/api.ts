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

export async function fetchReportCard(payload: {
  grade: Grade;
  genre: GenreId;
  topic: string;
  studentName?: string;
  draft: string;
  checklist: string[];
  piece: string;
}): Promise<ReportCard> {
  const res = await fetch("/api/report-card", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, device: deviceId() }),
  });
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
