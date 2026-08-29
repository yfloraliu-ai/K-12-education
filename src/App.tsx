import { useEffect, useState } from "react";
import type { GenreId, Grade, Project } from "./types";
import Welcome from "./components/Welcome";
import Home from "./components/Home";
import Studio from "./components/Studio";
import Lessons from "./components/Lessons";
import Journal from "./components/Journal";

const STORAGE_KEY = "maple-writing-coach-v1";

interface PersistedState {
  name: string;
  grade: Grade | null;
  projects: Project[];
  lessonsDone: Record<string, boolean>;
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
      };
    }
  } catch {
    // Corrupt or unavailable storage — start fresh.
  }
  return { name: "", grade: null, projects: [], lessonsDone: {} };
}

type View = "home" | "studio" | "lessons" | "journal";

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

  const startProject = (genre: GenreId, topic: string) => {
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
        onUpdate={(updater) =>
          setState((s) => ({
            ...s,
            projects: s.projects.map((p) => (p.id === current.id ? updater(p) : p)),
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
      onJournal={() => setView("journal")}
      onLessons={() => setView("lessons")}
      onChangeGrade={() => setState((s) => ({ ...s, grade: null }))}
    />
  );
}
