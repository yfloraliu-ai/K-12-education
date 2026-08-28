import type { Lesson } from "../types";

/**
 * Skill Gym mini-lessons: short, interactive lessons on the core frameworks.
 * Each teaches one skill with kid examples, then checks understanding with a
 * quick quiz. Filtered by grade so younger writers see simpler lessons.
 */

export const LESSONS: Lesson[] = [
  {
    id: "super-sentences",
    title: "Super Sentences",
    emoji: "🦸",
    minGrade: 1,
    maxGrade: 3,
    bigIdea: "A sentence is a complete idea: it tells WHO and WHAT they do.",
    points: [
      "A sentence needs a who (or what) and a doing part: “My dog digs holes.”",
      "Start with a capital letter. End with . ! or ?",
      "“The big dog” is NOT a sentence — it never tells what the dog does!",
      "Make it super by adding a describing word: “My muddy dog digs deep holes.”",
    ],
    quiz: [
      {
        question: "Which one is a complete sentence?",
        options: ["the fluffy cat", "My cat sleeps on my bed.", "runs really fast"],
        answer: 1,
        explain: "It has a who (my cat) AND a doing part (sleeps on my bed) — plus a capital and a period!",
      },
      {
        question: "Which describing word makes this sentence more interesting? “The ___ snake slid by.”",
        options: ["nice", "sneaky", "okay"],
        answer: 1,
        explain: "“Sneaky” paints a picture in the reader's mind. “Nice” and “okay” are tired words.",
      },
      {
        question: "What is missing? “where is my backpack”",
        options: ["A capital letter and a question mark", "More words", "Nothing — it's perfect"],
        answer: 0,
        explain: "It should be: “Where is my backpack?” — capital W to start, question mark to end.",
      },
    ],
  },
  {
    id: "topic-sentence",
    title: "Terrific Topic Sentences",
    emoji: "🎯",
    minGrade: 2,
    maxGrade: 6,
    bigIdea: "A topic sentence names your topic AND says something interesting about it.",
    points: [
      "It's the first sentence of your paragraph — the reader's road sign.",
      "Formula: Topic + So-What. “Beavers (topic) are Canada's busiest builders (so-what).”",
      "Too small: “Beavers have teeth.” (that's just one detail)",
      "Too big: “Animals are cool.” (which animal? cool how?)",
      "Just right: it fits everything in your paragraph, like a top bun fits a burger. 🍔",
    ],
    quiz: [
      {
        question: "Your paragraph gives three reasons recess should be longer. Which topic sentence fits best?",
        options: [
          "Recess is at 10:30.",
          "Our school should make recess longer, and I have three strong reasons.",
          "School has lots of parts, like gym and math.",
        ],
        answer: 1,
        explain: "It names the topic (longer recess) AND says something about it (three strong reasons are coming).",
      },
      {
        question: "What's wrong with “Dogs exist.” as a topic sentence?",
        options: [
          "It has no so-what — it doesn't say anything interesting about dogs",
          "It's too long",
          "Dogs can't be a topic",
        ],
        answer: 0,
        explain: "It names a topic but has no so-what. “Dogs make the best helpers for humans” gives the reader a reason to keep reading.",
      },
      {
        question: "A topic sentence is like the top bun of a hamburger because…",
        options: [
          "it's the tastiest part",
          "it comes first and holds everything under it together",
          "it's the biggest part",
        ],
        answer: 1,
        explain: "Everything in the paragraph has to “fit under” the topic sentence, just like fillings fit under the bun.",
      },
    ],
  },
  {
    id: "hamburger",
    title: "The Hamburger Paragraph",
    emoji: "🍔",
    minGrade: 2,
    maxGrade: 6,
    bigIdea: "Top bun (topic sentence) + juicy filling (3 details) + bottom bun (wrap-up).",
    points: [
      "Top bun 🍞: the topic sentence — topic + so-what.",
      "Filling 🍅🧀🥬: at least three detail sentences. Every one must match the topic!",
      "Bottom bun 🍞: a wrap-up sentence that says the big idea again in new words. No brand-new facts down there.",
      "A burger with no bottom bun falls apart — a paragraph with no wrap-up feels unfinished.",
    ],
    quiz: [
      {
        question: "Your topic sentence is “Winter in Alberta is full of fun.” Which detail does NOT belong in the filling?",
        options: [
          "You can skate on frozen ponds.",
          "Snowball fights make everyone laugh.",
          "My cousin lives in Toronto.",
        ],
        answer: 2,
        explain: "The cousin fact doesn't match the topic. Every filling sentence must fit under the top bun!",
      },
      {
        question: "Which is the best bottom bun for that paragraph?",
        options: [
          "Also, hot chocolate has marshmallows.",
          "That's why an Alberta winter is never boring.",
          "The end.",
        ],
        answer: 1,
        explain: "It wraps up the big idea in fresh words. A new fact belongs in the filling, and “The end” isn't a wrap-up sentence.",
      },
      {
        question: "How many detail sentences does a good hamburger paragraph need?",
        options: ["At least three", "Exactly one", "Ten or more"],
        answer: 0,
        explain: "Three or more juicy details make the paragraph filling. One is too thin — and quality beats piling on!",
      },
    ],
  },
  {
    id: "elaboration",
    title: "Detail Detective: Elaboration",
    emoji: "🔍",
    minGrade: 3,
    maxGrade: 6,
    bigIdea: "Elaborating = stretching an idea with because, examples, and senses.",
    points: [
      "Bare idea: “My dog is funny.” The reader asks: HOW? WHY? SHOW ME!",
      "Move 1 — Because: “My dog is funny because he chases his own tail.”",
      "Move 2 — For example: “For example, yesterday he barked at his reflection for an hour.”",
      "Move 3 — Five senses: what did it look, sound, smell, taste, feel like?",
      "Move 4 — Show, don't tell: instead of “I was scared”, write “My hands shook and I held my breath.”",
    ],
    quiz: [
      {
        question: "Which sentence elaborates on “Recess is the best part of school”?",
        options: [
          "School starts at 8:30.",
          "For example, yesterday my friends and I invented a brand-new tag game.",
          "Recess is the best part of school.",
        ],
        answer: 1,
        explain: "It uses the “for example” move to prove the idea. Repeating the idea or adding an off-topic fact doesn't elaborate.",
      },
      {
        question: "Which one SHOWS instead of TELLS that the pizza was delicious?",
        options: [
          "The pizza was delicious.",
          "The pizza was really really delicious.",
          "The cheese stretched a full arm's length, and I burned my tongue because I couldn't wait.",
        ],
        answer: 2,
        explain: "Senses and actions let the reader taste it. Adding “really really” is telling louder, not showing.",
      },
      {
        question: "A detail detective's favourite questions are…",
        options: ["Why? How? What did it look like?", "Is it long enough yet?", "What mark will I get?"],
        answer: 0,
        explain: "Why, how, and sense questions dig up the details readers love.",
      },
    ],
  },
  {
    id: "word-power",
    title: "Word Power-Ups",
    emoji: "🪄",
    minGrade: 3,
    maxGrade: 6,
    bigIdea: "Swap tired words (good, big, said, went) for precise, powerful ones.",
    points: [
      "Tired words are fine for a first draft — power them up when you polish.",
      "“said” → whispered, shouted, admitted, groaned (each paints a different picture!)",
      "“went” → raced, crept, wandered, marched.",
      "“good” → delicious (food), skilled (a player), generous (a friend). Precise beats fancy!",
      "Power-up rule: the new word must still MEAN what you meant. A thesaurus word you don't understand is a trap.",
    ],
    quiz: [
      {
        question: "“The soup was good.” Which power-up is most precise?",
        options: ["The soup was nice.", "The soup was delicious.", "The soup was magnanimous."],
        answer: 1,
        explain: "“Delicious” is exact for tasty food. “Magnanimous” means generous — a fancy trap that doesn't fit soup!",
      },
      {
        question: "Your character is sneaking to bed late. Power up “She went to her room.”",
        options: ["She crept to her room.", "She marched to her room.", "She zoomed to her room."],
        answer: 0,
        explain: "“Crept” matches sneaking — quiet and careful. Marching and zooming are loud and fast!",
      },
      {
        question: "Why is “said” worth powering up in “‘Help!’ she said.”?",
        options: [
          "Because longer words always sound smarter",
          "Because “screamed” or “whimpered” would show HOW she said it",
          "It isn't — “said” is against the rules",
        ],
        answer: 1,
        explain: "Precise speaking verbs show volume and feeling. (And “said” is still fine sometimes — power-ups are choices, not rules.)",
      },
    ],
  },
  {
    id: "sentence-stretch",
    title: "Sentence Stretchers",
    emoji: "🐍",
    minGrade: 4,
    maxGrade: 6,
    bigIdea: "Grow short sentences by adding where/when/why, or joining ideas with because, although, when.",
    points: [
      "Kernel: “The dog barked.” Stretch it: add WHEN, WHERE, WHY.",
      "“Late last night (when), the dog barked at the fence (where) because a porcupine waddled by (why).”",
      "Combine two shorties: “I was tired. I finished the race.” → “Although I was tired, I finished the race.”",
      "Vary your openers: don't start every sentence with I, The, Then.",
      "Mix it up! Short sentences are powerful too. Long, long, long gets boring — long, short, long sings.",
    ],
    quiz: [
      {
        question: "Which stretch of “The girl ran.” adds a WHY?",
        options: [
          "The girl ran quickly.",
          "The girl ran because the school bus was leaving.",
          "The girl ran in the gym.",
        ],
        answer: 1,
        explain: "“Because…” answers why. “Quickly” tells how, and “in the gym” tells where.",
      },
      {
        question: "Combine these with the best joining word: “It was snowing hard. We played outside.”",
        options: [
          "It was snowing hard, so we played outside… wait, that's weird.",
          "Even though it was snowing hard, we played outside.",
          "It was snowing hard and we played outside and it was cold and fun.",
        ],
        answer: 1,
        explain: "“Even though” shows the surprise between the two ideas. Chaining “and… and… and” makes a run-on snake!",
      },
      {
        question: "Every sentence in a paragraph starts with “Then”. What's the best fix?",
        options: [
          "Make them all start with “Next” instead",
          "Vary the openers: a when-phrase, a character's name, an action word",
          "Delete the paragraph",
        ],
        answer: 1,
        explain: "Varied openers keep readers awake: “After lunch, …” “Racing downhill, …” “Maya…”",
      },
    ],
  },
  {
    id: "transitions",
    title: "Smooth Moves: Transitions",
    emoji: "🌉",
    minGrade: 3,
    maxGrade: 6,
    bigIdea: "Transition words are bridges that carry the reader from one idea to the next.",
    points: [
      "Order bridges: First, Next, Then, After that, Finally.",
      "Adding bridges: Also, In addition, Another reason…",
      "But-bridges: However, On the other hand, But.",
      "Proof bridges: For example, In fact, For instance.",
      "Ending bridges: In conclusion, That's why, Overall.",
    ],
    quiz: [
      {
        question: "“___, mix the flour and water.” Which bridge fits a first step?",
        options: ["Finally", "First", "However"],
        answer: 1,
        explain: "“First” tells the reader this is step one. “Finally” is for the last step, “However” is a but-bridge.",
      },
      {
        question: "You just gave reason two, and reason three is coming. Best bridge?",
        options: ["In conclusion", "Another reason is…", "For example"],
        answer: 1,
        explain: "An adding bridge tells the reader another reason is arriving. “In conclusion” would end things too early!",
      },
      {
        question: "Which bridge introduces PROOF for your reason?",
        options: ["For instance", "Meanwhile", "Secondly"],
        answer: 0,
        explain: "“For instance” (like “for example”) signals an example is coming to back up your idea.",
      },
    ],
  },
];

export function lessonsForGrade(grade: number): Lesson[] {
  return LESSONS.filter((l) => grade >= l.minGrade && grade <= l.maxGrade);
}
