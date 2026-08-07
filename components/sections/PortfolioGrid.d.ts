import type { CSSProperties, JSX } from 'react';

/** One slide in the cover-flow stage. */
export interface PortfolioGridItem {
  /**
   * Image source for the slide. The stage crops with `object-fit: cover`
   * anchored to the top-left corner, matching the source site — so wide
   * screenshots keep their top-left content. Ideal source ratio is 1.65:1.
   */
  src: string;
  /**
   * Alt text for the slide image. Pass a meaningful description; use an empty
   * string only when the image is purely decorative.
   */
  alt?: string;
  /** Optional stable React key. Falls back to `src` + index when omitted. */
  key?: string;
}

export interface PortfolioGridProps {
  /**
   * DOM id for the `<section>`. Also seeds the heading id (`{id}-title`) and
   * the stage id (`{id}-stage`) used by the control buttons' `aria-controls`.
   * @default 'portfolio'
   */
  id?: string;
  /**
   * Small uppercase accent-colored label above the headline.
   * @default 'Section eyebrow'
   */
  eyebrow?: string;
  /**
   * Section headline, rendered as the `<h2>` that labels the section.
   * Clamped to 18ch and balanced, so keep it to roughly one short sentence.
   * @default 'Section headline goes here'
   */
  title?: string;
  /**
   * Slides in the carousel, in ring order. The ring wraps, so any count >= 1
   * works; 5-7 reads best because neighbours on both sides stay visible.
   * @default six generic placeholder images
   */
  items?: PortfolioGridItem[];
  /**
   * Start the carousel auto-advancing on mount. Any manual interaction
   * (prev / next / drag / tap-to-center) stops it, exactly as on the source site.
   * @default false
   */
  autoPlay?: boolean;
  /**
   * Milliseconds between automatic advances while playing.
   * @default 3800
   */
  autoPlayInterval?: number;
  /**
   * Index of the slide centered on first render. Wrapped into range.
   * @default 0
   */
  initialIndex?: number;
  /**
   * Accessible label for the previous-slide button.
   * @default 'Previous'
   */
  prevLabel?: string;
  /**
   * Accessible label for the next-slide button.
   * @default 'Next'
   */
  nextLabel?: string;
  /**
   * Accessible label for the play/pause button while paused.
   * @default 'Play'
   */
  playLabel?: string;
  /**
   * Accessible label for the play/pause button while playing.
   * @default 'Pause'
   */
  pauseLabel?: string;
  /**
   * Accessible label for the carousel stage region.
   * @default 'Portfolio gallery'
   */
  stageLabel?: string;
  /**
   * Called with the new active index whenever the centered slide changes —
   * via the buttons, a drag, a tap, or autoplay. Useful for driving a caption
   * or headline that tracks the current work.
   */
  onSlideChange?: (index: number) => void;
  /**
   * Extra inline styles merged onto the root `<section>` (after the section's
   * own layout styles, so these win).
   */
  style?: CSSProperties;
}

export declare function PortfolioGrid(props: PortfolioGridProps): JSX.Element;

export default PortfolioGrid;
