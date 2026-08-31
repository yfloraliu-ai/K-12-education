import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import type { CoachAction, Project, Stage } from "../types";
import { GENRES, checklistForGrade, plannerForGrade } from "../data/curriculum";
import { askCoach, fetchReportCard } from "../services/api";
import CoachChat from "./CoachChat";
import Checklist from "./Checklist";
import ReportCard from "./ReportCard";
import {
  ArrowRightIcon,
  CopyIcon,
  GenreIcon,
  HL_CYCLE,
  HomeIcon,
  MagnifierIcon,
  MarkerCircle,
  MARKERS,
  PrinterIcon,
  SparkleIcon,
  StarIcon,
  StretchIcon,
  WandIcon,
} from "./icons";

interface Props {
  project: Project;
  studentName: string;
  onUpdate: (updater: (p: Project) => Project) => void;
  onExit: () => void;
  onNewPiece: () => void;
}

const STAGES: { id: Stage; label: string }[] = [
  { id: "plan", label: "Plan" },
  { id: "draft", label: "Draft" },
  { id: "polish", label: "Polish" },
  { id: "shine", label: "Shine" },
];

const POLISH_TOOLS: {
  action: CoachAction;
  label: string;
  desc: string;
  hl: string;
  icon: typeof WandIcon;
}[] = [
  { action: "word-lift", label: "Word Lift", desc: "Power up a tired word", hl: "hl-y", icon: WandIcon },
  { action: "sentence-stretch", label: "Sentence Stretcher", desc: "Grow a short sentence", hl: "hl-b", icon: StretchIcon },
  { action: "elaborate", label: "Detail Detective", desc: "Find a spot that needs more", hl: "hl-g", icon: MagnifierIcon },
  { action: "feedback", label: "Star Feedback", desc: "2 glows + 1 grow", hl: "hl-p", icon: StarIcon },
];

const FLUORO = [MARKERS.y, MARKERS.p, MARKERS.g, MARKERS.b];

