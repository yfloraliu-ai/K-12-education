import { useEffect, useState } from "react";
import type { GenreId, Grade, Plan, Project } from "./types";
import Welcome from "./components/Welcome";
import Home from "./components/Home";
import Studio from "./components/Studio";
import Lessons from "./components/Lessons";
import Journal from "./components/Journal";
import Paywall from "./components/Paywall";

const STORAGE_KEY = "maple-writing-coach-v1";

/** Pieces a free writer may finish before subscribing. */
export const FREE_CREDITS = 3;

interface PersistedState {
  name: string;
  grade: Grade | null;
  projects: Project[];
  lessonsDone: Record<string, boolean>;
  plan: Plan;
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // v1 stored a single `project`; migrate it into the projects list.
      const projects: Project[] = Array.isArray(parsed.projects)
        ? parsed.projects.filter((p: Project) => p && p.id)
        : parsed.project?.id
          ? [parsed.project]
          : [];
      return {
        name: typeof parsed.name === "string" ? parsed.name : "",
        grade: [1, 2, 3, 4, 5, 6].includes(parsed.grade) ? parsed.grade : null,
        projects,
        lessonsDone: parsed.lessonsDone ?? {},
        plan: parsed.plan === "pro" ? "pro" : "free",
      };
    }
  } catch {
    // Corrupt or unavailable storage — start fresh.
  }
  return { name: "", grade: null, projects: [], lessonsDone: {}, plan: "free" };
}

type View = "home" | "studio" | "lessons" | "journal" | "paywall";

export default function App() {
  const [state, setState] = useState<PersistedState>(loadState);
  const [view, setView] = useState<View>("home");
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full/blocked — the app still works, it just won't remember.
    }
  }, [state]);

  if (!state.grade) {
    return (
      <Welcome
        onStart={(name, grade) => {
          setState((s) => ({ ...s, name, grade }));
          setView("home");
        }}
      />
    );
  }

  const isPro = state.plan === "pro";
  const creditsUsed = state.projects.filter((p) => p.creditCounted).length;
  const creditsLeft = Math.max(0, FREE_CREDITS - creditsUsed);
  // Three topics total on the free plan — a fourth needs a subscription.
  const canStartNew = isPro || state.projects.length < FREE_CREDITS;

  const startProject = (genre: GenreId, topic: string) => {
    if (!canStartNew) {
      setView("paywall");
      return;
    }
    const project: Project = {
      id: `p-${Date.now()}`,
      grade: state.grade!,
      genre,
      topic,
      plan: {},
      draft: "",
      stage: "plan",
      messages: [],
      kickedOff: {},
      checked: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setState((s) => ({ ...s, projects: [project, ...s.projects] }));
    setCurrentId(project.id);
    setView("studio");
  };

  const openProject = (id: string) => {
    setCurrentId(id);
    setView("studio");
  };

  const current = state.projects.find((p) => p.id === currentId) ?? null;

  if (view === "studio" && current) {
    return (
      <Studio
        key={current.id}
        project={current}
        studentName={state.name}
        canFinish={isPro || !!current.creditCounted || creditsLeft > 0}
        onNeedsUpgrade={() => setView("paywall")}
        onUpdate={(updater) =>
          setState((s) => ({
            ...s,
            projects: s.projects.map((p) => {
              if (p.id !== current.id) return p;
              const next = updater(p);
              // Finishing a piece spends one free credit, once.
              return next.stage === "shine" && !next.creditCounted
                ? { ...next, creditCounted: true }
                : next;
            }),
          }))
        }
        onExit={() => setView("home")}
        onNewPiece={() => {
          setCurrentId(null);
          setView("home");
        }}
      />
    );
  }

  if (view === "paywall") {
    return (
      <Paywall
        used={creditsUsed}
        total={FREE_CREDITS}
        onUnlock={() => {
          setState((s) => ({ ...s, plan: "pro" }));
          setView("home");
        }}
        onExit={() => setView("home")}
      />
    );
  }

  if (view === "lessons") {
    return (
      <Lessons
        grade={state.grade}
        completed={state.lessonsDone}
        onComplete={(id) => setState((s) => ({ ...s, lessonsDone: { ...s.lessonsDone, [id]: true } }))}
        onExit={() => setView("home")}
      />
    );
  }

  if (view === "journal") {
    return (
      <Journal
        projects={state.projects}
        starsEarned={Object.values(state.lessonsDone).filter(Boolean).length}
        onOpen={openProject}
        onDelete={(id) =>
          setState((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== id) }))
        }
        onExit={() => setView("home")}
      />
    );
  }

  return (
    <Home
      name={state.name}
      grade={state.grade}
      projects={state.projects}
      onNewProject={startProject}
      onOpenProject={openProject}
      isPro={isPro}
      creditsLeft={creditsLeft}
      canStartNew={canStartNew}
      onUpgrade={() => setView("paywall")}
      onJournal={() => setView("journal")}
      onLessons={() => setView("lessons")}
      onChangeGrade={() => setState((s) => ({ ...s, grade: null }))}
    />
  );
}
