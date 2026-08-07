export interface HomeHeroCard {
  /** Image URL for the card face. Omit to render a flat token-colored panel. */
  img?: string;
  /** Background applied when no image is supplied. Defaults to `var(--bg-soft)`. */
  bg?: string;
}

export interface HomeHeroProps {
  /** ALL-CAPS kicker above the headline. Rendered with a leading rule. */
  eyebrow?: string;
  /**
   * Headline lines, one per rendered line. The LAST entry is treated as the
   * accent anchor and takes the brand accent color.
   */
  lines?: string[];
  /** Supporting paragraph under the headline. Omit to hide. */
  lead?: string;
  /** Label for the primary call to action. */
  ctaLabel?: string;
  /** Href for the primary call to action. */
  ctaHref?: string;
  /**
   * Up to three cards for the fanning stage. Rendered left, center, right —
   * animated with pf-fanLeft / pf-fanCenter / pf-fanRight respectively.
   */
  cards?: HomeHeroCard[];
}

export declare function HomeHero(props: HomeHeroProps): JSX.Element;
