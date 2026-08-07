import type { CSSProperties } from 'react';

export interface OurStoryProps {
  /** DOM id for the <section>. Also seeds the blockquote id used by aria-labelledby. Default: 'our-story'. */
  id?: string;
  /** Small uppercase label above the quote, rendered next to a short accent rule. */
  eyebrow?: string;
  /** The display pull-quote. Split on whitespace into per-word masks that rise line-by-line on reveal. */
  quote?: string;
  /** Attribution line under the quote (e.g. '— Title, Name'). Include the dash yourself. */
  attribution?: string;
  /** Small muted caption in the footer row, left of the CTA. */
  caption?: string;
  /** Label for the pill CTA link in the footer row. */
  ctaLabel?: string;
  /** Destination for the pill CTA link. Default: '#'. */
  ctaHref?: string;
  /** Source for the media image in the right column. Defaults to a neutral placeholder. */
  mediaSrc?: string;
  /** Alt text for the media image. Required for meaningful images; pass '' if purely decorative. */
  mediaAlt?: string;
  /** Optional image src for the decorative quotation mark behind the quote. When omitted, an inline SVG quote glyph tinted with --accent-soft is drawn instead. */
  quoteMarkSrc?: string | null;
  /** Whether to draw the decorative quotation mark at all. Default: true. */
  showQuoteMark?: boolean;
  /** Seconds of delay between each visual line of the quote rising. Default: 0.14. */
  lineGap?: number;
  /** Extra inline styles merged onto the root <section> (e.g. background, extra padding). */
  style?: CSSProperties;
}

export declare function OurStory(props: OurStoryProps): JSX.Element;
