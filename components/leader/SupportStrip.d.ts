/** Built-in glyph keys for a support card's icon well. Purely decorative line/solid
 *  icons drawn at 15x15 inside a 36px (28px when collapsed) circular well.
 *  Unknown or omitted keys fall back to `lightning`. */
export type SupportIconKey =
  | 'lightning'
  | 'user'
  | 'migrate'
  | 'chat'
  | 'globe'
  | 'link'
  | 'chart'
  | 'shield'
  | 'flow'
  | 'database'
  | 'network'
  | 'eye'
  | 'rocket'
  | 'present'
  | 'education';

/** Three-stop palette for a card's generated wave artwork, in order:
 *  `[background, midtone stroke, accent stroke]`. Alternating curves use the
 *  midtone and accent values. Accepts any CSS colour, including `var(--token)`. */
export type SupportWaveColors = [string, string, string];

/** One card in the strip. Matches the shape the source page's data layer emits. */
export interface SupportItem {
  /** Card title. Shown at 27px/600 when the card is expanded and at 14px/700
   *  pinned to the bottom of the card when it is collapsed. Required. */
  t: string;
  /** Body copy, shown only on the expanded card at 13.5px muted. Optional. */
  d?: string;
  /** Optional secondary line between the title and the body on the expanded card —
   *  smaller, bolder, ink-coloured. Use for a short qualifier or metric label. */
  sub?: string;
  /** Which built-in glyph fills the card's icon well. */
  icon?: SupportIconKey | string;
  /** Optional artwork for the 200px top band of the expanded card (150px on mobile).
   *  When set, this image replaces the generated wave and `colors` is ignored.
   *  Use a generic/abstract image — never a photo of a real person. */
  img?: string;
  /** Alt text for `img`. Defaults to '' (decorative) since the title carries the meaning. */
  imgAlt?: string;
  /** Palette for the generated wave artwork when `img` is not set.
   *  Defaults to the maroon family: `['var(--accent-soft)', 'var(--color-maroon-mid)', 'var(--accent)']`. */
  colors?: SupportWaveColors;
}

export interface SupportStripProps {
  /** DOM id for the <section>. Defaults to 'supportSection'. */
  id?: string;
  /** Small uppercase label above the headline, preceded by a 28x2 accent rule. Scroll-revealed. */
  eyebrow?: string;
  /** Section headline, rendered as an <h2> at clamp(26px, 3vw, 38px). Scroll-revealed with a 180ms delay. */
  heading?: string;
  /** The cards in the strip. Exactly one is expanded at a time. Defaults to six
   *  generic placeholder capabilities. Passing an empty array renders the section
   *  chrome with no cards. */
  items?: SupportItem[];
  /** Which card is expanded on first render. Clamped to the item range. Defaults to 0. */
  initialIndex?: number;
  /** Accessible label for the previous-card button. Defaults to 'Previous'. */
  prevLabel?: string;
  /** Accessible label for the next-card button. Defaults to 'Next'. */
  nextLabel?: string;
  /** Accessible label for the <nav> wrapping the arrows and the counter. Defaults to 'Feature cards'. */
  navLabel?: string;
  /** When true (default), Left/Right arrow keys anywhere on the page step through the
   *  cards, mirroring the source page. Key events originating in form fields are ignored.
   *  Set false when embedding more than one strip, or alongside other arrow-key UI. */
  arrowKeyNavigation?: boolean;
  /** Called with (item, index) whenever a different card is expanded — by click,
   *  by the nav arrows, or by the arrow keys. Re-selecting the open card is a no-op
   *  and does not fire. */
  onSelect?: (item: SupportItem, index: number) => void;
  /** Extra inline styles merged onto the <section> wrapper (e.g. to override the
   *  default `32px 0 96px` vertical padding). */
  style?: React.CSSProperties;
}

export declare function SupportStrip(props: SupportStripProps): JSX.Element;
