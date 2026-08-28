import type { ChatMessage, CoachAction, Grade, GenreId, Stage } from "../types";

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
}

export async function askCoach(payload: CoachPayload): Promise<string> {
  const res = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `The coach couldn't answer (HTTP ${res.status}).`);
  }
  return String(data.reply ?? "");
}
