import type { GenreId, GenreInfo, Grade } from "../types";

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
// Topic bank: per genre, per band, organized by theme category
// ---------------------------------------------------------------------------

export interface TopicCategory {
  id: string;
  name: string;
  topics: string[];
}

const CATEGORY_NAMES: Record<string, string> = {
  imagine: "Imagination",
  nature: "Animals & Nature",
  science: "Science & Tech",
  history: "History & Long Ago",
  canada: "Canada & Community",
  school: "School & Friends",
  home: "Home & Fun",
};

type Band = "1-2" | "3-4" | "5-6";

const TOPIC_BANK: Record<string, Record<Band, Record<string, string[]>>> = {
  story: {
    "1-2": {
      imagine: ["The day my toy came alive", "A dragon moved in next door", "The magic backpack", "I shrank to the size of an ant"],
      nature: ["My pet's secret adventure", "The bear who wanted a friend", "A squirrel stole my snack", "The duck who couldn't swim"],
      science: ["My robot helper goes silly", "A trip to the moon in my wagon", "The talking computer at school", "I built a rocket in my backyard"],
      history: ["A day with the dinosaurs", "Grandma's story from long ago", "The old treasure box in the attic", "My time-machine bed"],
      school: ["The surprise in my backpack", "The class pet escaped!", "My first day jitters", "The snow day surprise"],
    },
    "3-4": {
      imagine: ["The door in the library that wasn't there yesterday", "The map with a missing island", "My shadow started doing its own thing", "The elevator that goes anywhere"],
      nature: ["Lost in the Rocky Mountains", "The wolf who followed me home", "The day it snowed in July", "The river that whispered warnings"],
      science: ["My robot did my chores — badly", "The video game that played back", "Signals from the satellite dish", "The 3D printer printed something extra"],
      history: ["Stuck in a pioneer town for a day", "The dinosaur bone that wasn't a rock", "A knight knocked on our door", "The gold rush ghost town mystery"],
      school: ["Lost on a school trip", "The substitute teacher's strange briefcase", "Our class time capsule opened early", "The talent show disaster"],
    },
    "5-6": {
      imagine: ["The last house on Aspen Street", "The message frozen in the river ice", "Switched lives with my teacher for a day", "The town where nobody could lie"],
      nature: ["The chinook that blew in something strange", "Alone on the prairie in a blizzard", "The northern lights sent a message", "The night of the forest fire evacuation"],
      science: ["The AI that did my homework too well", "First kid on Mars", "The drone that filmed something impossible", "My smartwatch started predicting the future"],
      history: ["A stampede of… something, at the Calgary Stampede", "The fur trader's lost journal", "The kid who missed the Titanic", "Digging up Drumheller's biggest secret"],
      school: ["The class president election went wrong", "The day the school Wi-Fi gained a mind", "Our band's first (terrible) concert", "The mystery of the vanishing lunches"],
    },
  },
  opinion: {
    "1-2": {
      school: ["Recess should be longer", "Pizza is the best lunch", "Homework: yes or no?", "The best day of the school week"],
      canada: ["Winter or summer — which is better in Canada?", "Our town needs more playgrounds", "Everyone should learn to skate", "The best thing about where I live"],
      nature: ["Dogs or cats — which pet is better?", "The best animal at the zoo", "Bugs are cool (or creepy?)", "The best season of the year"],
      science: ["TV or books — which is more fun?", "Video games: fun or too much?", "The best invention ever", "Should kids have their own tablet?"],
    },
    "3-4": {
      school: ["Should kids have homework every day?", "Should our school get a class pet?", "The best field trip our class could take", "Should school start later in the morning?"],
      canada: ["Should our city build more bike lanes?", "The best rule at our school — and the worst", "Should kids help pick the class rules?", "Is winter in Alberta the best or the worst?"],
      nature: ["Should wild animals ever live in zoos?", "The best pet for a busy family", "Should we plant more trees in our neighbourhood?", "Camping or hotels — which is the better holiday?"],
      science: ["Video games: good or bad for kids?", "Should kids under 10 have phones?", "Will robots make good teachers?", "Paper books or e-books?"],
    },
    "5-6": {
      school: ["Should cell phones be allowed in class?", "Should kids get paid for good grades?", "Is homework helping or hurting?", "Should schools have uniforms?"],
      canada: ["Should the voting age be lower?", "Should our city ban plastic bags?", "What one law would you change, and why?", "Should kids get a say in city decisions?"],
      nature: ["Should Alberta protect more wild land?", "Is it fair to keep orcas in aquariums?", "Should everyone have to recycle?", "Hunting: tradition or problem?"],
      science: ["Is AI good or bad for students?", "Should social media have an age limit?", "Will electric cars save the planet?", "Should we spend money on space travel?"],
    },
  },
  report: {
    "1-2": {
      nature: ["All about polar bears", "All about my favourite animal", "All about beavers", "All about the four seasons"],
      science: ["All about rockets", "All about volcanoes", "All about magnets", "All about the moon"],
      history: ["All about dinosaurs", "All about castles", "All about how kids lived long ago", "All about old trains"],
      canada: ["All about Canada's flag", "All about the Northern Lights", "All about hockey", "All about maple syrup"],
    },
    "3-4": {
      nature: ["Beavers: Canada's builders", "How the Northern Lights happen", "Grizzly bears of the Rockies", "Why bees matter"],
      science: ["How volcanoes erupt", "The water cycle", "How the internet gets to your house", "Chinook winds in Alberta"],
      history: ["Dinosaurs of Drumheller", "Life in a pioneer one-room school", "The first trains across Canada", "Ancient Egypt's pyramids"],
      canada: ["The Rocky Mountains", "The Calgary Stampede", "Canada's provinces and territories", "Indigenous Peoples of the Plains: the bison connection"],
    },
    "5-6": {
      nature: ["Dinosaurs of Drumheller and the Badlands", "Why bees matter to Alberta farms", "The water cycle in the Bow River", "Wolves: villains or heroes of the ecosystem?"],
      science: ["How vaccines protect us", "Electric cars: how they work", "How AI learns", "Volcanoes, earthquakes and plate tectonics"],
      history: ["The building of the Canadian Pacific Railway", "The Klondike Gold Rush", "Alberta's road to becoming a province (1905)", "The history of Treaty 7"],
      canada: ["How a bill becomes a law in Canada", "What a mayor and city council do", "How elections work in Canada", "Ottawa vs. the provinces: who decides what?"],
    },
  },
  procedure: {
    "1-2": {
      home: ["How to make a peanut butter sandwich", "How to brush your teeth", "How to make your bed super fast", "How to tidy your toys"],
      nature: ["How to build a snowman", "How to take care of a goldfish", "How to feed the birds in winter", "How to plant a seed"],
      school: ["How to be a good friend", "How to pack your backpack", "How to play tag", "How to line up quietly"],
      science: ["How to make a paper airplane", "How to mix colours", "How to build the tallest block tower", "How to make shadow puppets"],
    },
    "3-4": {
      home: ["How to make the best hot chocolate", "How to make bannock with an adult", "How to do your own laundry", "How to plan a movie night"],
      nature: ["How to survive a snow day", "How to build a bug hotel", "How to read animal tracks in snow", "How to catch (and release) a grasshopper"],
      school: ["How to score in your favourite sport", "How to study for a spelling test", "How to win at your favourite board game", "How to make a new student feel welcome"],
      science: ["How to make a paper airplane that really flies", "How to make slime", "How to build a baking-soda volcano", "How to code your first game in Scratch"],
    },
    "5-6": {
      home: ["How to plan the perfect birthday party", "How to cook one meal for your family", "How to save up for something big", "How to teach your dog a trick"],
      nature: ["How to stay safe hiking in the Rockies", "How to start a campfire safely (with an adult)", "How to grow vegetables in a short Alberta summer", "How to build a family emergency kit"],
      school: ["How to ace a class presentation", "How to actually remember what you study", "How to run for student council", "How to settle an argument fairly"],
      science: ["How to build a solar oven", "How to spot fake news online", "How to make a stop-motion movie", "How to protect your privacy online"],
    },
  },
  letter: {
    "1-2": {
      school: ["A thank-you letter to my teacher", "A letter to a friend who moved away", "An invitation to my birthday party", "A get-well letter for a classmate"],
      canada: ["A thank-you letter to a firefighter", "A letter to our mayor about our park", "A thank-you letter to someone kind in our town", "A letter to the zookeeper"],
      history: ["A letter asking Grandpa about the old days", "A letter to a knight in a castle", "A letter to a dinosaur", "A letter to my grandma far away"],
      imagine: ["A letter to Santa or the Tooth Fairy", "A letter to my favourite animal", "A letter to a dragon", "A letter to my favourite toy"],
    },
    "3-4": {
      school: ["A thank-you letter to a school helper", "A letter to my favourite author", "A letter of advice to next year's class", "A letter inviting a friend to visit Alberta"],
      canada: ["A letter to the principal with one idea to improve our school", "A letter to city council about our playground", "A thank-you letter to our crossing guard", "A letter to a community hero"],
      history: ["A letter to a pioneer kid", "A letter asking my grandparents about their childhood", "A letter to someone who lived 100 years ago", "A letter home from the gold rush"],
      imagine: ["A letter to my future Grade 6 self", "A letter to a wizard school", "A letter of complaint to the weather", "A letter to my pet (and their reply)"],
    },
    "5-6": {
      school: ["A letter to my Grade 1 self", "A letter to a pen pal about life in Alberta", "A letter to my future high-school self", "A letter nominating someone for an award"],
      canada: ["A letter to the mayor about our neighbourhood park", "A letter to my MLA about something Alberta should fix", "A letter to the editor of a newspaper", "A letter to the Prime Minister with one big idea"],
      history: ["A letter interviewing an elder about the past", "A letter to an explorer mapping Canada", "A letter to a kid living 100 years ago", "A letter to a soldier far from home, long ago"],
      imagine: ["A letter to myself, sealed for ten years", "A letter to the first kid on Mars", "A letter from your hero to their villain", "A letter of apology from the Big Bad Wolf"],
    },
  },
  poem: {
    "1-2": {
      nature: ["Snow!", "My favourite animal", "Rain on the window", "The colours of fall"],
      school: ["Recess sounds", "My backpack", "Lunchtime", "My best friend"],
      imagine: ["If I could fly", "A friendly monster under my bed", "My favourite colour", "The moon is following me"],
      science: ["Rocket countdown", "Robot dance", "Stars", "Bubbles"],
    },
    "3-4": {
      nature: ["A chinook is coming", "Autumn leaves in the schoolyard", "The first snowfall", "A prairie thunderstorm"],
      school: ["The sound of recess", "My messy room", "Waiting for summer vacation", "The library whisper"],
      imagine: ["The dragon in my closet", "If my dog could talk", "A door to anywhere", "Midnight in the toy box"],
      science: ["Blast-off!", "The life of a raindrop", "Inside my computer", "Northern lights"],
    },
    "5-6": {
      nature: ["Northern lights over the prairie", "Wheat fields in the wind", "The moment before the storm", "The last leaf of November"],
      school: ["The moment before the race starts", "An empty classroom in summer", "Exam room silence", "The bus ride home"],
      imagine: ["The city that sleeps all day", "A conversation with my shadow", "The museum at midnight", "What the wind remembers"],
      science: ["Signals", "The internet never sleeps", "Counting down to launch", "A robot dreams of summer"],
    },
  },
};

export function topicCategoriesFor(genreId: GenreId, grade: Grade): TopicCategory[] {
  const bank = TOPIC_BANK[genreId]?.[band(grade)] ?? {};
  return Object.entries(bank).map(([id, topics]) => ({
    id,
    name: CATEGORY_NAMES[id] ?? id,
    topics,
  }));
}
