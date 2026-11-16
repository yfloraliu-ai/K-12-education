import type { FixCheck, FixVerdict, ReportCard } from "../types";

interface Props {
  /** The piece as it stands now. */
  draft: string;
  card: ReportCard;
  /** Each rewritten sentence as the coach first graded it, by index. */
  originals: Record<number, string>;
  checks: Record<number, FixCheck>;
}

/**
 * The whole piece, before and after.
 *
 * The sentence-by-sentence view shows one change at a time, which is the right
 * grain for doing the work but a poor one for seeing what the work added up to.
 * A student who fixed six sentences should be able to stand back and look at
 * the two drafts side by side.
 *
 * The earlier draft is rebuilt from the sentences themselves rather than stored,
 * so pieces written before this existed get the comparison too.
 */
const VERDICT_MARK: Record<FixVerdict, string> = {
  fixed: "hl-g",
  closer: "hl-y",
  "not-yet": "hl-p",
};

type Piece =
  | { type: "gap"; text: string }
  | { type: "sentence"; index: number; now: string; before: string };

function split(draft: string, sentences: { text: string }[], originals: Record<number, string>): Piece[] {
  const out: Piece[] = [];
  let cursor = 0;
  sentences.forEach((sentence, index) => {
    const text = sentence.text.trim();
    if (!text) return;
    const at = draft.indexOf(text, cursor);
    if (at === -1) return;
    if (at > cursor) out.push({ type: "gap", text: draft.slice(cursor, at) });
    out.push({ type: "sentence", index, now: text, before: originals[index] ?? text });
    cursor = at + text.length;
  });
  if (cursor < draft.length) out.push({ type: "gap", text: draft.slice(cursor) });
  return out;
}

const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export default function BeforeAfter({ draft, card, originals, checks }: Props) {
  const pieces = split(draft, card.sentences, originals);
  const changed = pieces.filter((p) => p.type === "sentence" && p.before !== p.now).length;
  // Two identical columns teach nothing; this only earns its space once there
  // is something to compare.
  if (!changed) return null;

  const sentences = pieces.filter((p) => p.type === "sentence").length;
  const beforeText = pieces.map((p) => (p.type === "gap" ? p.text : p.before)).join("");

  return (
    <div className="bg-white rounded-lg border-2 border-ink p-5 md:p-6">
      <h2 className="font-extrabold text-xl mb-1">
        <span className="hl-g px-1">Look how far it came</span>
      </h2>
      <p className="text-[13px] text-stone-500 font-semibold mb-5">
        You changed <strong className="text-ink tabular-nums">{changed}</strong> of{" "}
        <strong className="text-ink tabular-nums">{sentences}</strong>{" "}
        {sentences === 1 ? "sentence" : "sentences"}. The marked lines are the ones you rewrote.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2 flex items-baseline justify-between gap-2">
            <span>Your first draft</span>
            <span className="tabular-nums font-extrabold">{countWords(beforeText)} words</span>
          </div>
          <div className="border-2 border-line rounded-lg p-4 text-[14.5px] leading-relaxed whitespace-pre-wrap text-stone-500 bg-soft h-full">
            {pieces.map((piece, i) =>
              piece.type === "gap" ? (
                <span key={i}>{piece.text}</span>
              ) : (
                <span key={i} className={piece.before !== piece.now ? "bg-white rounded px-0.5" : undefined}>
                  {piece.before}
                </span>
              )
            )}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2 flex items-baseline justify-between gap-2">
            <span>Your piece now</span>
            <span className="tabular-nums font-extrabold text-ink">{countWords(draft)} words</span>
          </div>
          <div className="border-2 border-ink rounded-lg p-4 text-[14.5px] leading-relaxed whitespace-pre-wrap h-full">
            {pieces.map((piece, i) => {
              if (piece.type === "gap") return <span key={i}>{piece.text}</span>;
              if (piece.before === piece.now) return <span key={i}>{piece.now}</span>;
              // Colour the rewrite by what the coach made of it, so the page
              // never calls a sentence improved that the coach did not.
              const check = checks[piece.index]?.of === piece.now ? checks[piece.index] : undefined;
              return (
                <span key={i} className={`${check ? VERDICT_MARK[check.verdict] : "hl-b"} px-0.5 font-semibold`}>
                  {piece.now}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
