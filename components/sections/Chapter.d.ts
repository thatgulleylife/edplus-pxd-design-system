import type { CSSProperties, ReactNode } from 'react';

/** One segment of the proportional bar (`.viz-bar > .viz-seg`). */
export interface ChapterVizSegment {
  /** Label printed inside the segment (16px / 700, never wraps). */
  label?: string;
  /** Percentage width. Omit on the last segment so it takes the remaining space (`flex:1`). */
  share?: number;
  /** 'solid' paints the 140deg accent → accent-deep gradient with white text; 'soft' paints the light accent tint with accent text. Default: 'solid'. */
  tone?: 'solid' | 'soft';
  /** Escape hatch: any CSS background value, overriding the tone fill. */
  background?: string;
}

/** One entry in the legend row under the proportional bar (`.viz-legend .lg`). */
export interface ChapterVizLegendItem {
  /** Bold ink label, e.g. 'In line'. */
  label?: string;
  /** Muted value printed after an em dash, e.g. '60 min'. */
  value?: string;
  /** Swatch fill — matches the segment it describes. Default: 'solid'. */
  tone?: 'solid' | 'soft';
}

/** The full-width proportional bar block that closes the first chapter. */
export interface ChapterViz {
  /** Mono uppercase caption above the bar. */
  label?: string;
  /** Segments, left to right. Give every segment but the last a `share`. */
  segments?: ChapterVizSegment[];
  /** Legend entries rendered under the bar. */
  legend?: ChapterVizLegendItem[];
}

/** The bordered "Problem" card in the left column of the two-column grid. */
export interface ChapterProblem {
  /** Mono uppercase label at the top of the card (e.g. 'Problem'). */
  label?: string;
  /** The statement itself — 20px / 800, the card's headline. */
  headline?: string;
}

export interface ChapterProps {
  /** DOM id for the <section>. Also seeds the heading id used by aria-labelledby. */
  id?: string;
  /** The chapter marker text — rendered in mono caps, e.g. 'Chapter 01'. Pass '' to omit the eyebrow entirely. */
  marker?: string;
  /** 'rule' draws the mono marker followed by a hairline rule filling the row (chapters 01–03). 'accent' draws a short accent dash + caps accent label (the portfolio variant). 'none' hides it. Default: 'rule'. */
  markerVariant?: 'rule' | 'accent' | 'none';
  /** Section headline. Newlines become <br>, so 'The team's role\nin the queue' matches the source's two-line heading. */
  headline?: string | ReactNode;
  /** Word or words inside `headline` to paint in --accent (string or array, case-insensitive). */
  headlineAccent?: string | string[];
  /** Heading level for the headline element — keeps document outline correct when a page has more than one h2. Default: 2. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** 'wide' adds the source's 44px gap below a standalone headline; 'tight' sets margin 0 when a subhead follows. Defaults to 'tight' when a subhead, hint, or grid is present, otherwise 'wide'. */
  headlineSpacing?: 'wide' | 'tight';
  /** Muted supporting paragraph under the headline (16.5px / 1.6, max-width 480 when left aligned). */
  subhead?: string;
  /** Optional accent pill under the subhead — the "tap any card to flip it" style affordance note. */
  hint?: string;
  /** Icon node for the hint pill. Defaults to the source's cursor/tap arrow; pass null for no icon. */
  hintIcon?: ReactNode | null;
  /** 'center' centers the eyebrow row, headline, and subhead (the portfolio variant). Default: 'left'. */
  align?: 'left' | 'center';
  /** When true the section sits on a full-bleed tinted band drawn by a ::before that bleeds to both viewport edges. Default: false. */
  tinted?: boolean;
  /** Background of the tint band. Default: 'var(--bg-soft)'. */
  tintColor?: string;
  /** Renders the bordered problem card in the left column of the two-column grid. Presence of this or `lead` turns the grid on. */
  problem?: ChapterProblem;
  /** The large lead paragraph in the right column of the grid (clamp 18–22px in --ink). */
  lead?: string | ReactNode;
  /** Substring of `lead` to render as italic --accent emphasis, matching the source's <em>. */
  leadEmphasis?: string;
  /** Renders the full-width proportional bar + legend below the grid. */
  viz?: ChapterViz;
  /** Runs the `.sreveal` scroll-reveal motion (float up 34px, opacity 0→1). Set false to render in the rested state. Default: true. */
  animate?: boolean;
  /** Section body — timelines, carousels, pill clouds, or any other block that lives inside this chapter. */
  children?: ReactNode;
  /** Extra class names appended to the root section class. */
  className?: string;
  /** Extra inline styles merged onto the root <section>. */
  style?: CSSProperties;
}

export declare function Chapter(props: ChapterProps): JSX.Element;
