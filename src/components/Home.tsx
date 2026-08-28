import { useState } from "react";
import type { GenreId, GenreInfo, Grade, Project } from "../types";
import { genresForGrade, sparksFor } from "../data/curriculum";
import { ArrowLeftIcon, ArrowRightIcon, GenreIcon, GymIcon, HL_CYCLE, LeafIcon } from "./icons";

interface Props {
  name: string;
  grade: Grade;
  project: Project | null;
  onNewProject: (genre: GenreId, topic: string) => void;
  onContinue: () => void;
  onLessons: () => void;
  onChangeGrade: () => void;
}

export default function Home({ name, grade, project, onNewProject, onContinue, onLessons, onChangeGrade }: Props) {
  const [picking, setPicking] = useState<GenreInfo | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const genres = genresForGrade(grade);

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-5xl mx-auto">
      <header className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-hy border-2 border-ink flex items-center justify-center">
            <LeafIcon size={20} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Hi{name ? `, ` : ""}
            {name && <span className="hl-y px-1">{name}</span>}!
          </h1>
        </div>
        <button
          onClick={onChangeGrade}
          className="border-2 border-ink rounded-full px-4 py-2 font-bold text-sm hover:bg-soft transition"
        >
          Grade {grade}
        </button>
      </header>
      <p className="text-stone-500 text-lg mb-8">What are we writing today?</p>
      <div className="h-0.5 bg-ink mb-8" />

      {project && !picking && (
        <button
          onClick={onContinue}
          className="w-full mb-8 border-2 border-ink rounded-lg p-5 text-left hover:bg-soft transition flex items-center justify-between gap-4"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">
              Continue writing
            </div>
            <div className="font-extrabold text-xl">
              <span className="hl-b px-1">{project.topic || "My piece"}</span>
            </div>
            <div className="text-sm text-stone-500 capitalize mt-1">
              {project.genre} · {project.stage} step
            </div>
          </div>
          <ArrowRightIcon size={24} />
        </button>
      )}

      {!picking ? (
        <>
          <h2 className="font-extrabold text-xl mb-4">
            <span className="hl-g px-1">Start something new</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {genres.map((g, i) => (
              <button
                key={g.id}
                onClick={() => {
                  setPicking(g);
                  setCustomTopic("");
                }}
                className="border-2 border-line hover:border-ink rounded-lg p-5 text-left transition group"
              >
                <GenreIcon genre={g.id} size={26} className="mb-3 text-ink" />
                <div className="font-extrabold text-lg">
                  <span className={`${HL_CYCLE[i % HL_CYCLE.length]} px-0.5`}>{g.name}</span>
                </div>
                <div className="text-xs text-stone-500 leading-snug mt-1">{g.tagline}</div>
              </button>
            ))}
          </div>

          <button
            onClick={onLessons}
            className="w-full border-2 border-ink rounded-lg p-5 text-left hover:bg-soft transition flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <GymIcon size={28} />
              <div>
                <div className="font-extrabold text-xl">
                  <span className="hl-p px-1">Skill Gym</span>
                </div>
                <div className="text-sm text-stone-500 mt-0.5">
                  Quick workouts: topic sentences, hamburger paragraphs, word power-ups and more
                </div>
              </div>
            </div>
            <ArrowRightIcon size={24} />
          </button>
        </>
      ) : (
        <div className="pop-in">
          <button
            onClick={() => setPicking(null)}
            className="flex items-center gap-1.5 text-sm font-bold text-stone-400 hover:text-ink mb-4 transition"
          >
            <ArrowLeftIcon size={15} /> Back
          </button>
          <h2 className="font-extrabold text-2xl mb-1 flex items-center gap-3">
            <GenreIcon genre={picking.id} size={26} />
            <span>
              {picking.name}: <span className="hl-y px-1">pick a topic</span>
            </span>
          </h2>
          <p className="text-stone-500 mb-6">Choose a spark, or bring your own idea.</p>
          <div className="grid md:grid-cols-2 gap-2.5 mb-6">
            {sparksFor(picking.id, grade).map((spark) => (
              <button
                key={spark}
                onClick={() => onNewProject(picking.id, spark)}
                className="text-left border-2 border-line hover:border-ink rounded-lg px-4 py-3.5 font-semibold transition"
              >
                {spark}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (customTopic.trim()) onNewProject(picking.id, customTopic.trim());
            }}
          >
            <input
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              maxLength={200}
              placeholder="My own idea…"
              className="flex-1 rounded-full border-2 border-ink px-5 py-3 focus:outline-none focus:ring-4 focus:ring-hy"
            />
            <button
              type="submit"
              disabled={!customTopic.trim()}
              className="bg-ink hover:bg-stone-700 disabled:opacity-30 text-white font-bold rounded-full px-7 transition flex items-center gap-2"
            >
              Go <ArrowRightIcon size={16} className="text-hy" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
