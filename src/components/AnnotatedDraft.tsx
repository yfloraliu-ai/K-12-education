import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CommentKind, FixCheck, FixVerdict, ReportCard, SentenceMark } from "../types";
import { CheckIcon, SparkleIcon, XIcon } from "./icons";

interface Props {
  draft: string;
  card: ReportCard;
  marks: Record<number, SentenceMark>;
  /** Each rewritten sentence as the coach first graded it, by index. */
  originals: Record<number, string>;
  /** The coach's verdict on each rewrite, by the same index. */
  checks: Record<number, FixCheck>;
  /** The sentence the coach is reading right now, if any. */
  checking: number | null;
  checkError: string | null;
  /** Replace one sentence in the draft with the student's own rewrite. */
  onRevise: (index: number, start: number, end: number, newText: string) => void;
  /** Put a rewritten sentence back the way it was. */
  onRevert: (index: number, start: number, end: number) => void;
  onMark: (index: number, mark: SentenceMark | null) => void;
}

/** Underline colour per comment kind — the same fluoro system as the report. */
const KIND_STYLE: Record<CommentKind, { label: string; hl: string; line: string }> = {
  praise: { label: "Glow", hl: "hl-g", line: "#a7f95c" },
  grammar: { label: "Grammar", hl: "hl-p", line: "#ff7ad9" },
  structure: { label: "Sentence craft", hl: "hl-b", line: "#7de8ff" },
  vocabulary: { label: "Word choice", hl: "hl-y", line: "#fdf151" },
  content: { label: "Ideas", hl: "hl-b", line: "#7de8ff" },
};

const VERDICT_STYLE: Record<FixVerdict, { label: string; hl: string }> = {
  fixed: { label: "You fixed it", hl: "hl-g" },
  closer: { label: "Closer", hl: "hl-y" },
  "not-yet": { label: "Not yet", hl: "hl-p" },
};

/** The kind that decides a sentence's underline: fixes outrank praise. */
function leadKind(kinds: CommentKind[]): CommentKind | null {
  const order: CommentKind[] = ["grammar", "structure", "vocabulary", "content", "praise"];
  return order.find((k) => kinds.includes(k)) ?? null;
}

type Segment =
  | { type: "gap"; text: string }
  | { type: "sentence"; index: number; text: string; start: number; end: number };

/**
 * Locate each report-card sentence inside the draft, in order, so the original
 * spacing and line breaks survive and every rewrite lands at an exact offset.
 * A sentence the model reworded won't match — it stays plain text here and is
 * still listed in the report card below.
 */
function buildSegments(draft: string, sentences: { text: string }[]): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  sentences.forEach((sentence, index) => {
    const text = sentence.text.trim();
    if (!text) return;
    const at = draft.indexOf(text, cursor);
    if (at === -1) return;
    if (at > cursor) segments.push({ type: "gap", text: draft.slice(cursor, at) });
    segments.push({ type: "sentence", index, text, start: at, end: at + text.length });
    cursor = at + text.length;
  });
  if (cursor < draft.length) segments.push({ type: "gap", text: draft.slice(cursor) });
  return segments;
}

