/** One flip card in the StatsHero staircase. */
export interface StatsHeroItem {
  /** Big number on the card front and repeated on the back (e.g. "00%", "000", "1.5x"). */
  stat: string;
  /** Short caption under the number; also the all-caps label on the back face. */
  label: string;
  /** Sentence or two revealed when the card flips. Omit to render number + label only. */
  desc?: string;
  /**
   * Cover background image for the card front. Prefer a neutral placeholder
   * from `images/placeholders/` — never commit photos of real people or
   * identifiable org imagery to this system.
   */
  img?: string;
  /**
   * Accessible name for the background image. Leave unset for decorative
   * imagery (the default) so screen readers skip it.
   */
  imgAlt?: string;
}

export interface StatsHeroProps {
  /**
   * DOM id for the `<section>`. Also seeds the heading id used by
   * `aria-labelledby`, so give each instance on a page a unique value.
   * @default "statsSection"
   */
  id?: string;
  /** ALL-CAPS kicker above the headline, rendered with a short accent rule. */
  eyebrow?: string;
  /** Section headline — the `<h2>` that names the section for assistive tech. */
  title?: string;
  /** Supporting paragraph under the headline. Omit to hide. */
  subtitle?: string;
  /**
   * The three metric cards, in staircase order: index 0 is the short card
   * beside the copy (250px), index 1 the middle card (430px, bottom-aligned),
   * index 2 the tall card (600px). Extra items past the third are ignored.
   */
  items?: StatsHeroItem[];
  /**
   * Show the "See More" button under the tall card.
   * @default true
   */
  showMore?: boolean;
  /**
   * Label for that button.
   * @default "See More"
   */
  moreLabel?: string;
  /** Click handler for the "See More" button — typically scrolls to the next section. */
  onMore?: () => void;
  /**
   * Run the staggered `cardRise` entrance on scroll (120ms per card). Set false
   * to render fully revealed — useful for previews, print and snapshot tests.
   * `prefers-reduced-motion: reduce` forces this off regardless.
   * @default true
   */
  animate?: boolean;
}

export declare function StatsHero(props: StatsHeroProps): JSX.Element;
