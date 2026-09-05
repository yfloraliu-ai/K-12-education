import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CommentKind, ReportCard, SentenceMark } from "../types";
import { CheckIcon, XIcon } from "./icons";

interface Props {
  draft: string;
  card: ReportCard;
  marks: Record<number, SentenceMark>;
  /** Replace one sentence in the draft with the student's own rewrite. */
  onRevise: (index: number, start: number, end: number, newText: string) => void;
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

export default function AnnotatedDraft({ draft, card, marks, onRevise, onMark }: Props) {
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
                {mark === "revised" && <span className="text-hg font-extrabold"> ✓</span>}
              </button>
            );
          })}
        </div>

        {open && openSegment && pos && (
          <div
            ref={popoverRef}
            className="absolute z-20 bg-white border-2 border-ink rounded-lg p-4 shadow-[4px_4px_0_rgba(28,25,23,0.12)] pop-in"
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

            <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-1.5">
              Your fix — you write it
            </label>
            <textarea
              value={rewrite}
              onChange={(e) => setRewrite(e.target.value)}
              rows={3}
              className="w-full rounded-lg border-2 border-line focus:border-ink focus:outline-none px-3 py-2 text-[14px] leading-relaxed resize-y mb-2.5"
            />

            <div className="flex gap-2">
              <button
                disabled={!rewrite.trim() || rewrite.trim() === openSegment.text}
                onClick={() => {
                  onRevise(openSegment.index, openSegment.start, openSegment.end, rewrite.trim());
                  setOpenIndex(null);
                }}
                className="flex-1 bg-ink hover:bg-stone-700 disabled:opacity-30 text-white font-bold text-[13px] rounded-full py-2 transition flex items-center justify-center gap-1.5"
              >
                <CheckIcon size={14} className="text-hy" /> Save my fix
              </button>
              <button
                onClick={() => {
                  onMark(openSegment.index, marks[openSegment.index] === "kept" ? null : "kept");
                  setOpenIndex(null);
                }}
                className="border-2 border-ink rounded-full px-4 py-2 font-bold text-[13px] hover:bg-hy transition"
              >
                {marks[openSegment.index] === "kept" ? "Undo" : "Keep it"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