export default function AnnotatedDraft({
  draft,
  card,
  marks,
  originals,
  checks,
  checking,
  checkError,
  onRevise,
  onRevert,
  onMark,
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [rewrite, setRewrite] = useState("");
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);

  const segments = buildSegments(draft, card.sentences);
  const clickable = segments.filter((s): s is Extract<Segment, { type: "sentence" }> => s.type === "sentence");
  const handled = clickable.filter((s) => marks[s.index]).length;
  const open = openIndex === null ? null : card.sentences[openIndex];

  const place = () => {
    const anchor = anchorRef.current;
    const container = containerRef.current;
    if (!anchor || !container) return;
    const c = container.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    const width = Math.min(360, c.width);
    setPos({
      top: a.bottom - c.top + 10,
      left: Math.max(0, Math.min(a.left - c.left, c.width - width)),
    });
  };

  useLayoutEffect(place, [openIndex, draft]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (openIndex === null) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      setOpenIndex(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenIndex(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
    };
  }, [openIndex]);

  const openSentence = (index: number, el: HTMLElement, text: string) => {
    if (openIndex === index) {
      setOpenIndex(null);
      return;
    }
    anchorRef.current = el;
    setRewrite(text);
    setOpenIndex(index);
  };

  const openSegment = clickable.find((s) => s.index === openIndex);
  const isRevised = openSegment !== undefined && originals[openSegment.index] !== undefined;
  const isChecking = openSegment !== undefined && checking === openSegment.index;
  // A verdict only speaks for the wording it was given; once the student edits
  // again it is stale and the panel waits for the new answer rather than
  // showing an old "not yet" against a sentence that has since changed.
  const storedCheck = openSegment ? checks[openSegment.index] : undefined;
  const freshCheck = storedCheck && storedCheck.of === openSegment?.text ? storedCheck : undefined;
  const changed = !!openSegment && !!rewrite.trim() && rewrite.trim() !== openSegment.text;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
        <p className="text-[13px] text-stone-500 font-semibold">
          Tap any <span className="hl-y px-0.5">underlined sentence</span> to see Coach Maple's notes.
        </p>
        {clickable.length > 0 && (
          <span className="text-xs font-bold text-stone-400 tabular-nums">
            {handled}/{clickable.length} looked at
          </span>
        )}
      </div>

      <div ref={containerRef} className="relative">
        <div className="border-2 border-line rounded-lg p-6 text-[16px] leading-loose whitespace-pre-wrap">
          {segments.map((seg, i) => {
            if (seg.type === "gap") return <span key={i}>{seg.text}</span>;
            const kinds = card.sentences[seg.index].comments.map((c) => c.kind);
            const kind = leadKind(kinds);
            const mark = marks[seg.index];
            const isOpen = openIndex === seg.index;
            return (
              <button
                key={i}
                type="button"
                onClick={(e) => openSentence(seg.index, e.currentTarget, seg.text)}
                className={`inline text-left rounded transition ${isOpen ? "bg-soft" : "hover:bg-soft"}`}
                style={{
                  textDecoration: kind ? "underline" : undefined,
                  textDecorationColor: kind ? KIND_STYLE[kind].line : undefined,
                  textDecorationThickness: "3px",
                  textUnderlineOffset: "4px",
                  textDecorationStyle: mark ? "dotted" : "solid",
                  opacity: mark === "kept" ? 0.65 : 1,
                }}
              >
                {seg.text}
                {mark === "revised" &&
                  (checks[seg.index]?.verdict === "fixed" ? (
                    <span className="text-hg font-extrabold"> ✓</span>
                  ) : checks[seg.index] ? (
                    <span className="text-stone-400 font-extrabold"> ·</span>
                  ) : (
                    <span className="text-hg font-extrabold"> ✓</span>
                  ))}
              </button>
            );
          })}
        </div>

        {open && openSegment && pos && (
          <div
            ref={popoverRef}
            className="absolute z-20 bg-white border-2 border-ink rounded-lg p-4 shadow-[4px_4px_0_rgba(28,25,23,0.12)] pop-in max-h-[70vh] overflow-y-auto"
            style={{ top: pos.top, left: pos.left, width: Math.min(360, containerRef.current?.clientWidth ?? 360) }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                Sentence {openSegment.index + 1}
              </span>
              <button
                onClick={() => setOpenIndex(null)}
                aria-label="Close"
                className="text-stone-400 hover:text-ink transition"
              >
                <XIcon size={14} />
              </button>
            </div>

            {(isRevised || changed) && (
              <div className="border-2 border-line rounded-lg overflow-hidden mb-3">
                <div className="px-3 py-2 border-b-2 border-line bg-soft">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">
                    Your first try
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-stone-500">
                    {originals[openSegment.index] ?? openSegment.text}
                  </p>
                </div>
                <div className="px-3 py-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">
                    {changed ? "Your new version — not saved yet" : "Your new version"}
                  </div>
                  <p className="text-[13.5px] leading-relaxed font-semibold">
                    <span className={changed ? "hl-y px-0.5" : "hl-g px-0.5"}>
                      {changed ? rewrite.trim() : openSegment.text}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <ul className="space-y-2 mb-3">
              {open.comments.length === 0 ? (
                <li className="text-[13.5px] text-stone-500 font-medium">
                  Nothing to add — this one works.
                </li>
              ) : (
                open.comments.map((c, j) => {
                  const style = KIND_STYLE[c.kind] ?? KIND_STYLE.content;
                  return (
                    <li key={j} className="text-[13.5px] leading-relaxed">
                      <span className={`font-extrabold text-[11px] ${style.hl} px-1 mr-1.5`}>{style.label}</span>
                      {c.note}
                    </li>
                  );
                })
              )}
            </ul>

            {/* Did it work? The half of the loop that used to be missing: the
                popover stays open after a save so the answer lands here. */}
            {isChecking ? (
              <div className="border-2 border-line rounded-lg p-3 mb-3 flex items-center gap-2.5">
                <span className="shrink-0">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </span>
                <span className="text-[13px] font-semibold text-stone-500">
                  Coach Maple is reading your new sentence…
                </span>
              </div>
            ) : checkError && isRevised ? (
              <div className="border-2 border-line rounded-lg p-3 mb-3">
                <p className="text-[13px] font-semibold mb-2">
                  <span className="hl-p px-0.5">Couldn't check that:</span> {checkError}
                </p>
                <button
                  onClick={() => onRevise(openSegment.index, openSegment.start, openSegment.end, openSegment.text)}
                  className="border-2 border-ink rounded-full px-4 py-1.5 font-bold text-[12px] hover:bg-hy transition"
                >
                  Try checking again
                </button>
              </div>
            ) : freshCheck ? (
              <div className="border-2 border-ink rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <SparkleIcon size={14} />
                  <span className={`text-[11px] font-extrabold uppercase tracking-widest ${VERDICT_STYLE[freshCheck.verdict].hl} px-1`}>
                    {VERDICT_STYLE[freshCheck.verdict].label}
                  </span>
                </div>
                {freshCheck.headline && (
                  <p className="text-[13.5px] leading-relaxed font-medium mb-2">{freshCheck.headline}</p>
                )}
                <ul className="space-y-1.5">
                  {freshCheck.points.map((point, j) => {
                    const style = KIND_STYLE[point.kind] ?? KIND_STYLE.content;
                    return (
                      <li key={j} className="text-[13px] leading-relaxed flex gap-1.5">
                        <span className={`font-extrabold shrink-0 ${point.solved ? "text-hg" : "text-stone-300"}`}>
                          {point.solved ? "✓" : "○"}
                        </span>
                        <span>
                          <span className={`font-extrabold text-[11px] ${style.hl} px-1 mr-1.5`}>{style.label}</span>
                          {point.note}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {freshCheck.watchOut && (
                  <p className="text-[13px] leading-relaxed mt-2 pt-2 border-t-2 border-line">
                    <span className="font-extrabold text-[11px] hl-p px-1 mr-1.5">New thing</span>
                    {freshCheck.watchOut}
                  </p>
                )}
              </div>
            ) : null}

            <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-1.5">
              {isRevised ? "Change it again" : "Your fix — you write it"}
            </label>
            <textarea
              value={rewrite}
              onChange={(e) => setRewrite(e.target.value)}
              rows={3}
              disabled={isChecking}
              className="w-full rounded-lg border-2 border-line focus:border-ink focus:outline-none px-3 py-2 text-[14px] leading-relaxed resize-y mb-2.5 disabled:opacity-50"
            />

            <div className="flex gap-2">
              {/* "Done" is only an honest primary action once there IS something
                  done. On an untouched sentence it reads as "nothing to do here",
                  so the ask stays on screen, greyed, until they write something. */}
              {!changed && isRevised && freshCheck ? (
                <button
                  onClick={() => setOpenIndex(null)}
                  disabled={isChecking}
                  className="flex-1 bg-ink hover:bg-stone-700 disabled:opacity-30 text-white font-bold text-[13px] rounded-full py-2 transition"
                >
                  Done
                </button>
              ) : (
                <button
                  disabled={!changed || isChecking}
                  onClick={() =>
                    onRevise(openSegment.index, openSegment.start, openSegment.end, rewrite.trim())
                  }
                  className="flex-1 bg-ink hover:bg-stone-700 disabled:opacity-30 text-white font-bold text-[13px] rounded-full py-2 transition flex items-center justify-center gap-1.5"
                >
                  <CheckIcon size={14} className="text-hy" />
                  {isRevised ? "Check my new try" : "Save my fix"}
                </button>
              )}
              <button
                disabled={isChecking}
                onClick={() => {
                  if (isRevised) {
                    onRevert(openSegment.index, openSegment.start, openSegment.end);
                    setOpenIndex(null);
                  } else {
                    onMark(openSegment.index, marks[openSegment.index] === "kept" ? null : "kept");
                    setOpenIndex(null);
                  }
                }}
                className="border-2 border-ink rounded-full px-4 py-2 font-bold text-[13px] hover:bg-hy disabled:opacity-30 transition whitespace-nowrap"
              >
                {isRevised ? "Undo my fix" : marks[openSegment.index] === "kept" ? "Undo" : "Keep it"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
