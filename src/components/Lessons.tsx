import { useState } from "react";
import confetti from "canvas-confetti";
import type { Grade, Lesson } from "../types";
import { lessonsForGrade } from "../data/lessons";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, HL_CYCLE, LessonIcon, StarIcon, XIcon } from "./icons";

interface Props {
  grade: Grade;
  completed: Record<string, boolean>;
  onComplete: (lessonId: string) => void;
  onExit: () => void;
}

const FLUORO = ["#fdf151", "#ff7ad9", "#a7f95c", "#7de8ff"];

export default function Lessons({ grade, completed, onComplete, onExit }: Props) {
  const [open, setOpen] = useState<Lesson | null>(null);
  const lessons = lessonsForGrade(grade);

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-4xl mx-auto bg-white">
      <header className="mb-6">
        <button
          onClick={() => (open ? setOpen(null) : onExit())}
          className="flex items-center gap-1.5 text-sm font-bold text-stone-400 hover:text-ink mb-4 transition"
        >
          <ArrowLeftIcon size={15} /> Back
        </button>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          <span className="hl-p px-1">Skill Gym</span>
        </h1>
        <p className="text-stone-500 mt-1">Quick workouts for your writing muscles</p>
        <div className="h-0.5 bg-ink mt-5" />
      </header>

      {!open ? (
        <div className="grid md:grid-cols-2 gap-3">
          {lessons.map((lesson, i) => (
            <button
              key={lesson.id}
              onClick={() => setOpen(lesson)}
              className="border-2 border-line hover:border-ink rounded-lg p-5 text-left transition"
            >
              <div className="flex items-start justify-between mb-3">
                <LessonIcon lessonId={lesson.id} size={26} />
                {completed[lesson.id] && <StarIcon size={20} filled />}
              </div>
              <div className="font-extrabold text-lg">
                <span className={`${HL_CYCLE[i % HL_CYCLE.length]} px-0.5`}>{lesson.title}</span>
              </div>
              <div className="text-sm text-stone-500 leading-snug mt-1">{lesson.bigIdea}</div>
            </button>
          ))}
        </div>
      ) : (
        <LessonPlayer
          lesson={open}
          onDone={() => {
            onComplete(open.id);
            setOpen(null);
          }}
        />
      )}
    </div>
  );
}

function LessonPlayer({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  // Phase: -1 = concept card, 0..n-1 = quiz questions, n = done
  const [phase, setPhase] = useState(-1);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const question = phase >= 0 && phase < lesson.quiz.length ? lesson.quiz[phase] : null;
  const finished = phase >= lesson.quiz.length;

  return (
    <div className="border-2 border-ink rounded-lg p-6 pop-in bg-white">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-lg border-2 border-ink bg-hy flex items-center justify-center shrink-0">
          <LessonIcon lessonId={lesson.id} size={24} />
        </div>
        <div>
          <h2 className="font-extrabold text-2xl tracking-tight">{lesson.title}</h2>
          <p className="text-sm font-semibold text-stone-500">{lesson.bigIdea}</p>
        </div>
      </div>

      {phase === -1 && (
        <>
          <ul className="space-y-3 mb-6">
            {lesson.points.map((point, i) => (
              <li
                key={i}
                className="border-l-[3px] pl-4 py-0.5 text-[15px] leading-relaxed"
                style={{ borderColor: FLUORO[i % FLUORO.length] }}
              >
                {point}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setPhase(0)}
            className="w-full bg-ink hover:bg-stone-700 text-white font-bold text-[15px] rounded-full py-3.5 transition flex items-center justify-center gap-2"
          >
            Try the quiz <ArrowRightIcon size={17} className="text-hy" />
          </button>
        </>
      )}

      {question && (
        <>
          <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
            Question {phase + 1} of {lesson.quiz.length}
          </div>
          <div className="font-bold text-lg mb-4">{question.question}</div>
          <div className="space-y-2 mb-4">
            {question.options.map((opt, i) => {
              const isAnswer = i === question.answer;
              const isPicked = picked === i;
              let style = "border-line hover:border-ink";
              if (picked !== null) {
                if (isAnswer) style = "border-ink bg-hg";
                else if (isPicked) style = "border-ink bg-hp";
                else style = "border-line opacity-50";
              }
              return (
                <button
                  key={i}
                  disabled={picked !== null}
                  onClick={() => {
                    setPicked(i);
                    if (isAnswer) setScore((s) => s + 1);
                  }}
                  className={`w-full text-left border-2 rounded-lg px-4 py-3 text-[15px] font-medium transition flex items-center justify-between gap-3 ${style}`}
                >
                  <span>{opt}</span>
                  {picked !== null && isAnswer && <CheckIcon size={17} className="shrink-0" />}
                  {picked !== null && isPicked && !isAnswer && <XIcon size={16} className="shrink-0" />}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="pop-in border-l-[3px] border-hb pl-4 py-1 text-[15px] leading-relaxed mb-5">
              {question.explain}
            </div>
          )}
          <button
            disabled={picked === null}
            onClick={() => {
              const next = phase + 1;
              setPicked(null);
              setPhase(next);
              if (next >= lesson.quiz.length) {
                confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors: FLUORO });
              }
            }}
            className="w-full bg-ink hover:bg-stone-700 disabled:opacity-30 text-white font-bold text-[15px] rounded-full py-3.5 transition flex items-center justify-center gap-2"
          >
            {phase + 1 < lesson.quiz.length ? "Next question" : "Finish"}
            <ArrowRightIcon size={17} className="text-hy" />
          </button>
        </>
      )}

      {finished && (
        <div className="text-center py-8">
          <div className="flex justify-center mb-3">
            <StarIcon size={44} filled />
          </div>
          <div className="font-extrabold text-2xl mb-1">
            <span className="hl-y px-1">
              {score} / {lesson.quiz.length}
            </span>{" "}
            correct!
          </div>
          <p className="text-stone-500 mb-6">
            {score === lesson.quiz.length
              ? "Perfect! This skill is yours — now use it in your writing."
              : "Great practice! Try this one again another day to make it stick."}
          </p>
          <button
            onClick={onDone}
            className="bg-ink hover:bg-stone-700 text-white font-bold rounded-full py-3.5 px-10 transition"
          >
            Collect my star
          </button>
        </div>
      )}
    </div>
  );
}
