import type { CommentKind, ReportCard, SentenceMark } from "../types";

/**
 * One number out of 100, built from the report card the coach already writes.
 *
 * The rubric grades five dimensions 1-4. A "1" is Limited, not a zero, so the
 * four levels map evenly onto 40 / 60 / 80 / 100 — i.e. points = 20 × level + 20.
 * That keeps the scale linear, so a fractional level (see below) converts with
 * the same formula and a child who improves always sees the number move.
 */
export const POINTS_PER_LEVEL = 20;
export const POINTS_FLOOR = 20;

function levelToPoints(level: number): number {
  return POINTS_PER_LEVEL * level + POINTS_FLOOR;
}

export type DimensionKey = "content" | "organization" | "sentence" | "vocabulary" | "conventions";

/** Which rubric dimension a sentence-level note belongs to. Praise isn't a fix. */
const KIND_DIMENSION: Record<CommentKind, DimensionKey | null> = {
  grammar: "conventions",
  structure: "sentence",
  vocabulary: "vocabulary",
  content: "content",
  praise: null,
};

/**
 * The model writes the dimension names itself, so match on meaning rather than
 * on an exact string. An unrecognised name still scores — it just collects no
 * sentence-level fixes, exactly like Organization, which is a whole-piece call.
 */
export function dimensionKey(name: string): DimensionKey | null {
  const n = name.toLowerCase();
  if (n.includes("organ") || n.includes("structure of") || n.includes("order")) return "organization";
  if (n.includes("sentence") || n.includes("fluency") || n.includes("syntax")) return "sentence";
  if (n.includes("vocab") || n.includes("word")) return "vocabulary";
  if (n.includes("convention") || n.includes("grammar") || n.includes("spelling") || n.includes("mechanic"))
    return "conventions";
  if (n.includes("content") || n.includes("idea")) return "content";
  return null;
}

export interface ScoreRow {
  dimension: string;
  key: DimensionKey | null;
  /** 1-4 exactly as the coach graded it. */
  baseLevel: number;
  /** Where the student's own fixes have carried it, 1-4, possibly fractional. */
  level: number;
  points: number;
  issues: number;
  resolved: number;
}

export interface Score {
  /** 0-100 including the student's fixes. */
  points: number;
  /** 0-100 as the coach originally graded it. */
  base: number;
  /** points − base: what the fixes are worth, 0 when nothing is fixed yet. */
  gain: number;
  band: { label: string; hl: string };
  rows: ScoreRow[];
  issues: number;
  resolved: number;
}

const BANDS: { min: number; label: string; hl: string }[] = [
  { min: 95, label: "Excellent", hl: "hl-g" },
  { min: 80, label: "Proficient", hl: "hl-b" },
  { min: 60, label: "Adequate", hl: "hl-y" },
  { min: 0, label: "Growing", hl: "hl-p" },
];

export function bandFor(points: number): { label: string; hl: string } {
  return BANDS.find((b) => points >= b.min) ?? BANDS[BANDS.length - 1];
}

function clampLevel(level: unknown): number {
  const n = typeof level === "number" && Number.isFinite(level) ? level : 2;
  return Math.min(4, Math.max(1, n));
}

/**
 * Score a card. `marks` are the student's decisions in the finished piece:
 * a sentence they rewrote counts its notes as addressed, one they chose to
 * keep does not — so undoing a fix moves the number back down.
 *
 * A rewrite earns the credit without the coach re-reading it, which is why the
 * badge labels any gain as provisional and points at Re-check: regenerating
 * the card is what turns a projected score into a graded one.
 */
export function computeScore(
  card: ReportCard | null | undefined,
  marks: Record<number, SentenceMark> = {}
): Score | null {
  const rubric = card?.rubric;
  if (!card || !Array.isArray(rubric) || rubric.length === 0) return null;

  const issues: Record<string, number> = {};
  const resolved: Record<string, number> = {};
  card.sentences?.forEach((sentence, index) => {
    const fixed = marks[index] === "revised";
    sentence.comments?.forEach((comment) => {
      const key = KIND_DIMENSION[comment.kind];
      if (!key) return;
      issues[key] = (issues[key] ?? 0) + 1;
      if (fixed) resolved[key] = (resolved[key] ?? 0) + 1;
    });
  });

  const rows: ScoreRow[] = rubric.map((row) => {
    const key = dimensionKey(row.dimension ?? "");
    const baseLevel = clampLevel(row.level);
    const found = key ? (issues[key] ?? 0) : 0;
    const done = key ? (resolved[key] ?? 0) : 0;
    // Clearing every note in a dimension carries it the whole way to 4;
    // clearing half carries it half way. Nothing found leaves it as graded.
    const level = found > 0 ? baseLevel + (done / found) * (4 - baseLevel) : baseLevel;
    return {
      dimension: row.dimension,
      key,
      baseLevel,
      level,
      points: levelToPoints(level),
      issues: found,
      resolved: done,
    };
  });

  const average = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length;
  const points = Math.round(average(rows.map((r) => r.points)));
  const base = Math.round(average(rows.map((r) => levelToPoints(r.baseLevel))));

  return {
    points,
    base,
    gain: points - base,
    band: bandFor(points),
    rows,
    issues: rows.reduce((sum, r) => sum + r.issues, 0),
    resolved: rows.reduce((sum, r) => sum + r.resolved, 0),
  };
}

/** The score a freshly written card gives, before the student fixes anything. */
export function baseScore(card: ReportCard | null | undefined): number | null {
  return computeScore(card, {})?.points ?? null;
}

/** How many graded scores a piece remembers. */
export const SCORE_HISTORY_MAX = 12;
