import type { ReactNode } from "react";
import type { GenreId, Stage } from "../types";

/**
 * Stroke-icon set for the Highlighter design system. All icons are drawn on a
 * 24px grid, inherit `currentColor`, and scale via the `size` prop.
 */

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

function Svg({
  size = 18,
  className,
  strokeWidth = 2,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></Svg>
);
export const ArrowLeftIcon = (p: IconProps) => (
  <Svg {...p}><path d="M15 18l-6-6 6-6" /></Svg>
);
export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></Svg>
);
export const SendIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 11l18-8-8 18-2-8-8-2z" /></Svg>
);
export const CheckIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 12l5 5L20 7" /></Svg>
);
export const XIcon = (p: IconProps) => (
  <Svg {...p}><path d="M6 6l12 12" /><path d="M18 6L6 18" /></Svg>
);
export const StarIcon = (p: IconProps & { filled?: boolean }) => (
  <svg
    width={p.size ?? 18}
    height={p.size ?? 18}
    viewBox="0 0 24 24"
    fill={p.filled ? "#fdf151" : "none"}
    stroke="currentColor"
    strokeWidth={p.strokeWidth ?? 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={p.className}
    aria-hidden="true"
  >
    <path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.8z" />
  </svg>
);
export const WandIcon = (p: IconProps) => (
  <Svg {...p}><path d="M5 19L16 8" /><path d="M17 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" /></Svg>
);
export const StretchIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 12h18" /><path d="M7 8l-4 4 4 4" /><path d="M17 8l4 4-4 4" /></Svg>
);
export const MagnifierIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="10" cy="10" r="6" /><path d="M14.5 14.5L20 20" /></Svg>
);
export const LeafIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 3c1 3 4 5 7 5-1 4-4 8-7 13C9 16 6 12 5 8c3 0 6-2 7-5z" /></Svg>
);
export const PencilIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 20l1-4L16 5l3 3L8 19l-4 1z" /><path d="M14 7l3 3" /></Svg>
);
export const LightbulbIcon = (p: IconProps) => (
  <Svg {...p}><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 00-4 10c.8.8 1 1.5 1 2h6c0-.5.2-1.2 1-2a6 6 0 00-4-10z" /></Svg>
);
export const SparkleIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5z" /><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></Svg>
);
export const CopyIcon = (p: IconProps) => (
  <Svg {...p}><rect x="9" y="9" width="11" height="11" rx="1.5" /><path d="M5 15H4V4h11v1" /></Svg>
);
export const PrinterIcon = (p: IconProps) => (
  <Svg {...p}><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="1.5" /><path d="M7 14h10v7H7z" /></Svg>
);
export const GymIcon = (p: IconProps) => (
  <Svg {...p}><path d="M2 12h3" /><path d="M19 12h3" /><rect x="5" y="8" width="3" height="8" rx="1" /><rect x="16" y="8" width="3" height="8" rx="1" /><path d="M8 12h8" /></Svg>
);
export const TargetIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.5" /></Svg>
);
export const LayersIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></Svg>
);
export const BridgeIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 18v-8" /><path d="M21 18v-8" /><path d="M3 12c6-5 12-5 18 0" /><path d="M8 10.5V18" /><path d="M16 10.5V18" /></Svg>
);
export const BookIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 6c-2-1.6-5-2-8-2v14c3 0 6 .4 8 2 2-1.6 5-2 8-2V4c-3 0-6 .4-8 2v16" /></Svg>
);
export const BubbleIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 5h16v11H10l-6 4V5z" /></Svg>
);
export const FlaskIcon = (p: IconProps) => (
  <Svg {...p}><path d="M10 3v6l-5.2 9a2 2 0 001.7 3h11a2 2 0 001.7-3L14 9V3" /><path d="M8 3h8" /></Svg>
);
export const ListIcon = (p: IconProps) => (
  <Svg {...p}><path d="M9 6h12" /><path d="M9 12h12" /><path d="M9 18h12" /><path d="M4 5l1 1 2-2" /><path d="M4 11l1 1 2-2" /><path d="M4 17l1 1 2-2" /></Svg>
);
export const EnvelopeIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M3 7l9 6 9-6" /></Svg>
);
export const FeatherIcon = (p: IconProps) => (
  <Svg {...p}><path d="M20 4c-6 0-11 3-13 8l-3 8" /><path d="M20 4c1 5-2 10-7 12H8" /><path d="M9 13h6" /></Svg>
);

export function GenreIcon({ genre, ...p }: IconProps & { genre: GenreId }) {
  switch (genre) {
    case "story": return <BookIcon {...p} />;
    case "opinion": return <BubbleIcon {...p} />;
    case "report": return <FlaskIcon {...p} />;
    case "procedure": return <ListIcon {...p} />;
    case "letter": return <EnvelopeIcon {...p} />;
    case "poem": return <FeatherIcon {...p} />;
  }
}

export function StageIcon({ stage, ...p }: IconProps & { stage: Stage }) {
  switch (stage) {
    case "plan": return <LightbulbIcon {...p} />;
    case "draft": return <PencilIcon {...p} />;
    case "polish": return <WandIcon {...p} />;
    case "shine": return <SparkleIcon {...p} />;
  }
}

export function LessonIcon({ lessonId, ...p }: IconProps & { lessonId: string }) {
  switch (lessonId) {
    case "super-sentences": return <StarIcon {...p} />;
    case "topic-sentence": return <TargetIcon {...p} />;
    case "hamburger": return <LayersIcon {...p} />;
    case "elaboration": return <MagnifierIcon {...p} />;
    case "word-power": return <WandIcon {...p} />;
    case "sentence-stretch": return <StretchIcon {...p} />;
    case "transitions": return <BridgeIcon {...p} />;
    default: return <BookIcon {...p} />;
  }
}

/** Hand-drawn marker circle around the active nav item. */
export function MarkerCircle({
  children,
  color = "#ff7ad9",
  active,
}: {
  children: ReactNode;
  color?: string;
  active: boolean;
}) {
  return (
    <span className="relative inline-block px-2 py-0.5">
      {children}
      {active && (
        <svg
          className="absolute pointer-events-none"
          style={{ inset: "-7px -9px", width: "calc(100% + 18px)", height: "calc(100% + 14px)" }}
          viewBox="0 0 100 44"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 22c0-10 20-16 42-16s42 5 42 15-22 17-46 17S8 32 12 18"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}

/** Fluoro rotation used to colour lists of things (planner boxes, cards…). */
export const HL_CYCLE = ["hl-y", "hl-b", "hl-g", "hl-p"] as const;
export const MARKERS = { y: "#fdf151", p: "#ff7ad9", g: "#a7f95c", b: "#7de8ff" } as const;
