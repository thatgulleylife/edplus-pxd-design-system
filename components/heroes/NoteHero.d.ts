import type { CSSProperties, JSX } from 'react';

/**
 * One segment of a headline line. Segments render inline, side by side; a
 * segment with `accent: true` takes the brand accent color (the `.accent`
 * span in the source markup).
 */
export interface NoteHeroHeadlineSegment {
  /** The visible text of this segment. */
  text: string;
  /** When true, this segment renders in `var(--accent)` instead of `var(--ink)`. */
  accent?: boolean;
}

/**
 * A single rendered line of the headline. Lines are separated by hard `<br>`
 * breaks, matching the source's manually-broken editorial headline. Pass a
 * plain string for an all-ink line, or an array of segments to mix ink and
 * accent within one line.
 */
export type NoteHeroHeadlineLine =
  | string
  | Array<string | NoteHeroHeadlineSegment>;

export interface NoteHeroProps {
  /**
   * ALL-CAPS kicker above the headline, rendered in the accent color with
   * `--ls-caps` tracking. Pass an empty string or null to hide it.
   */
  eyebrow?: string;

  /**
   * The oversized editorial headline, one array entry per rendered line.
   * Lines are joined with hard `<br>` breaks so the headline breaks exactly
   * where the author intends rather than reflowing. Type scale is
   * `clamp(46px, 6.6vw, 96px)` at `--fw-extrabold` / `--ls-tightest` /
   * line-height 0.94.
   */
  headlineLines?: NoteHeroHeadlineLine[];

  /**
   * Supporting paragraph under the headline. Pass a string for a single
   * auto-wrapping paragraph, or an array of strings to force a line break
   * between each entry (the source breaks its lead manually). Capped at
   * 640px wide with `text-wrap: balance`.
   */
  lead?: string | string[];

  /**
   * Display name shown in the pill-shaped byline row. Also the source of the
   * avatar initials when `avatarInitials` is not supplied.
   */
  authorName?: string;

  /**
   * Role / title line shown after the middle dot in the byline. Rendered in
   * `--muted` at 12.5px; the separator dot hides below 560px where the pill wraps.
   */
  authorRole?: string;

  /**
   * Explicit initials for the 30px accent-filled avatar circle. Defaults to the
   * first letters of the first two words of `authorName`.
   */
  avatarInitials?: string;

  /**
   * Optional image for the avatar circle, replacing the initials. Prefer the
   * bundled neutral placeholders, e.g. `../../faces/placeholders/avatar-03.svg`.
   */
  avatarSrc?: string;

  /**
   * Image for the media column. This image intentionally overhangs the right
   * edge of the content column — its width is
   * `calc(100% + var(--gutter) + 32px)` — so the host page should set
   * `overflow-x: clip` on the body. `object-fit: contain` with
   * `object-position: left center`, height `clamp(380px, 42vw, 560px)`.
   * When omitted, a soft accent-tinted panel renders at the same geometry.
   */
  mediaSrc?: string;

  /**
   * Alt text for the media image (also used as the accessible label for the
   * placeholder panel). Keep it descriptive — the image is content, not decoration.
   */
  mediaAlt?: string;

  /**
   * When true (default), the two columns animate in on scroll with the shared
   * `.sreveal` motion — translateY(34px) → 0 over
   * `transform 1.15s var(--ease-spring)` with a 1s opacity fade — driven by the
   * site's directional IntersectionObserver pair. Set false to render revealed
   * immediately (previews, print, static capture).
   */
  revealOnScroll?: boolean;

  /**
   * Seconds the media column trails the text column on reveal. Matches the
   * source's inline `transition-delay:.12s`.
   */
  mediaRevealDelay?: number;

  /** Extra class names merged onto the root `<section>`. */
  className?: string;

  /** Inline style overrides merged onto the root `<section>` (padding, grid, etc.). */
  style?: CSSProperties;
}

export declare function NoteHero(props: NoteHeroProps): JSX.Element;
