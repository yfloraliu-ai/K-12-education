import { useState } from "react";
import { ArrowLeftIcon, CheckIcon, LeafIcon, SparkleIcon } from "./icons";

interface Props {
  /** How many free pieces the writer has finished. */
  used: number;
  total: number;
  onUnlock: () => void;
  onExit: () => void;
}

const PERKS = [
  "Write as many pieces as you like",
  "Coach Maple guides every step, every time",
  "A full report card on every finished piece",
  "Sentence-by-sentence feedback you can act on",
  "Your whole writing journal, kept and growing",
  "All six genres and the Skill Gym",
];

export default function Paywall({ used, total, onUnlock, onExit }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const redeem = () => {
    // Testing unlock until real payments are wired up.
    if (code.trim().toUpperCase() === "MAPLE-PRO") {
      onUnlock();
      return;
    }
    setError(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-3xl mx-auto bg-white">
      <button
        onClick={onExit}
        className="flex items-center gap-1.5 text-sm font-bold text-stone-400 hover:text-ink mb-6 transition"
      >
        <ArrowLeftIcon size={15} /> Back
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-full bg-hy border-2 border-ink flex items-center justify-center">
          <LeafIcon size={22} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          You've used your <span className="hl-y px-1">{used} free pieces</span>
        </h1>
      </div>
      <p className="text-stone-500 text-lg mb-8">
        Nice writing! Keep going with Maple Writing Coach Pro.
      </p>
      <div className="h-0.5 bg-ink mb-8" />

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="border-2 border-line rounded-lg p-6">
          <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
            Monthly
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-4xl font-extrabold tabular-nums">$4.99</span>
            <span className="text-sm font-bold text-stone-400">CAD / month</span>
          </div>
          <p className="text-[13px] text-stone-500">Cancel any time.</p>
        </div>

        <div className="border-2 border-ink rounded-lg p-6 relative">
          <span className="absolute -top-3 left-5 text-[11px] font-extrabold hl-g px-2 py-0.5 border-2 border-ink rounded-full bg-white">
            SAVE 17%
          </span>
          <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
            Yearly
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-4xl font-extrabold tabular-nums">$49.99</span>
            <span className="text-sm font-bold text-stone-400">CAD / year</span>
          </div>
          <p className="text-[13px] text-stone-500">Just $4.17 a month.</p>
        </div>
      </div>

      <ul className="space-y-2 mb-8">
        {PERKS.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5 text-[15px]">
            <CheckIcon size={16} className="mt-1 shrink-0" />
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      <button
        disabled
        className="w-full bg-ink text-white font-bold text-lg rounded-full py-4 mb-2 opacity-40 flex items-center justify-center gap-2"
      >
        <SparkleIcon size={18} className="text-hy" /> Checkout coming soon
      </button>
      <p className="text-[13px] text-stone-400 text-center mb-8">
        Payments aren't switched on yet — this is the trial build.
      </p>

      <div className="border-2 border-line rounded-lg p-5">
        <label className="block font-bold text-sm mb-2">
          <span className="hl-b px-1">Have an unlock code?</span>
        </label>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            placeholder="Enter your code"
            className="flex-1 rounded-full border-2 border-ink px-5 py-2.5 focus:outline-none focus:ring-4 focus:ring-hy"
          />
          <button
            onClick={redeem}
            disabled={!code.trim()}
            className="bg-ink hover:bg-stone-700 disabled:opacity-30 text-white font-bold rounded-full px-7 transition"
          >
            Unlock
          </button>
        </div>
        {error && (
          <p className="text-[13px] font-semibold mt-2">
            <span className="hl-p px-0.5">That code didn't work.</span> Check it and try again.
          </p>
        )}
      </div>

      <p className="text-[13px] text-stone-400 mt-6 text-center">
        You've finished {used} of {total} free pieces. Your writing stays saved either way.
      </p>
    </div>
  );
}