export default function Studio({ project, studentName, onUpdate, onExit, onNewPiece }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const genre = GENRES.find((g) => g.id === project.genre)!;
  const plannerFields = plannerForGrade(genre, project.grade);
  const checklist = checklistForGrade(genre, project.grade);
  const wordCount = project.draft.trim() ? project.draft.trim().split(/\s+/).length : 0;

  // Keep a ref of the latest project so async coach calls save against fresh state.
  const projectRef = useRef(project);
  projectRef.current = project;

  const callCoach = useCallback(
    async (action: CoachAction, userText?: string) => {
      if (busy) return;
      setBusy(true);
      setError(null);
      const p = projectRef.current;
      const outgoing = userText ? [...p.messages, { role: "user" as const, content: userText }] : p.messages;
      if (userText) {
        onUpdate((prev) => ({ ...prev, messages: outgoing, updatedAt: Date.now() }));
      }
      try {
        const reply = await askCoach({
          grade: p.grade,
          genre: p.genre,
          stage: p.stage,
          topic: p.topic,
          studentName,
          plan: p.plan,
          draft: p.draft,
          messages: outgoing,
          action,
          checklist: checklist.map((c) => c.text),
        });
        onUpdate((prev) => ({
          ...prev,
          messages: [...(userText ? outgoing : prev.messages), { role: "assistant", content: reply }],
          kickedOff: action === "kickoff" ? { ...prev.kickedOff, [p.stage]: true } : prev.kickedOff,
          updatedAt: Date.now(),
        }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        setBusy(false);
      }
    },
    [busy, onUpdate, studentName]
  );

  // Kick off each stage with a coach greeting, once per stage. The tried-set
  // guard stops a failed kickoff (e.g. missing API key) from retrying forever.
  const kickoffTried = useRef<Partial<Record<Stage, boolean>>>({});
  useEffect(() => {
    if (!project.kickedOff[project.stage] && !kickoffTried.current[project.stage] && !busy) {
      kickoffTried.current[project.stage] = true;
      callCoach("kickoff");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.stage, busy]);

  // Fluoro confetti when the piece reaches Shine!
  useEffect(() => {
    if (project.stage === "shine") {
      confetti({ particleCount: 130, spread: 80, origin: { y: 0.6 }, colors: FLUORO });
    }
  }, [project.stage]);

  // Report card: written once per finished draft; re-written if the draft
  // changed since (e.g. the student went back to Polish and edited).
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const reportRequested = useRef<string | null>(null);

  const loadReportCard = useCallback(async () => {
    const p = projectRef.current;
    if (!p.draft.trim()) return;
    reportRequested.current = p.draft;
    setReportLoading(true);
    setReportError(null);
    try {
      const card = await fetchReportCard({
        grade: p.grade,
        genre: p.genre,
        topic: p.topic,
        studentName,
        draft: p.draft,
        checklist: checklistForGrade(GENRES.find((g) => g.id === p.genre)!, p.grade).map((c) => c.text),
      });
      onUpdate((prev) => ({ ...prev, reportCard: { draft: p.draft, card }, updatedAt: Date.now() }));
    } catch (e) {
      reportRequested.current = null;
      setReportError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setReportLoading(false);
    }
  }, [onUpdate, studentName]);

  useEffect(() => {
    if (
      project.stage === "shine" &&
      project.draft.trim() &&
      project.reportCard?.draft !== project.draft &&
      reportRequested.current !== project.draft &&
      !reportLoading
    ) {
      loadReportCard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.stage]);

  const setStage = (stage: Stage) => onUpdate((p) => ({ ...p, stage, updatedAt: Date.now() }));

  const stageIndex = STAGES.findIndex((s) => s.id === project.stage);

  return (
    <div className="min-h-screen p-3 md:p-6 max-w-6xl mx-auto flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-end gap-4 mb-3 flex-wrap">
        <button
          onClick={onExit}
          aria-label="Home"
          className="w-10 h-10 border-2 border-ink rounded-full flex items-center justify-center hover:bg-soft transition shrink-0"
        >
          <HomeIcon size={17} />
        </button>
        <div className="flex-1 min-w-[220px]">
          <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
            <GenreIcon genre={project.genre} size={13} /> {genre.name} · Grade {project.grade}
          </div>
          <div className="font-extrabold text-xl md:text-2xl leading-tight tracking-tight">
            <span className="hl-y px-1">{project.topic}</span>
          </div>
        </div>
        <nav className="flex items-center gap-4 md:gap-6 pb-1">
          {STAGES.map((s, i) => {
            const isActive = project.stage === s.id;
            const isDone = i < stageIndex;
            return (
              <button key={s.id} onClick={() => setStage(s.id)} className="transition">
                <MarkerCircle active={isActive} color={MARKERS.p}>
                  <span
                    className={
                      isActive
                        ? "font-extrabold text-[15px]"
                        : isDone
                          ? "font-semibold text-sm text-stone-300 line-through"
                          : "font-semibold text-sm text-stone-300"
                    }
                  >
                    {s.label}
                  </span>
                </MarkerCircle>
              </button>
            );
          })}
        </nav>
      </header>
      <div className="h-0.5 bg-ink mb-4" />

      <div className="grid lg:grid-cols-[1fr_400px] gap-4 flex-1 min-h-0">
        {/* Left: stage workspace */}
        <div className="space-y-4 overflow-y-auto pr-1">
          {project.stage === "plan" && (
            <div className="bg-white rounded-lg border-2 border-ink p-5">
              <h2 className="font-extrabold text-xl mb-1">
                <span className="hl-b px-1">Plan it out</span>
              </h2>
              <p className="text-sm text-stone-500 mb-5">
                Fill the boxes with your ideas — words and short notes are perfect. Ask Coach Maple if you're stuck.
              </p>
              <div className="space-y-4">
                {plannerFields.map((f, i) => (
                  <div key={f.id}>
                    <label className="font-bold text-[15px]">
                      <span className={`${HL_CYCLE[i % HL_CYCLE.length]} px-0.5`}>{f.label}</span>
                    </label>
                    <textarea
                      value={project.plan[f.id] ?? ""}
                      onChange={(e) =>
                        onUpdate((p) => ({
                          ...p,
                          plan: { ...p.plan, [f.id]: e.target.value },
                          updatedAt: Date.now(),
                        }))
                      }
                      placeholder={f.hint}
                      rows={2}
                      className="mt-1.5 w-full rounded-lg border-2 border-line focus:border-ink focus:outline-none px-3 py-2 text-[15px] resize-y"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStage("draft")}
                className="mt-5 w-full bg-ink hover:bg-stone-700 text-white font-bold text-[15px] rounded-full py-3.5 transition flex items-center justify-center gap-2"
              >
                My plan is ready — let's draft <ArrowRightIcon size={17} className="text-hy" />
              </button>
            </div>
          )}

          {(project.stage === "draft" || project.stage === "polish") && (
            <>
              {project.stage === "polish" && (
                <div className="bg-white rounded-lg border-2 border-ink p-4">
                  <div className="grid grid-cols-2 gap-2.5">
                    {POLISH_TOOLS.map((t) => {
                      const ToolIcon = t.icon;
                      return (
                        <button
                          key={t.action}
                          onClick={() => callCoach(t.action)}
                          disabled={busy || !project.draft.trim()}
                          className="border-2 border-line hover:border-ink rounded-lg p-3 text-left transition disabled:opacity-40 flex items-start gap-2.5"
                        >
                          <ToolIcon size={18} className="mt-0.5 shrink-0" />
                          <span>
                            <span className={`block font-bold text-[14px] w-fit ${t.hl} px-0.5`}>{t.label}</span>
                            <span className="block text-xs text-stone-500 mt-0.5">{t.desc}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg border-2 border-ink p-5 flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-extrabold text-lg">
                    <span className={`${project.stage === "draft" ? "hl-y" : "hl-p"} px-1`}>
                      {project.stage === "draft" ? "Write your draft" : "Make it sparkle"}
                    </span>
                  </h2>
                  <span className="text-xs font-bold text-stone-400">{wordCount} words</span>
                </div>
                {Object.values(project.plan).some((v) => v?.trim()) && (
                  <details className="border-2 border-line rounded-lg px-4 py-2.5 text-sm">
                    <summary className="font-bold cursor-pointer select-none">Peek at my plan</summary>
                    <ul className="mt-2 space-y-1.5">
                      {plannerFields
                        .filter((f) => project.plan[f.id]?.trim())
                        .map((f) => (
                          <li key={f.id}>
                            <strong>{f.label}:</strong> {project.plan[f.id]}
                          </li>
                        ))}
                    </ul>
                  </details>
                )}
                <textarea
                  value={project.draft}
                  onChange={(e) => onUpdate((p) => ({ ...p, draft: e.target.value, updatedAt: Date.now() }))}
                  placeholder="Start writing here… remember, messy first drafts are how great writing begins!"
                  rows={project.stage === "draft" ? 14 : 10}
                  className="w-full rounded-lg border-2 border-line focus:border-ink focus:outline-none px-4 py-3 text-[16px] leading-loose resize-y"
                />
                <button
                  onClick={() => setStage(project.stage === "draft" ? "polish" : "shine")}
                  disabled={!project.draft.trim()}
                  className="w-full bg-ink hover:bg-stone-700 disabled:opacity-30 text-white font-bold text-[15px] rounded-full py-3.5 transition flex items-center justify-center gap-2"
                >
                  {project.stage === "draft" ? "Done drafting — time to polish" : "It's ready — let it shine"}
                  <ArrowRightIcon size={17} className="text-hy" />
                </button>
              </div>

              {project.stage === "polish" && (
                <Checklist
                  items={checklist}
                  checked={project.checked}
                  onToggle={(id) =>
                    onUpdate((p) => ({ ...p, checked: { ...p.checked, [id]: !p.checked[id] }, updatedAt: Date.now() }))
                  }
                />
              )}
            </>
          )}

          {project.stage === "shine" && (
            <>
              <div className="bg-white rounded-lg border-2 border-ink p-6">
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <SparkleIcon size={22} />
                    <h2 className="font-extrabold text-2xl tracking-tight">
                      You <span className="hl-y px-1">did it</span>
                      {studentName ? `, ${studentName}` : ""}!
                    </h2>
                  </div>
                  <p className="text-sm text-stone-500">
                    Here is your finished piece. Read it out loud and be proud.
                  </p>
                </div>
                <div className="border-2 border-line rounded-lg p-6 whitespace-pre-wrap text-[16px] leading-loose">
                  {project.draft}
                </div>
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => navigator.clipboard?.writeText(project.draft)}
                    className="flex-1 border-2 border-ink hover:bg-soft font-bold rounded-full py-2.5 transition flex items-center justify-center gap-2"
                  >
                    <CopyIcon size={15} /> Copy
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 border-2 border-ink hover:bg-soft font-bold rounded-full py-2.5 transition flex items-center justify-center gap-2"
                  >
                    <PrinterIcon size={15} /> Print
                  </button>
                  <button
                    onClick={onNewPiece}
                    className="flex-1 bg-ink hover:bg-stone-700 text-white font-bold rounded-full py-2.5 transition flex items-center justify-center gap-2"
                  >
                    New piece <ArrowRightIcon size={15} className="text-hy" />
                  </button>
                </div>
              </div>
              <ReportCard
                card={project.reportCard?.draft === project.draft ? project.reportCard.card : null}
                loading={reportLoading}
                error={reportError}
                onRetry={loadReportCard}
              />
              <Checklist
                items={checklist}
                checked={project.checked}
                onToggle={(id) =>
                  onUpdate((p) => ({ ...p, checked: { ...p.checked, [id]: !p.checked[id] }, updatedAt: Date.now() }))
                }
              />
            </>
          )}
        </div>

        {/* Right: coach chat */}
        <div className="h-[70vh] lg:h-auto lg:min-h-0">
          <CoachChat
            messages={project.messages}
            busy={busy}
            error={error}
            stage={project.stage}
            onSend={(text) => callCoach("chat", text)}
          />
        </div>
      </div>
    </div>
  );
}
