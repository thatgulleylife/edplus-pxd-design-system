import type { CSSProperties } from 'react';

export interface MissionBlockProps {
  /**
   * The mission / pull-quote sentence. Rendered inside a semantic `<q>` and
   * split word-by-word into overflow-hidden masks so each word can rise into
   * place. Keep it to one or two sentences — the type ramps to 38px.
   */
  quote?: string;
  /**
   * Words or short phrases inside `quote` that take the brand accent color.
   * Matching is per-word and punctuation-insensitive, so the highlight
   * `"clarity"` also matches the rendered word `"clarity,"`. Case-insensitive.
   */
  highlights?: string[];
  /** Name shown beside the avatar under the quote. */
  attributionName?: string;
  /** Role / title line under the attribution name, rendered in muted ink. */
  attributionRole?: string;
  /**
   * Two-letter monogram used for the gradient avatar chip when `avatarSrc`
   * is not supplied. This is the source design's default treatment.
   */
  avatarInitials?: string;
  /**
   * Optional 46×46 circular portrait. Use a design-system placeholder such as
   * `../../faces/placeholders/avatar-01.svg` (01–06). Omit to fall back to the
   * initials chip.
   */
  avatarSrc?: string;
  /**
   * Character used for the oversized decorative quote mark bled off the card's
   * top-left corner (200px Georgia, 16% accent). Defaults to a left double
   * curly quote. Purely decorative — it is `aria-hidden`.
   */
  quoteMark?: string;
  /**
   * Render the oversized white radial "sheen" hung off the card's top-right.
   * Turn off for a flatter surface. Default `true`.
   */
  showSheen?: boolean;
  /**
   * Enable the scroll-triggered reveals (card rise + staggered word rise).
   * When `false` the block renders in its rested state immediately. Reveals
   * are also short-circuited under `prefers-reduced-motion: reduce`.
   * Default `true`.
   */
  animate?: boolean;
  /**
   * Per-word stagger for the quote reveal, in milliseconds. The source uses
   * 42ms; raise it for a slower typewriter-ish cadence on short quotes.
   */
  wordStagger?: number;
  /** Optional DOM id on the `<section>`, useful as an in-page anchor target. */
  id?: string;
  /** Extra class names appended to the section's own `edp-mission` class. */
  className?: string;
  /**
   * Style overrides merged onto the outer `<section>` (the page-width wrapper),
   * e.g. to change the 104px top margin or the max width.
   */
  style?: CSSProperties;
}

export declare function MissionBlock(props: MissionBlockProps): JSX.Element;
