import * as React from 'react';

/** Built-in generic line-icon glyph names available for `TeamItem.icon`. */
export type TeamIconName =
  | 'database'
  | 'layout'
  | 'sparkle'
  | 'search'
  | 'code'
  | 'journey'
  | 'bulb'
  | 'rocket';

/** Map of built-in glyph name → ready-to-render 24×24 stroke SVG element. */
export declare const TEAM_ICONS: Record<TeamIconName, JSX.Element>;

/** One tile in the teams grid. */
export interface TeamItem {
  /** Stable React key / identifier for the tile. Falls back to `slug`, then `team`, then index. */
  id?: string;
  /** Alternate identifier (kept for parity with slug-based routing). */
  slug?: string;
  /** Team name — the large 29px headline inside the tile. Required. */
  team: string;
  /** Name of the person leading the team. Rendered as the bold 14.5px line under the team name. */
  lead?: string;
  /** Role / title of the lead. Rendered as the muted 13px line under the lead name. */
  role?: string;
  /** Built-in glyph name for the 48×48 accent-soft icon well. Defaults to `layout`. */
  icon?: TeamIconName;
  /** Custom icon element, overrides `icon`. Should be a 25×25 currentColor SVG. */
  iconNode?: React.ReactNode;
  /** Headcount shown in the pill chip at the top-right. Only rendered when `showHeadcount` is true. */
  count?: number;
  /** If provided the tile renders as an `<a href>` instead of a `<button>`. */
  href?: string;
  /** Per-tile override of the hover-revealed affordance label (beats `moreLabel`/`moreLabelPrefix`). */
  moreLabel?: string;
}

export interface TeamsBlockProps {
  /** DOM id on the `<section>`. Used as the in-page anchor target. Default `'teams'`. */
  id?: string;
  /** Small uppercase accent eyebrow above the headline. Pass '' to hide. */
  eyebrow?: string;
  /** Section `<h2>` copy. `\n` renders as a hard line break, matching the source `<br/>`. */
  heading?: string;
  /** Muted supporting paragraph shown at the right end of the section head. Pass '' to hide. */
  subhead?: string;
  /** The tiles to render. Defaults to eight generic placeholder teams. */
  teams?: TeamItem[];
  /** Desktop column count for the grid. Default 4. Collapses to 2 at ≤1000px and 1 at ≤520px. */
  columns?: number;
  /** Prefix for the hover-revealed label, combined with the lead's first name (e.g. "Meet Alex"). */
  moreLabelPrefix?: string;
  /** Fixed label for every tile's hover affordance; overrides the prefix + first-name composition. */
  moreLabel?: string;
  /** Show the accent headcount pill in each tile's top-right corner. Default false. */
  showHeadcount?: boolean;
  /** Text appended after the headcount number in the pill (e.g. ' people'). */
  headcountSuffix?: string;
  /** Wrap the content in the standard centered page container. Default true. */
  contained?: boolean;
  /** Max width of the inner container when `contained`. Number is treated as px. Default 1280. */
  maxWidth?: number | string;
  /** Run the IntersectionObserver entrance choreography (float-up head + cardRise tiles). Default true. */
  revealOnScroll?: boolean;
  /** Called when a tile is activated. Receives the team, its index, and the click event. */
  onTeamSelect?: (team: TeamItem, index: number, event: React.MouseEvent) => void;
  /** Extra inline styles merged onto the root `<section>`. */
  style?: React.CSSProperties;
  /** Extra class names appended to the root `<section>`. */
  className?: string;
}

export declare function TeamsBlock(props: TeamsBlockProps): JSX.Element;

export default TeamsBlock;
