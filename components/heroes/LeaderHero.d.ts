export interface LeaderHeroProps {
  /** ALL-CAPS kicker above the name. Rendered with a leading rule. */
  eyebrow?: string;
  /** Person or role name — the page's h1. */
  name?: string;
  /** Role/title line, rendered in the brand accent. */
  role?: string;
  /** Short supporting paragraph. Omit to hide. */
  bio?: string;
  /** Pill labels rendered under the bio (e.g. focus areas, disciplines). */
  chips?: string[];
  /**
   * Portrait image URL. Prefer a placeholder from `faces/placeholders/` —
   * never commit photos of real people to this system.
   */
  photo?: string;
  /** Value shown in the floating badge. Omit the badge by leaving this unset. */
  badgeValue?: string | number;
  /** Badge caption. Newlines are preserved (`white-space: pre-line`). */
  badgeLabel?: string;
}

export declare function LeaderHero(props: LeaderHeroProps): JSX.Element;
