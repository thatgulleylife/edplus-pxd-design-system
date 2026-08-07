import type { CSSProperties } from 'react';

/** Visual treatment for a milestone's icon well and metric pill. */
export type TeamHistoryTone =
  /** Maroon tint — `--accent` at 10% (well) / 8% (pill), accent foreground. */
  | 'accent'
  /** Gold tint — `--gold` at 18%, `--color-gold-ink` foreground. */
  | 'gold'
  /** Solid `--ink` well and pill with reversed-out foreground — used on the final "now" entry. */
  | 'ink';

/** Glyph shown in the 36px circular well above each year. */
export type TeamHistoryIcon =
  /** Outlined 5-point star (1.3 stroke). */
  | 'star'
  /** Filled 5-point star — pairs with the solid `ink` tone. */
  | 'star-solid'
  /** Rising trend line with an arrow head. */
  | 'trend'
  /** Circular refresh / loop arrow. */
  | 'loop';

/** One year card in the horizontal strip. */
export interface TeamHistoryMilestone {
  /** The year label — rendered at 64px/800 in the card and again as a scrubber tick. */
  year: string;
  /** Small uppercase metric chip under the year (e.g. "Metric label"). Omit to hide the pill. */
  tag?: string;
  /** Card headline, 18px/800 — renders as an `h3`. */
  title: string;
  /** Supporting sentence(s), 14px muted, capped at 300px wide. */
  description: string;
  /** Icon-well and pill treatment. Defaults to `'accent'`. */
  tone?: TeamHistoryTone;
  /** Which glyph to show in the icon well. Defaults to the outlined star. */
  icon?: TeamHistoryIcon;
}

/**
 * TeamHistory — a full-bleed, scroll-driven horizontal year strip pinned in a
 * sticky viewport.
 *
 * The section breaks out of the content column (`width:100vw;
 * margin-left:calc(50% - 50vw)`) but insets its header, scrubber and first year
 * card by `var(--gutter)`, so everything lines up with the 1280px column on the
 * left while the strip runs off the right edge. `--gutter` falls back to
 * `max(56px, calc(50vw - 584px))` (24px under 680px) when the host page has not
 * declared it.
 *
 * A tall (`600vh` by default) container drives the motion: as it scrolls under
 * the sticky viewport, normalized progress is remapped through `leadHold` /
 * `tailHold` dead zones, then chased by a rAF lerp (`current += (target -
 * current) * follow`, settling under 0.0004) that translates the strip by
 * `progress * (strip.scrollWidth - (innerWidth - gutter))`. The same progress
 * fills the 2px scrubber and lights the year ticks up to the nearest index.
 *
 * Under `prefers-reduced-motion: reduce` the lerp is skipped (position still
 * tracks scroll, it just jumps) and the header reveal is disabled.
 *
 * @startingPoint section="Sections" subtitle="Scroll-driven full-bleed year timeline in a sticky viewport" viewport="1440x900"
 */
export interface TeamHistoryProps {
  /** Small uppercase kicker above the headline, in accent color, preceded by a 26x2 accent rule. */
  eyebrow?: string;
  /** Section headline, rendered as the `h2`. Use `\n` to force a line break. */
  title?: string;
  /** The year cards, left to right. Length also sets the scrubber tick count. */
  milestones?: TeamHistoryMilestone[];
  /** Text of the top-right scroll affordance; it fades from 0.4 to 0 once scrolling starts. */
  scrollHintLabel?: string;
  /** Show the top-right scroll hint. Defaults to `true`. */
  showScrollHint?: boolean;
  /** Show the 2px progress scrubber and its year ticks. Defaults to `true`. */
  showScrubber?: boolean;
  /** Height of the tall scroll driver — how much page scroll the strip consumes. Defaults to `'600vh'`. */
  scrollDepth?: string;
  /** Min-width of each year card in px. Defaults to `480`. */
  itemWidth?: number;
  /** Right padding between year cards in px (the strip itself has `gap:0`). Defaults to `96`. */
  itemGap?: number;
  /** Width of the trailing spacer in px, so the last card isn't flush right. Defaults to `64`. */
  trailingSpace?: number;
  /** Fraction of the pinned range held still at the start before the strip moves. Defaults to `0.12`. */
  leadHold?: number;
  /** Fraction of the pinned range held on the final year before unpinning. Defaults to `0.06`. */
  tailHold?: number;
  /** Lerp factor per rAF frame — lower glides longer, `1` is a hard 1:1 scroll bind. Defaults to `0.12`. */
  follow?: number;
  /** Called every animation frame with the eased progress (0-1). Useful for syncing sibling UI. */
  onProgress?: (progress: number) => void;
  /** `id` on the `<section>`, for anchor links. Defaults to `'team-history'`. */
  sectionId?: string;
  /** Extra inline styles merged onto the `<section>` root. */
  style?: CSSProperties;
}

export declare function TeamHistory(props: TeamHistoryProps): JSX.Element;
