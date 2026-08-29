import { useEffect, useState } from "react";
import type { Project, Stage } from "../types";
import { GENRES } from "../data/curriculum";
import { ArrowLeftIcon, CheckIcon, GenreIcon, XIcon } from "./icons";

interface Props {
  projects: Project[];
  starsEarned: number;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onExit: () => void;
}

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

const STAGE_CHIP: Record<Stage, { label: string; hl: string }> = {
  plan: { label: "Planning", hl: "hl-b" },
  draft: { label: "Drafting", hl: "hl-y" },
  polish: { label: "Polishing", hl: "hl-p" },
  shine: { label: "Finished", hl: "hl-g" },
};

function formatDate(t: number): string {
  const d = new Date(t);
  const opts: Intl.DateTimeFormatOptions =
    d.getFullYear() === new Date().getFullYear()
      ? { month: "short", day: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" };
  return d.toLocaleDateString("en-CA", opts);
}

export default function Journal({ projects, starsEarned, onOpen, onDelete, onExit }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // A pending delete-confirmation quietly expires.
  useEffect(() => {
    if (!confirmId) return;
    const t = setTimeout(() => setConfirmId(null), 3500);
    return () => clearTimeout(t);
  }, [confirmId]);

  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);
  const finished = projects.filter((p) => p.stage === "shine").length;
  const totalWords = projects.reduce((sum, p) => sum + countWords(p.draft), 0);

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-4xl mx-auto bg-white">
      <header className="mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-sm font-bold text-stone-400 hover:text-ink mb-4 transition"
        >
          <ArrowLeftIcon size={15} /> Back
        </button>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          <span className="hl-b px-1">My Journal</span>
        </h1>
        <p className="text-stone-500 mt-1">Every piece you've written — watch yourself grow</p>
        <div className="h-0.5 bg-ink mt-5" />
      </header>

      {/* Progress tiles */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="border-2 border-ink rounded-lg p-4">
          <div className="text-3xl md:text-4xl font-extrabold tabular-nums">
            <span className="hl-g px-1">{finished}</span>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mt-2">
            Pieces finished
          </div>
        </div>
        <div className="border-2 border-ink rounded-lg p-4">
          <div className="text-3xl md:text-4xl font-extrabold tabular-nums">
            <span className="hl-y px-1">{totalWords.toLocaleString("en-CA")}</span>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mt-2">
            Words written
          </div>
        </div>
        <div className="border-2 border-ink rounded-lg p-4">
          <div className="text-3xl md:text-4xl font-extrabold tabular-nums">
            <span className="hl-p px-1">{starsEarned}</span>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mt-2">
            Skill Gym stars
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="border-2 border-line rounded-lg p-10 text-center">
          <p className="font-bold text-lg mb-1">Nothing here yet!</p>
          <p className="text-stone-500 text-sm">
            Your journal fills up as you write. Head home and start your first piece.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {sorted.map((p) => {
            const chip = STAGE_CHIP[p.stage];
            const words = countWords(p.draft);
            const genreName = GENRES.find((g) => g.id === p.genre)?.name ?? p.genre;
            return (
              <li
                key={p.id}
                className="border-2 border-line hover:border-ink rounded-lg transition flex items-center gap-3 pr-3"
              >
                <button onClick={() => onOpen(p.id)} className="flex-1 text-left p-4 flex items-center gap-4 min-w-0">
                  <GenreIcon genre={p.genre} size={22} className="shrink-0" />
                  <span className="min-w-0">
                    <span className="block font-extrabold text-[16px] truncate">{p.topic}</span>
                    <span className="block text-xs text-stone-500 mt-0.5">
                      {genreName} · Grade {p.grade} · {words} {words === 1 ? "word" : "words"} ·{" "}
                      {formatDate(p.updatedAt)}
                    </span>
                  </span>
                </button>
                <span className={`shrink-0 text-xs font-bold ${chip.hl} px-1.5 py-0.5 flex items-center gap-1`}>
                  {p.stage === "shine" && <CheckIcon size={12} />}
                  {chip.label}
                </span>
                {confirmId === p.id ? (
                  <button
                    onClick={() => {
                      onDelete(p.id);
                      setConfirmId(null);
                    }}
                    className="shrink-0 text-xs font-bold border-2 border-ink bg-hp rounded-full px-3 py-1.5 transition"
                  >
                    Really delete?
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmId(p.id)}
                    aria-label="Delete piece"
                    className="shrink-0 w-8 h-8 rounded-full border-2 border-line hover:border-ink text-stone-400 hover:text-ink flex items-center justify-center transition"
                  >
                    <XIcon size={13} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
