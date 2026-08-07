/** Icon keys available on a focus card. Purely decorative line icons. */
export type FocusIconKey =
  | 'product'
  | 'media'
  | 'creative'
  | 'system'
  | 'data'
  | 'ai'
  | 'cloud'
  | 'shield'
  | '_default';

/** A single focus-area card. */
export interface FocusItem {
  /** Which built-in line icon to render in the card's icon well. Unknown/omitted keys fall back to the default clock glyph. */
  icon?: FocusIconKey | string;
  /** Card title, e.g. 'Focus area one'. Rendered at 21px/700. */
  title: string;
  /** One-line supporting description under the title. */
  desc?: string;
  /** Longer body copy for this area. Not rendered by the grid — pass it through `onSelect` to a detail modal. */
  detail?: string;
}

/**
 * FocusGrid — leader page "areas of focus" section: eyebrow + h2 + sub + a
 * responsive grid of scroll-revealed focus cards that lift, tilt and reveal a
 * "learn more" affordance on hover.
 * @startingPoint section="Leader" subtitle="Focus-area card grid with staggered scroll reveal" viewport="1200x760"
 */
export interface FocusGridProps {
  /** DOM id for the <section>. Defaults to 'focusSection'. */
  id?: string;
  /** Small uppercase label above the headline, preceded by a 28x2 accent rule. */
  eyebrow?: string;
  /** Section headline, rendered as an <h2> at clamp(26px, 3vw, 38px). */
  heading?: string;
  /** Muted supporting sentence under the headline. Pass '' to render the spacing without copy. */
  sub?: string;
  /** The focus-area cards. An empty array renders the dashed "coming soon" placeholder instead. */
  items?: FocusItem[];
  /** Desktop column count for the grid. Collapses to 2 under 880px and 1 under 520px regardless. Defaults to 3. */
  columns?: number;
  /** Affordance text revealed at the bottom of a card on hover/keyboard focus. Defaults to 'Learn more →'. */
  moreLabel?: string;
  /** Headline of the empty-state placeholder shown when `items` is empty. */
  emptyTitle?: string;
  /** Body copy of the empty-state placeholder shown when `items` is empty. */
  emptyBody?: string;
  /** Called with (item, index) when a card is activated. Wire this to a detail modal; the cards are real <button>s. */
  onSelect?: (item: FocusItem, index: number) => void;
  /** Extra inline styles merged onto the <section> wrapper (e.g. to override vertical padding). */
  style?: Record<string, string | number>;
}

export declare function FocusGrid(props: FocusGridProps): JSX.Element;
