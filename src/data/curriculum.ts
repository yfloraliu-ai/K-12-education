import type { GenreInfo, Grade } from "../types";

/**
 * Genre frameworks, planning boxes, topic sparks and checklists, tuned to the
 * Alberta English Language Arts & Literature K-6 progression. Grade bands:
 * 1-2 (sentences & simple structure), 3-4 (hamburger paragraph), 5-6
 * (multi-paragraph, academic vocabulary, complex sentences).
 */

export const GRADE_BADGES: Record<Grade, { label: string; emoji: string }> = {
  1: { label: "Grade 1", emoji: "🌱" },
  2: { label: "Grade 2", emoji: "🌿" },
  3: { label: "Grade 3", emoji: "🌼" },
  4: { label: "Grade 4", emoji: "🌳" },
  5: { label: "Grade 5", emoji: "🏔️" },
  6: { label: "Grade 6", emoji: "🚀" },
};

export function band(grade: Grade): "1-2" | "3-4" | "5-6" {
  if (grade <= 2) return "1-2";
  if (grade <= 4) return "3-4";
  return "5-6";
}

// Shared conventions items appended to every genre checklist.
const CONVENTIONS: GenreInfo["checklist"] = [
  { id: "caps", text: "Every sentence starts with a capital letter" },
  { id: "ends", text: "Every sentence ends with . ! or ?" },
  { id: "read-aloud", text: "I read my writing out loud and it makes sense" },
  { id: "transitions", text: "I used linking words (first, next, also, but…)", minGrade: 3 },
  { id: "strong-words", text: "I swapped at least one tired word for a stronger one", minGrade: 3 },
  { id: "sentence-variety", text: "My sentences don't all start the same way", minGrade: 5 },
  { id: "academic-words", text: "I used at least two precise or academic words", minGrade: 5 },
];

