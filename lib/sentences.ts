/**
 * Sentence splitting for the report card.
 *
 * The server splits the draft rather than asking the model to, for two
 * reasons: every sentence is then guaranteed an entry (the model used to quietly
 * stop partway through a long piece), and each "text" is copied from the draft
 * byte for byte, so the app can always locate it to draw the underline. A model
 * that paraphrases one sentence used to lose that sentence's feedback silently.
 */

export interface Sentence {
  text: string;
  /** Offsets into the original draft, with surrounding whitespace excluded. */
  start: number;
  end: number;
}

/**
 * Words that take a full stop without ending a sentence. Deliberately short:
 * a wrong merge HIDES a sentence (it never gets its own feedback), while a
 * wrong split still gives feedback on both halves. So anything that is also a
 * plain word a child ends a sentence with — "no", "am", "pm", "co" — stays
 * out, which is why "He only ate at 7 AM, Noon, and 5 PM." breaks correctly.
 */
const ABBREVIATIONS = new Set([
  "mr", "mrs", "ms", "dr", "prof", "st", "mt", "jr", "sr", "vs", "etc",
  "a.m", "p.m", "e.g", "i.e", "u.s", "u.k",
]);

const TERMINATORS = new Set([".", "!", "?", "…"]);
/** Quotes and brackets that may close after the full stop. */
const CLOSERS = new Set(['"', "'", "”", "’", ")", "]", "」", "』", "»"]);

/** The word immediately before a full stop, lower-cased and without its trailing dot. */
function wordBefore(text: string, dotIndex: number): string {
  let i = dotIndex - 1;
  while (i >= 0 && /[A-Za-z.]/.test(text[i])) i--;
  return text.slice(i + 1, dotIndex).toLowerCase();
}

/** Does a full stop here end a sentence, or is it a decimal, initial or abbreviation? */
function endsSentence(draft: string, i: number): boolean {
  const char = draft[i];
  if (char === "." ) {
    // 3.5, $1.99 — a stop between digits is never a sentence end.
    if (/\d/.test(draft[i - 1] ?? "") && /\d/.test(draft[i + 1] ?? "")) return false;
    const word = wordBefore(draft, i);
    // "J. K. Rowling" — a lone capital is an initial, not a sentence.
    if (/^[a-z]$/.test(word)) return false;
    if (ABBREVIATIONS.has(word)) return false;
  }
  return true;
}

/**
 * Split a draft into sentences. Blank lines always break, as do terminators
 * followed by whitespace — a line break counts, so a student who presses Enter
 * after every sentence still gets one entry each.
 */
export function splitSentences(draft: string, max = 120): Sentence[] {
  const out: Sentence[] = [];
  let start = 0;

  const push = (from: number, to: number) => {
    const slice = draft.slice(from, to);
    const lead = slice.length - slice.trimStart().length;
    const text = slice.trim();
    if (text) out.push({ text, start: from + lead, end: from + lead + text.length });
  };

  for (let i = 0; i < draft.length && out.length < max; i++) {
    const char = draft[i];

    // A blank line is a hard boundary even without punctuation — it catches
    // headings and the last line of a piece that forgot its full stop.
    if (char === "\n" && /^[ \t]*\n/.test(draft.slice(i + 1))) {
      push(start, i);
      let j = i + 1;
      while (j < draft.length && /\s/.test(draft[j])) j++;
      start = j;
      i = j - 1;
      continue;
    }

    if (!TERMINATORS.has(char) || !endsSentence(draft, i)) continue;

    // Swallow a run of terminators ("?!", "...") and any closing quote.
    let end = i;
    while (end + 1 < draft.length && TERMINATORS.has(draft[end + 1])) end++;
    while (end + 1 < draft.length && CLOSERS.has(draft[end + 1])) end++;

    const next = draft[end + 1];
    // End of piece, or whitespace before whatever comes next.
    if (next === undefined || /\s/.test(next)) {
      push(start, end + 1);
      let j = end + 1;
      while (j < draft.length && /\s/.test(draft[j])) j++;
      start = j;
      i = j - 1;
    }
  }

  if (out.length < max) push(start, draft.length);
  return out;
}
