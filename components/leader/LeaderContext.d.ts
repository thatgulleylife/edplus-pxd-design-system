/** Icon drawn in the card's 48×48 tinted well. */
export type LeaderContextIcon = 'data' | 'pulse' | 'warn';

/**
 * Color family for a card's icon well and badge.
 * `rose` = brand accent, `green` = positive, `risk` = caution/amber.
 */
export type LeaderContextTone = 'rose' | 'green' | 'risk';

export interface LeaderContextCard {
  /** Which glyph fills the icon well. Defaults to `data` when omitted/unknown. */
  icon?: LeaderContextIcon;
  /** Color family for the icon well and badge. Defaults to `rose`. */
  tone?: LeaderContextTone;
  /** Card heading — 21px, bold, sits on the same row as the badge. */
  title?: string;
  /** Optional pill beside the title (e.g. a short before/after or status). Omit to hide. */
  badge?: string;
  /**
   * One short paragraph of supporting copy. Supports `**bold**`, which renders
   * as `<b>` in ink — the same markdown-lite pass the source page applies.
   */
  body?: string;
}

export interface LeaderContextCta {
  /** Button/link text. The trailing arrow is added automatically. Omit to hide the CTA entirely. */
  label?: string;
  /** When set, the CTA renders as an `<a>` opening in a new tab; otherwise a `<button>`. */
  href?: string;
  /** Click handler for the `<button>` form (ignored when `href` is set). */
  onClick?: () => void;
}

export interface LeaderContextProps {
  /** ALL-CAPS kicker above the headline, preceded by a short accent rule. */
  eyebrow?: string;
  /** Panel headline — the section's `<h2>`, clamp(26px, 3vw, 38px), extrabold. */
  title?: string;
  /** Stacked cards inside the panel. Rendered in order with an 0.08s reveal stagger each. */
  cards?: LeaderContextCard[];
  /** Optional centered outline-pill call to action below the card stack. */
  cta?: LeaderContextCta;
  /**
   * Play the scroll-reveal entrance (fade + 34px rise, staggered per element).
   * Set `false` for static previews or snapshots. `prefers-reduced-motion: reduce`
   * skips the motion regardless.
   */
  animate?: boolean;
  /** Explicit id for the `<h2>`; the section's `aria-labelledby` points at it. Auto-generated when omitted. */
  headingId?: string;
}

export declare function LeaderContext(props: LeaderContextProps): JSX.Element;