export const GENRES: GenreInfo[] = [
  {
    id: "story",
    name: "Story",
    emoji: "🏰",
    tagline: "Make up an adventure with a beginning, middle and end",
    minGrade: 1,
    planner: [
      { id: "characters", label: "Characters", emoji: "🧑‍🤝‍🧑", hint: "Who is in your story?" },
      { id: "setting", label: "Setting", emoji: "🏠", hint: "Where and when does it happen?" },
      { id: "beginning", label: "Beginning", emoji: "🌅", hint: "How does it start?" },
      { id: "problem", label: "Middle — the problem!", emoji: "⛰️", hint: "What goes wrong or gets exciting?" },
      { id: "ending", label: "Ending", emoji: "🌈", hint: "How is the problem fixed? How do they feel?" },
    ],
    checklist: [
      { id: "bme", text: "My story has a beginning, a middle and an end" },
      { id: "who-where", text: "The reader knows who is in the story and where it happens" },
      { id: "problem", text: "Something interesting happens (a problem or surprise)", minGrade: 2 },
      { id: "feelings", text: "I show how my character feels", minGrade: 3 },
      { id: "show-dont-tell", text: "I show feelings with actions or senses, not just naming them", minGrade: 5 },
      ...CONVENTIONS,
    ],
  },
  {
    id: "opinion",
    name: "Opinion",
    emoji: "💭",
    tagline: "Say what you think and back it up with reasons",
    minGrade: 1,
    planner: [
      { id: "opinion", label: "My opinion", emoji: "💭", hint: "I think… (this becomes your topic sentence)" },
      { id: "reason1", label: "Reason 1", emoji: "1️⃣", hint: "…because…" },
      { id: "reason2", label: "Reason 2", emoji: "2️⃣", hint: "Another reason" },
      { id: "reason3", label: "Reason 3", emoji: "3️⃣", hint: "One more reason", minGrade: 3 },
      { id: "example", label: "Example or proof", emoji: "🔍", hint: "An example that proves a reason", minGrade: 3 },
      { id: "wrapup", label: "Wrap-up", emoji: "🎀", hint: "Say your opinion again in new words", minGrade: 2 },
    ],
    checklist: [
      { id: "topic-sentence", text: "My first sentence says my opinion clearly" },
      { id: "because", text: "I used 'because' to give a reason" },
      { id: "three-reasons", text: "I gave three different reasons", minGrade: 3 },
      { id: "example", text: "At least one reason has an example or proof", minGrade: 3 },
      { id: "restate", text: "My ending says my opinion again in different words", minGrade: 2 },
      { id: "persuasive-words", text: "I used convincing words (clearly, importantly, in fact…)", minGrade: 5 },
      ...CONVENTIONS,
    ],
  },
  {
    id: "report",
    name: "Report",
    emoji: "🔬",
    tagline: "Teach the reader true facts about a topic you love",
    minGrade: 2,
    planner: [
      { id: "topic-sentence", label: "Topic sentence (top bun)", emoji: "🍞", hint: "Name your topic AND say something interesting about it" },
      { id: "fact1", label: "Fact 1", emoji: "🍅", hint: "A true fact about your topic" },
      { id: "fact2", label: "Fact 2", emoji: "🧀", hint: "Another fact" },
      { id: "fact3", label: "Fact 3", emoji: "🥬", hint: "One more fact" },
      { id: "closing", label: "Closing (bottom bun)", emoji: "🍞", hint: "Wrap it up — no brand-new facts here" },
    ],
    checklist: [
      { id: "topic-sentence", text: "My topic sentence names the topic and says something about it" },
      { id: "three-facts", text: "I have at least three detail sentences" },
      { id: "match", text: "Every detail matches my topic sentence" },
      { id: "closing", text: "My closing sentence wraps it up (no new facts)" },
      { id: "paragraphs", text: "Each big idea has its own paragraph", minGrade: 5 },
      ...CONVENTIONS,
    ],
  },
  {
    id: "procedure",
    name: "How-To",
    emoji: "🛠️",
    tagline: "Teach someone the steps to do something",
    minGrade: 1,
    planner: [
      { id: "goal", label: "What am I teaching?", emoji: "🎯", hint: "How to…" },
      { id: "materials", label: "What you need", emoji: "🧰", hint: "List the things needed" },
      { id: "steps", label: "The steps, in order", emoji: "👣", hint: "First… Next… Then… Finally…" },
      { id: "tip", label: "A helpful tip", emoji: "💡", hint: "A hint or a warning for the reader", minGrade: 2 },
    ],
    checklist: [
      { id: "goal", text: "The reader knows what they will learn to do" },
      { id: "order", text: "My steps are in the right order" },
      { id: "sequence-words", text: "My steps start with order words (First, Next, Then, Finally)" },
      { id: "bossy-verbs", text: "My steps start with action words (Cut, Pour, Hold…)", minGrade: 3 },
      { id: "materials", text: "I listed everything the reader needs", minGrade: 2 },
      ...CONVENTIONS,
    ],
  },
  {
    id: "letter",
    name: "Letter",
    emoji: "💌",
    tagline: "Write a friendly letter to someone real or imaginary",
    minGrade: 2,
    planner: [
      { id: "to", label: "Who is it for?", emoji: "💌", hint: "Dear…" },
      { id: "why", label: "Why am I writing?", emoji: "✨", hint: "To say thanks? Share news? Invite them?" },
      { id: "body", label: "What will I tell them?", emoji: "📝", hint: "News, details, questions for them" },
      { id: "closing", label: "How will I sign off?", emoji: "👋", hint: "Your friend, / Love, / Sincerely," },
    ],
    checklist: [
      { id: "greeting", text: "I started with a greeting (Dear ___,)" },
      { id: "why", text: "The reader can tell why I wrote to them" },
      { id: "details", text: "I shared details, not just one sentence" },
      { id: "question", text: "I asked my reader at least one question", minGrade: 3 },
      { id: "signoff", text: "I ended with a closing and my name" },
      ...CONVENTIONS,
    ],
  },
  {
    id: "poem",
    name: "Poem",
    emoji: "🎨",
    tagline: "Paint a picture with sense words and feelings",
    minGrade: 1,
    planner: [
      { id: "idea", label: "My big idea", emoji: "💡", hint: "What is your poem about?" },
      { id: "senses", label: "Sense words", emoji: "👀", hint: "What do you see, hear, smell, taste, touch?" },
      { id: "feelings", label: "Feeling words", emoji: "💗", hint: "How does it make you feel?" },
      { id: "sparkle", label: "Sparkle words", emoji: "✨", hint: "Fun sounds, repeats, or comparisons (like a…)", minGrade: 3 },
    ],
    checklist: [
      { id: "picture", text: "My poem makes a picture in the reader's mind" },
      { id: "senses", text: "I used at least two sense words" },
      { id: "line-breaks", text: "I chose where my lines end on purpose", minGrade: 2 },
      { id: "comparison", text: "I used a comparison (like… / as… as…)", minGrade: 3 },
      { id: "no-forced-rhyme", text: "If I rhymed, the words still make sense", minGrade: 3 },
      { id: "caps", text: "My words are spelled the best I can" },
      { id: "read-aloud", text: "I read it out loud and it sounds the way I want" },
    ],
  },
];

