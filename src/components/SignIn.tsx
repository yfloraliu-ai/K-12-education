import { useState } from "react";
import { requestLoginLink } from "../services/account";
import { ArrowLeftIcon, EnvelopeIcon, LeafIcon } from "./icons";

interface Props {
  /** Why they landed here, so the heading matches the moment. */
  reason?: "subscribe" | "restore";
  onExit: () => void;
}

export default function SignIn({ reason = "restore", onExit }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await requestLoginLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-lg mx-auto bg-white">
      <button
        onClick={onExit}
        className="flex items-center gap-1.5 text-sm font-bold text-stone-400 hover:text-ink mb-8 transition"
      >
        <ArrowLeftIcon size={15} /> Back
      </button>

      {sent ? (
        <div className="pop-in">
          <div className="w-12 h-12 rounded-full bg-hg border-2 border-ink flex items-center justify-center mb-4">
            <EnvelopeIcon size={22} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            <span className="hl-g px-1">Check your email</span>
          </h1>
          <p className="text-stone-500 text-lg leading-relaxed mb-6">
            We sent a sign-in link to <strong className="text-ink">{email}</strong>. Click it and
            you're in — no password needed.
          </p>
          <p className="text-[13px] text-stone-400">
            The link works once and expires in 20 minutes. Nothing arrived? Check the spam folder,
            or{" "}
            <button onClick={() => setSent(false)} className="font-bold text-ink underline">
              try another address
            </button>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-hy border-2 border-ink flex items-center justify-center mb-4">
            <LeafIcon size={24} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            {reason === "subscribe" ? (
              <>
                First, your <span className="hl-y px-1">email</span>
              </>
            ) : (
              <>
                Sign <span className="hl-y px-1">in</span>
              </>
            )}
          </h1>
          <p className="text-stone-500 text-lg leading-relaxed mb-7">
            {reason === "subscribe"
              ? "A parent's email keeps the subscription and lets every device in the family sign in."
              : "Enter the email your subscription is under and we'll send a sign-in link."}
          </p>

          <form onSubmit={send}>
            <label className="block font-bold mb-2">Parent's email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-full border-2 border-ink px-5 py-3 mb-4 text-lg focus:outline-none focus:ring-4 focus:ring-hy"
            />
            <button
              type="submit"
              disabled={!email.trim() || busy}
              className="w-full bg-ink hover:bg-stone-700 disabled:opacity-30 text-white font-bold text-lg rounded-full py-3.5 transition"
            >
              {busy ? "Sending…" : "Email me a sign-in link"}
            </button>
          </form>

          {error && (
            <p className="text-sm font-semibold mt-4">
              <span className="hl-p px-0.5">Oops:</span> {error}
            </p>
          )}
          <p className="text-[13px] text-stone-400 mt-6 leading-relaxed">
            We only use this address to sign you in and send billing receipts. Children never need
            an account of their own.
          </p>
        </>
      )}
    </div>
  );
}
