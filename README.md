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
5. **Shine 🌟** — celebrate, self-check against the checklist, copy/print.

Plus the **Skill Gym 🏋️**: interactive mini-lessons with quizzes on topic
sentences, hamburger paragraphs, elaboration, word power-ups, sentence
stretching, and transitions — filtered by grade.

All coaching pedagogy is enforced **server-side** in `app.ts` (the system
prompt), so the client can never turn the coach into a ghostwriter.

## Run it

```bash
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY
npm run dev            # http://localhost:3000
```

## Deploy to Vercel

Import this repository as a Vercel project and set the `ANTHROPIC_API_KEY`
environment variable (Project Settings → Environment Variables). The included
`vercel.json` handles the rest (static Vite build + `/api/*` serverless
function). Never commit the key — this repository is public; the key lives
only in Vercel's environment settings.

## Stack

Vite + React 19 + Tailwind CSS 4 · Express · Anthropic Claude Messages API
(`claude-sonnet-5` by default, override with `CLAUDE_MODEL`). Progress is
stored in the browser's localStorage — no accounts, no student data on servers.
