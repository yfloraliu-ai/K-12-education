import { useEffect, useState } from "react";
import type { GenreId, Grade, Plan, Project } from "./types";
import Welcome from "./components/Welcome";
import Home from "./components/Home";
import Studio from "./components/Studio";
import Lessons from "./components/Lessons";
import Journal from "./components/Journal";
import Paywall from "./components/Paywall";
import SignIn from "./components/SignIn";
import { fetchMe, spendCredit, type MeResponse } from "./services/account";

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

type View = "home" | "studio" | "lessons" | "journal" | "paywall" | "signin";

export default function App() {
  const [state, setState] = useState<PersistedState>(loadState);
  const [view, setView] = useState<View>("home");
  const [currentId, setCurrentId] = useState<string | null>(null);
  /** Server truth about plan and credits; null until the first fetch lands. */
  const [me, setMe] = useState<MeResponse | null>(null);
  const [signInReason, setSignInReason] = useState<"subscribe" | "restore">("restore");

  const refreshMe = () => {
    fetchMe()
      .then(setMe)
      .catch(() => setMe(null)); // offline or accounts not configured — stay local
  };

  useEffect(() => {
    refreshMe();
    // Coming back from Stripe or a sign-in link: clean the URL and re-check.
    const params = new URLSearchParams(window.location.search);
    if (params.has("upgraded") || params.has("signin") || params.has("upgrade_cancelled")) {
      window.history.replaceState({}, "", window.location.pathname);
      const timer = setTimeout(refreshMe, 1500); // give the webhook a moment
      return () => clearTimeout(timer);
    }
  }, []);

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

  const isPro = me?.pro ?? state.plan === "pro";
  // Server metering is the truth when it's switched on; otherwise the browser
  // keeps its own tally, as it did before accounts existed.
  const creditsUsed = me?.features.metered
    ? me.creditsUsed
    : state.projects.filter((p) => p.creditCounted).length;
  const creditsLeft = isPro ? FREE_CREDITS : Math.max(0, FREE_CREDITS - creditsUsed);
  // Three topics total on the free plan — a fourth needs a subscription.
  const canStartNew = isPro || creditsUsed < FREE_CREDITS;

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
        onFinish={async () => {
          if (isPro || current.creditCounted) return true;
          const allowed = await spendCredit(current.id);
          if (allowed) refreshMe();
          else setView("paywall");
          return allowed;
        }}
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

  if (view === "signin") {
    return <SignIn reason={signInReason} onExit={() => setView("home")} />;
  }

  if (view === "paywall") {
    return (
      <Paywall
        used={creditsUsed}
        total={FREE_CREDITS}
        signedIn={!!me?.signedIn}
        billingReady={!!me?.features.billing}
        onSignIn={() => {
          setSignInReason("subscribe");
          setView("signin");
        }}
        onRedeemed={() => {
          refreshMe();
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
      email={me?.email}
      accountsReady={!!me?.features.accounts}
      onSignIn={() => {
        setSignInReason("restore");
        setView("signin");
      }}
      creditsLeft={creditsLeft}
      canStartNew={canStartNew}
      onUpgrade={() => setView("paywall")}
      onJournal={() => setView("journal")}
      onLessons={() => setView("lessons")}
      onChangeGrade={() => setState((s) => ({ ...s, grade: null }))}
    />
  );
}
