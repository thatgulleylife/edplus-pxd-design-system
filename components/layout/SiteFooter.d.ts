import type { CSSProperties, HTMLAttributes } from 'react';

/** A single link rendered in the footer's link row (`.flinks a`). */
export interface SiteFooterLink {
  /** Visible link text, e.g. 'Section One'. */
  label: string;
  /** Destination href — hash anchor, relative path, or absolute URL. */
  href: string;
  /** When true, opens in a new tab with `rel="noreferrer noopener"`. */
  external?: boolean;
}

/**
 * SiteFooter — the shared bottom-of-page footer band.
 *
 * A full-bleed rule (`border-top: 1px solid var(--line)`) above a centred
 * 1280px wrap. Inside, a two-column flex row that wraps on narrow viewports:
 * the brand lockup (pulsing accent dot + wordmark) plus a muted copy line on
 * the left, and a horizontal row of nav links on the right.
 */
export interface SiteFooterProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  /** Brand / wordmark text shown next to the accent dot. Keep it short — it sits on one line at 15px/600. */
  brand?: string;
  /** Muted secondary line below the brand (max-width 520px) — e.g. a "last updated" note or short legal line. Pass an empty string to omit it. */
  copy?: string;
  /** Links rendered on the right side of the footer row. Pass an empty array to hide the link row entirely. */
  links?: SiteFooterLink[];
  /** Render the 11px accent dot before the brand wordmark. Default true. */
  showDot?: boolean;
  /** Run the shared `pulse` keyframe halo on the accent dot (2.6s ease-out infinite). Set false for static contexts such as print or screenshots. Default true. */
  animateDot?: boolean;
  /** Max width of the centred content wrap. Defaults to the `--maxw` token (1280px). */
  maxWidth?: string;
  /** Accessible name for the footer's `<nav>` landmark. Defaults to 'Footer'. */
  linksLabel?: string;
  /** Extra inline styles merged onto the `<footer>` element (applied last, so they win). */
  style?: CSSProperties;
}

export declare function SiteFooter(props: SiteFooterProps): JSX.Element;
