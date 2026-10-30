import { useEffect, useRef, useState } from "react";
import type { ScoreEntry } from "../types";
import type { Score } from "../lib/score";
import { ChevronDownIcon, SparkleIcon, TrendDownIcon, TrendUpIcon } from "./icons";

interface Props {
  /** Null until a report card has ever been written for this piece. */
  score: Score | null;
  /** True once the draft has changed since the card was written. */
  stale: boolean;
  history: ScoreEntry[];
  loading: boolean;
  /** Re-grade the piece, turning provisional fixes into a graded score. */
  onRecheck: () => void;
}

/**
 * Count from the old number to the new one so a change is something the writer
 * watches happen rather than something they have to spot. Honoured only when
 * the reader hasn't asked for reduced motion.
 */
function useCountUp(target: number | null, ms = 700): number | null {
  const [shown, setShown] = useState<number | null>(target);
  const fromRef = useRef<number | null>(target);

  useEffect(() => {
    const from = fromRef.current;
    fromRef.current = target;
    if (target === null) {
      setShown(null);
      return;
    }
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (from === null || from === target || reduce) {
      setShown(target);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);

  return shown;
}

function Delta({ value, size = 11 }: { value: number; size?: number }) {
  if (value === 0) return null;
  const up = value > 0;
  const Icon = up ? TrendUpIcon : TrendDownIcon;
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-extrabold tabular-nums px-1 ${up ? "hl-g" : "hl-p"}`}
      style={{ fontSize: size }}
    >
      <Icon size={size} />
      {up ? "+" : "−"}
      {Math.abs(value)}
    </span>
  );
}

/** Four pips per dimension: solid where it was graded, fluoro where fixes lifted it. */
function Pips({ baseLevel, level }: { baseLevel: number; level: number }) {
  const lifted = Math.round(level);
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`w-3.5 h-2 rounded-full ${
            i <= baseLevel ? "bg-ink" : i <= lifted ? "bg-hg border border-ink" : "bg-line"
          }`}
        />
      ))}
    </span>
  );
}

export default function ScoreBadge({ score, stale, history, loading, onRecheck }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const shown = useCountUp(score ? score.points : null);

  // The change between the last two graded cards — what "submitting again" moved.
  const lastGraded = history.length >= 2 ? history[history.length - 1].points - history[history.length - 2].points : 0;
  // While the student is fixing sentences, their own work is the live delta.
  const chipValue = stale ? 0 : score?.gain ? score.gain : lastGraded;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const recent = history.slice(-6);
  const barHeight = (points: number) => 8 + ((Math.max(0, Math.min(100, points)) - 40) / 60) * 40;

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={score ? `My score: ${score.points} out of 100. ${score.band.label}.` : "My score — not graded yet"}
        className="border-2 border-ink rounded-lg pl-3 pr-2 py-1.5 hover:bg-soft transition flex items-center gap-2"
      >
        <span className="text-left">
          <span className="flex items-baseline gap-0.5">
            {loading && !score ? (
              <span className="py-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </span>
            ) : (
              <>
                <span
                  className={`font-extrabold text-2xl tabular-nums leading-none ${stale ? "text-stone-300" : ""}`}
                  aria-hidden="true"
                >
                  {shown ?? "—"}
                </span>
                <span className="text-[10px] font-bold text-stone-400">/100</span>
              </>
            )}
          </span>
          <span className="block text-[10px] font-bold uppercase tracking-widest mt-1 whitespace-nowrap">
            {!score ? (
              <span className="text-stone-400">My score</span>
            ) : stale ? (
              <span className="text-stone-400">Needs re-check</span>
            ) : (
              <span className={`${score.band.hl} px-0.5`}>{score.band.label}</span>
            )}
          </span>
        </span>
        {score && <Delta value={chipValue} />}
        <ChevronDownIcon size={14} className={`text-stone-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Announce changes for screen readers without duplicating the visual number. */}
      <span className="sr-only" aria-live="polite">
        {score && !stale ? `Score ${score.points} out of 100, ${score.band.label}` : ""}
      </span>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-40 w-[330px] max-w-[85vw] bg-white border-2 border-ink rounded-lg p-4 shadow-[4px_4px_0_rgba(28,25,23,0.12)] pop-in">
          {!score ? (
            <p className="text-[13.5px] leading-relaxed text-stone-600">
              Your score arrives when you finish your draft and Coach Maple writes your report card. Then every
              fix you make here moves the number.
            </p>
          ) : (
            <>
              {stale && (
                <div className="border-2 border-ink rounded-lg p-3 mb-3">
                  <p className="text-[12.5px] leading-relaxed mb-2.5">
                    You've changed your writing since this score. Ask Coach Maple to read it again for a fresh
                    one.
                  </p>
                  <button
                    onClick={() => {
                      setOpen(false);
                      onRecheck();
                    }}
                    disabled={loading}
                    className="w-full border-2 border-ink rounded-full py-2 font-bold text-[13px] hover:bg-hy disabled:opacity-40 transition flex items-center justify-center gap-1.5"
                  >
                    <SparkleIcon size={14} /> Re-check my score
                  </button>
                </div>
              )}

              <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                {stale ? "Your last score" : "How your score adds up"}
              </div>
              <ul className="space-y-2 mb-3">
                {score.rows.map((row) => (
                  <li key={row.dimension} className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[13px] truncate">{row.dimension}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <Pips baseLevel={row.baseLevel} level={row.level} />
                      <span className="text-[12px] font-extrabold tabular-nums w-7 text-right">
                        {Math.round(row.points)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              {score.issues > 0 && (
                <p className="text-[12.5px] text-stone-600 leading-relaxed mb-3">
                  You've fixed <strong className="tabular-nums">{score.resolved}</strong> of{" "}
                  <strong className="tabular-nums">{score.issues}</strong> notes. Fixing every note in a row
                  carries it all the way to four.
                </p>
              )}

              {score.gain !== 0 && !stale && (
                <div className="border-2 border-line rounded-lg p-3 mb-3">
                  <p className="text-[12.5px] leading-relaxed mb-2.5">
                    Your fixes are worth <Delta value={score.gain} size={12} /> so far. That's a{" "}
                    <strong>guess</strong> — ask Coach Maple to read your new sentences to make it real.
                  </p>
                  <button
                    onClick={() => {
                      setOpen(false);
                      onRecheck();
                    }}
                    disabled={loading}
                    className="w-full border-2 border-ink rounded-full py-2 font-bold text-[13px] hover:bg-hy disabled:opacity-40 transition flex items-center justify-center gap-1.5"
                  >
                    <SparkleIcon size={14} /> Re-check my score
                  </button>
                </div>
              )}

              {recent.length >= 2 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                    Every time you checked
                  </div>
                  <div className="flex items-end justify-center gap-3 h-16 mb-1.5">
                    {recent.map((entry, i) => (
                      <span key={entry.at} className="flex-1 max-w-[42px] flex flex-col items-center justify-end gap-1">
                        <span className="text-[10px] font-extrabold tabular-nums text-stone-400">
                          {entry.points}
                        </span>
                        <span
                          className={`w-full rounded-sm ${i === recent.length - 1 ? "bg-hg border-2 border-ink" : "bg-line"}`}
                          style={{ height: barHeight(entry.points) }}
                        />
                      </span>
                    ))}
                  </div>
                  <p className="text-[11.5px] text-stone-500 font-semibold text-center">
                    {lastGraded === 0
                      ? "Same as last check — keep going."
                      : lastGraded > 0
                        ? `Up ${lastGraded} since your last check!`
                        : `Down ${Math.abs(lastGraded)} since your last check.`}
                  </p>
                </div>
              )}

              <p className="text-[11px] text-stone-400 leading-relaxed mt-3 pt-3 border-t-2 border-line">
                Each row is scored 1–4 like your report card. A 1 is worth 40 and a 4 is worth 100.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
