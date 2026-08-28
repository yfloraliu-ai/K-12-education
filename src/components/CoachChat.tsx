import { useEffect, useRef, useState } from "react";
import type { ChatMessage, Stage } from "../types";
import { LeafIcon, SendIcon } from "./icons";

interface Props {
  messages: ChatMessage[];
  busy: boolean;
  error: string | null;
  stage: Stage;
  onSend: (text: string) => void;
}

/** Stage-aware quick chips so young writers don't have to type questions. */
const QUICK_CHIPS: Record<Stage, string[]> = {
  plan: ["I'm stuck", "Can you give me choices?", "Is my plan ready?"],
  draft: ["Help me start", "I'm stuck", "Is my topic sentence good?"],
  polish: ["What should I fix first?", "Is my wrap-up sentence good?"],
  shine: ["What did I do well?", "What should I practise next time?"],
};

/** The coach's **key phrases** render as highlighter strokes (see index.css). */
function renderBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

export default function CoachChat({ messages, busy, error, stage, onSend }: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    onSend(trimmed);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border-2 border-ink overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3 border-b-2 border-ink">
        <div className="w-9 h-9 rounded-full bg-hy border-2 border-ink flex items-center justify-center shrink-0">
          <LeafIcon size={18} />
        </div>
        <div>
          <div className="font-extrabold leading-tight">Coach Maple</div>
          <div className="text-xs text-stone-400 font-semibold">I highlight — you rewrite</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="pop-in max-w-[85%] bg-soft rounded-2xl rounded-br-sm px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                {m.content}
              </div>
            </div>
          ) : (
            <div
              key={i}
              className="coach-bubble pop-in max-w-[94%] border-l-[3px] border-hy pl-3.5 text-[15px] leading-relaxed whitespace-pre-wrap"
            >
              {renderBold(m.content)}
            </div>
          )
        )}
        {busy && (
          <div className="border-l-[3px] border-hy pl-3.5 py-1.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
        {error && (
          <div className="text-sm font-semibold border-2 border-ink rounded-lg px-3 py-2">
            <span className="hl-p px-0.5">Oops:</span> {error}
          </div>
        )}
      </div>

      <div className="p-3 border-t-2 border-line space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_CHIPS[stage].map((chip) => (
            <button
              key={chip}
              onClick={() => send(chip)}
              disabled={busy}
              className="text-xs font-bold border-2 border-ink rounded-full px-3 py-1.5 hover:bg-hy transition disabled:opacity-40"
            >
              {chip}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach anything…"
            className="flex-1 rounded-full border-2 border-ink px-4 py-2.5 text-[15px] focus:outline-none focus:ring-4 focus:ring-hy"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="w-11 h-11 shrink-0 bg-ink hover:bg-stone-700 text-hy rounded-full flex items-center justify-center disabled:opacity-30 transition"
          >
            <SendIcon size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
