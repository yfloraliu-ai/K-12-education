import { useState } from "react";
import type { Grade } from "../types";
import { LeafIcon, ArrowRightIcon } from "./icons";

interface Props {
  onStart: (name: string, grade: Grade) => void;
}

const GRADES: Grade[] = [1, 2, 3, 4, 5, 6];
const GRADE_HL = ["hl-y", "hl-b", "hl-g", "hl-p", "hl-y", "hl-b"];

export default function Welcome({ onStart }: Props) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="max-w-lg w-full pop-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-hy border-2 border-ink flex items-center justify-center">
            <LeafIcon size={24} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Maple <span className="hl-y px-1">Writing</span> Coach
          </h1>
        </div>
        <p className="text-stone-500 text-lg mb-8 leading-relaxed">
          Your friendly Alberta writing coach. I won't write for you — I'll help{" "}
          <strong className="hl-p px-0.5 font-bold text-ink">you</strong> become an amazing
          writer, one step at a time.
        </p>

        <label className="block font-bold mb-2">What should I call you?</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          placeholder="Your first name (optional)"
          className="w-full rounded-full border-2 border-ink px-5 py-3 mb-7 text-lg focus:outline-none focus:ring-4 focus:ring-hy"
        />

        <div className="font-bold mb-2">What grade are you in?</div>
        <div className="grid grid-cols-6 gap-2 mb-8">
          {GRADES.map((g, i) => {
            const active = grade === g;
            return (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`rounded-lg border-2 py-4 font-extrabold text-2xl transition ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-line hover:border-ink text-ink"
                }`}
              >
                <span className={active ? "" : GRADE_HL[i] + " px-1"}>{g}</span>
              </button>
            );
          })}
        </div>

        <button
          disabled={!grade}
          onClick={() => grade && onStart(name.trim(), grade)}
          className="w-full bg-ink hover:bg-stone-700 disabled:opacity-30 text-white font-bold text-lg rounded-full py-4 transition flex items-center justify-center gap-2"
        >
          Let's write <ArrowRightIcon size={20} className="text-hy" />
        </button>
      </div>
    </div>
  );
}