export function genresForGrade(grade: Grade): GenreInfo[] {
  return GENRES.filter((g) => grade >= g.minGrade);
}

export function plannerForGrade(genre: GenreInfo, grade: Grade) {
  return genre.planner.filter((f) => grade >= (f.minGrade ?? 1));
}

export function checklistForGrade(genre: GenreInfo, grade: Grade) {
  return genre.checklist.filter((c) => grade >= (c.minGrade ?? 1));
}

// ---------------------------------------------------------------------------
// Topic sparks, per genre per band
// ---------------------------------------------------------------------------

const SPARKS: Record<string, Record<"1-2" | "3-4" | "5-6", string[]>> = {
  story: {
    "1-2": ["The day my toy came alive", "A surprise in my backpack", "The friendly monster at school", "My pet's secret adventure"],
    "3-4": ["The door in the library that wasn't there yesterday", "Lost on a school trip", "The day it snowed in July", "My robot did my chores — badly"],
    "5-6": ["The message frozen in the river ice", "Switched lives with my teacher for a day", "The last house on Aspen Street", "A stampede of… something, at the Calgary Stampede"],
  },
  opinion: {
    "1-2": ["Dogs or cats — which pet is better?", "Recess should be longer", "The best season of the year", "Pizza is the best lunch"],
    "3-4": ["Should kids have homework every day?", "The best field trip our class could take", "Should our school get a class pet?", "Video games: good or bad for kids?"],
    "5-6": ["Should cell phones be allowed in class?", "Is winter in Alberta the best or the worst?", "Should kids get paid for chores?", "Books or movies — which tells stories better?"],
  },
  report: {
    "1-2": ["All about polar bears", "All about my favourite animal", "All about the Northern Lights", "All about dinosaurs"],
    "3-4": ["Beavers: Canada's builders", "How the Northern Lights happen", "The Rocky Mountains", "Chinook winds in Alberta"],
    "5-6": ["Dinosaurs of Drumheller and the Badlands", "Why bees matter to Alberta farms", "The water cycle in the Bow River", "Indigenous Peoples of the Plains: the bison connection"],
  },
  procedure: {
    "1-2": ["How to make a peanut butter sandwich", "How to brush your teeth", "How to build a snowman", "How to take care of a goldfish"],
    "3-4": ["How to make the best hot chocolate", "How to score in your favourite sport", "How to survive a snow day", "How to make a paper airplane that really flies"],
    "5-6": ["How to study for a spelling test (and actually remember)", "How to plan the perfect birthday party", "How to teach your dog a trick", "How to make bannock with an adult"],
  },
  letter: {
    "1-2": ["A thank-you letter to someone kind", "A letter to my favourite animal", "A letter to Santa or the Tooth Fairy", "A letter to my grandma or grandpa"],
    "3-4": ["A letter to my future Grade 6 self", "A letter inviting a friend to visit Alberta", "A thank-you letter to a school helper", "A letter to my favourite author"],
    "5-6": ["A letter to the principal with one idea to improve our school", "A letter to a pen pal about life in Alberta", "A letter to my Grade 1 self", "A letter to the mayor about our neighbourhood park"],
  },
  poem: {
    "1-2": ["Snow!", "My favourite colour", "Things that are loud", "My family"],
    "3-4": ["A chinook is coming", "The sound of recess", "Autumn leaves in the schoolyard", "My messy room"],
    "5-6": ["Northern lights over the prairie", "The moment before the race starts", "An empty classroom in summer", "Wheat fields in the wind"],
  },
};

export function sparksFor(genreId: string, grade: Grade): string[] {
  return SPARKS[genreId]?.[band(grade)] ?? [];
}
