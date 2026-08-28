import { useEffect, useState } from "react";
import type { GenreId, Grade, Project } from "./types";
import Welcome from "./components/Welcome";
import Home from "./components/Home";
import Studio from "./components/Studio";
import Lessons from "./components/Lessons";

const STORAGE_KEY = "maple-writing-coach-v1";

interface PersistedState {
  name: string;
  grade: Grade | null;
  project: Project | null;
  lessonsDone: Record<string, boolean>;
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        name: typeof parsed.name === "string" ? parsed.name : "",
        grade: [1, 2, 3, 4, 5, 6].includes(parsed.grade) ? parsed.grade : null,
        project: parsed.project ?? null,
        lessonsDone: parsed.lessonsDone ?? {},
      };
    }
  } catch {
    // Corrupt or unavailable storage — start fresh.
  }
  return { name: "", grade: null, project: null, lessonsDone: {} };
}

type View = "home" | "studio" | "lessons";

export default function App() {
  const [state, setState] = useState<PersistedState>(loadState);
  const [view, setView] = useState<View>("home");

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
    setState((s) => ({ ...s, project }));
    setView("studio");
  };

  if (view === "studio" && state.project) {
    return (
      <Studio
        project={state.project}
        studentName={state.name}
        onUpdate={(updater) =>
          setState((s) => (s.project ? { ...s, project: updater(s.project) } : s))
        }
        onExit={() => setView("home")}
        onNewPiece={() => {
          setState((s) => ({ ...s, project: null }));
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

  return (
    <Home
      name={state.name}
      grade={state.grade}
      project={state.project}
      onNewProject={startProject}
      onContinue={() => setView("studio")}
      onLessons={() => setView("lessons")}
      onChangeGrade={() => setState((s) => ({ ...s, grade: null }))}
    />
  );
}
