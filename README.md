# 🍁 Maple Writing Coach

An AI writing coach for Alberta elementary students (Grades 1–6), aligned with
the Alberta English Language Arts & Literature K-6 progression.

**The golden rule: the coach never writes for the student.** Coach Maple guides
step by step — Socratic questions, one skill at a time, choices instead of
answers — so students build real writing skills:

- **Frameworks**: topic sentences, the hamburger/sandwich paragraph, story
  mountain, OREO opinions, how-to structure, friendly letters, poems.
- **Elaboration**: because/for-example moves, five senses, show-don't-tell.
- **Word power**: upgrading tired words (good, big, said, went) into precise,
  academic vocabulary — offered as choices the student picks and explains.
- **Sentence craft**: stretching short sentences, combining with because /
  although / when, varying openers.

## How it works

1. **Welcome** — student picks their grade (1–6); everything adapts: coach
   language level, genres, planning boxes, checklists, topic sparks.
2. **Plan 🧠** — a genre-specific graphic organizer (e.g. hamburger boxes);
   the coach asks guiding questions to fill it.
3. **Draft ✏️** — the student writes; the coach keeps the pencil moving and
   never fixes conventions prematurely (ideas first).
4. **Polish 💎** — four coaching tools: **Word Lift 🪄** (3 word choices, student
   picks & explains), **Sentence Stretcher 🐍** (teach a move on a different
   example, student applies it), **Detail Detective 🔍** (elaboration questions),
   **Star Feedback ⭐** (2 glows + 1 grow against the grade-level checklist).
5. **Shine 🌟** — a report card the student reads themselves: five dimensions
   graded 1–4, a note on every sentence, and one score out of 100 in the
   corner. Tapping a sentence shows the notes; rewriting it keeps the first
   try beside the new version, and the coach reads the rewrite and says
   **whether it actually worked** — naming the move when it did, pointing at
   what is still there (never supplying the fix) when it did not. Only a
   confirmed fix moves the score.

Plus the **Skill Gym 🏋️**: interactive mini-lessons with quizzes on topic
sentences, hamburger paragraphs, elaboration, word power-ups, sentence
stretching, and transitions — filtered by grade.

All coaching pedagogy is enforced **server-side** in `app.ts` (the system
prompt), so the client can never turn the coach into a ghostwriter.

## Run it

```bash
cd writing-coach
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY
npm run dev            # http://localhost:3000
```

## Deploy to Vercel

Create a new Vercel project with **Root Directory = `writing-coach`** and set
the `ANTHROPIC_API_KEY` environment variable. The included `vercel.json`
handles the rest (static Vite build + `/api/*` serverless function).

## Stack

Vite + React 19 + Tailwind CSS 4 · Express · Anthropic Claude Messages API
(`claude-sonnet-5` by default, override with `CLAUDE_MODEL`). Progress is
stored in the browser's localStorage — no accounts, no student data on servers.
