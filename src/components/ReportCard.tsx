import type { CommentKind, ReportCard as ReportCardData } from "../types";
import { LeafIcon } from "./icons";

interface Props {
  card: ReportCardData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const LEVELS: Record<number, { label: string; hl: string }> = {
  1: { label: "Limited", hl: "hl-p" },
  2: { label: "Adequate", hl: "hl-y" },
  3: { label: "Proficient", hl: "hl-b" },
  4: { label: "Excellent", hl: "hl-g" },
};

const KINDS: Record<CommentKind, { label: string; hl: string }> = {
  praise: { label: "Glow", hl: "hl-g" },
  grammar: { label: "Grammar", hl: "hl-p" },
  structure: { label: "Sentence craft", hl: "hl-b" },
  vocabulary: { label: "Word choice", hl: "hl-y" },
  content: { label: "Ideas", hl: "hl-b" },
};

export default function ReportCard({ card, loading, error, onRetry }: Props) {
  return (
    <div className="bg-white rounded-lg border-2 border-ink p-5 md:p-6">
      <h2 className="font-extrabold text-xl mb-1">
        <span className="hl-y px-1">My Report Card</span>
      </h2>

      {loading && (
        <div className="py-6 text-center">
          <div className="mb-2">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
          <p className="text-stone-500 font-semibold text-sm">
            Coach Maple is reading your piece very carefully…
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="py-4">
          <p className="text-sm font-semibold mb-3">
            <span className="hl-p px-0.5">Oops:</span> {error}
          </p>
          <button
            onClick={onRetry}
            className="border-2 border-ink rounded-full px-5 py-2 font-bold text-sm hover:bg-hy transition"
          >
            Try again
          </button>
        </div>
      )}

      {card && !loading && !error && (
        <div className="space-y-6">
          {/* Rubric */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mt-3 mb-2">
              How your writing measures up
            </div>
            <ul className="space-y-3">
              {card.rubric.map((row) => {
                const meta = LEVELS[row.level] ?? LEVELS[2];
                return (
                  <li key={row.dimension} className="border-2 border-line rounded-lg p-3.5">
                    <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                      <span className="font-extrabold text-[15px]">{row.dimension}</span>
                      <span className="flex items-center gap-2">
                        <span className="flex gap-1" aria-hidden="true">
                          {[1, 2, 3, 4].map((i) => (
                            <span
                              key={i}
                              className={`w-5 h-2 rounded-full ${i <= row.level ? "bg-ink" : "bg-line"}`}
                            />
                          ))}
                        </span>
                        <span className={`text-xs font-extrabold ${meta.hl} px-1`}>{meta.label}</span>
                      </span>
                    </div>
                    <p className="text-[13.5px] leading-relaxed text-stone-600">{row.comment}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sentence-by-sentence commentary */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
              Sentence by sentence
            </div>
            <ol className="space-y-3">
              {card.sentences.map((s, i) => (
                <li key={i} className="border-l-[3px] border-line pl-4 py-0.5">
                  <p className="text-[14.5px] font-semibold leading-relaxed mb-1.5">
                    <span className="text-stone-300 font-extrabold mr-1.5">{i + 1}.</span>
                    “{s.text}”
                  </p>
                  {s.comments.length === 0 ? (
                    <p className="text-[13px] text-stone-400 font-medium">Nothing to add — this one works.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {s.comments.map((c, j) => {
                        const kind = KINDS[c.kind] ?? KINDS.content;
                        return (
                          <li key={j} className="text-[13.5px] leading-relaxed">
                            <span className={`font-extrabold text-xs ${kind.hl} px-1 mr-1.5`}>{kind.label}</span>
                            {c.note}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Overall */}
          {card.overall && (
            <div className="border-2 border-ink rounded-lg p-4 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-hy border-2 border-ink flex items-center justify-center shrink-0">
                <LeafIcon size={16} />
              </div>
              <p className="text-[14px] leading-relaxed font-medium">{card.overall}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
