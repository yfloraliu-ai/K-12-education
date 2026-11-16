import { useState } from "react";
import { LeafIcon } from "./icons";

/**
 * Bump this when the terms change: anyone who agreed to an older version is
 * asked again, rather than being counted as having agreed to words they never
 * saw.
 */
export const TERMS_VERSION = "2026-11-16";

/** Where to reach a human. Replace before sharing the app widely. */
const CONTACT = "[your contact email]";

interface Props {
  /** "gate": shown before first use and must be accepted. "review": read-only. */
  mode: "gate" | "review";
  onAccept?: () => void;
  onClose?: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="font-extrabold text-[14px] mb-1">{title}</h3>
      <div className="text-[13.5px] leading-relaxed text-stone-600 space-y-2">{children}</div>
    </div>
  );
}

export default function Terms({ mode, onAccept, onClose }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [showFull, setShowFull] = useState(mode === "review");

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-2xl mx-auto bg-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-hy border-2 border-ink flex items-center justify-center shrink-0">
          <LeafIcon size={20} />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {mode === "gate" ? (
            <>
              Before you <span className="hl-y px-1">start</span>
            </>
          ) : (
            <>
              Privacy and <span className="hl-y px-1">terms</span>
            </>
          )}
        </h1>
      </div>
      <div className="h-0.5 bg-ink my-5" />

      {/* The short version: what a student or a busy adult will actually read. */}
      <ul className="space-y-3 mb-6">
        {[
          ["Your writing stays in this browser.", "It is not saved on any server, and the person who made this app cannot read it."],
          ["To give you feedback, your writing is sent to an AI.", "Your writing, and the first name you type, go to Anthropic's AI service, which writes the feedback and nothing else."],
          ["If you clear your browser, your work is gone.", "There is no copy anywhere else, and it will not follow you to another device. Copy or print anything you want to keep."],
          ["The coach is a computer and it gets things wrong.", "It is for practice. Your teacher is still the one who knows best."],
          ["Do not type private details into your writing.", "No last name, address, phone number, or school name."],
        ].map(([head, body]) => (
          <li key={head} className="flex gap-3">
            <span className="w-2 h-2 rounded-full bg-ink mt-2 shrink-0" />
            <span className="text-[14.5px] leading-relaxed">
              <strong className="font-extrabold">{head}</strong>{" "}
              <span className="text-stone-600">{body}</span>
            </span>
          </li>
        ))}
      </ul>

      {!showFull && (
        <button
          onClick={() => setShowFull(true)}
          className="text-[13px] font-bold underline underline-offset-4 text-stone-500 hover:text-ink transition mb-6"
        >
          Read the full terms
        </button>
      )}

      {showFull && (
        <div className="border-2 border-line rounded-lg p-5 mb-6">
          <Section title="1. What this is">
            <p>
              Maple Writing Coach is a free practice tool that helps a student plan, draft and revise
              their own writing. It is a personal project, not a school system and not a commercial
              service. It is offered as is, with no promise that it will keep working or stay
              available.
            </p>
          </Section>

          <Section title="2. What is stored, and where">
            <p>
              Everything the student does — the name they type, the grade they pick, their plans,
              drafts, report cards and revisions — is stored only in the browser they are using, in
              that browser's own local storage. None of it is stored on a server. There are no
              accounts and no passwords, and no email address is collected.
            </p>
            <p>
              A random identifier is also kept in the browser so the free-use limit can be counted.
              It is not linked to a name or to any person.
            </p>
          </Section>

          <Section title="3. What is sent to the AI">
            <p>
              To produce coaching and feedback, the student's writing, the topic, the planning notes,
              the first name they typed, and their chat messages are sent to Anthropic's API, which
              generates the response. That is the only purpose they are sent for.
            </p>
            <p>
              Because of this, students should not put private details into their writing: no last
              name, home address, phone number, school name, or anything else they would not want
              leaving the device.
            </p>
          </Section>

          <Section title="4. What the app's author cannot do">
            <p>
              The author of this app has no way to read, retrieve or recover any student's writing.
              There is no database, no copy kept on a server, and the server does not record the
              text of anyone's writing. If a student loses their work, the author cannot get it back,
              and if someone asks for a student's writing, the author has nothing to give them.
            </p>
          </Section>

          <Section title="5. Losing work">
            <p>
              Clearing browser data, using private or incognito mode, switching browsers, or
              switching devices will make previous work unavailable, permanently. Use the Copy or
              Print buttons to keep anything that matters.
            </p>
          </Section>

          <Section title="6. The feedback can be wrong">
            <p>
              The coach is an AI. Its grades, corrections and suggestions can be mistaken, and it
              should not be treated as an assessment of a student's ability or used in place of a
              teacher's judgement. It is a practice partner.
            </p>
          </Section>

          <Section title="7. Who may use this">
            <p>
              This is made for elementary-aged students. A student under 13 should have a parent,
              guardian or teacher read this page with them and set the app up for them. By
              continuing, the adult confirms they have read this and agree to it on the student's
              behalf.
            </p>
          </Section>

          <Section title="8. Changes, and getting in touch">
            <p>
              These terms may change; the date below is the version in force. With questions, or to
              ask that the app stop being made available to a particular student, contact{" "}
              <strong>{CONTACT}</strong>.
            </p>
            <p className="text-stone-400">Version {TERMS_VERSION}</p>
          </Section>
        </div>
      )}

      {mode === "gate" ? (
        <>
          <label className="flex items-start gap-3 border-2 border-ink rounded-lg p-4 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 mt-0.5 shrink-0 accent-black"
            />
            <span className="text-[14px] leading-relaxed font-semibold">
              I have read this and I understand it.
              <span className="block text-[13px] font-medium text-stone-500 mt-1">
                If the student is under 13, a parent, guardian or teacher should read this with them
                and tick this box.
              </span>
            </span>
          </label>
          <button
            onClick={onAccept}
            disabled={!agreed}
            className="w-full bg-ink hover:bg-stone-700 disabled:opacity-30 text-white font-bold text-[15px] rounded-full py-3.5 transition"
          >
            Start writing
          </button>
        </>
      ) : (
        <button
          onClick={onClose}
          className="w-full border-2 border-ink hover:bg-soft font-bold text-[15px] rounded-full py-3 transition"
        >
          Close
        </button>
      )}
    </div>
  );
}
