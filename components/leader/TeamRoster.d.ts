/** One person in the roster grid — renders a single `.tcard`. */
export interface TeamRosterMember {
  /**
   * Display name — 17px bold, first line of the card. Also seeds the fallback
   * avatar (two-letter initials on a deterministic muted tint) when `avatar`
   * is absent or fails to load, and is used as the photo's alt text.
   */
  name?: string;
  /** Role/job title — 13.5px muted line beneath the name. */
  title?: string;
  /**
   * Headshot URL for the 56px circular avatar (object-fit: cover). Omit to get
   * the tinted-initials avatar instead. Prefer the design-system placeholders at
   * `../../faces/placeholders/avatar-01.svg` … `avatar-06.svg`.
   */
  avatar?: string;
  /**
   * Size of this person's own team. When greater than 0 an accent pill appears
   * under the role — people icon + "Manages <b>N</b>". Omit or pass 0 to hide it.
   */
  manages?: number;
}

export interface TeamRosterProps {
  /**
   * ALL-CAPS kicker above the headline, preceded by a 28×2 accent rule.
   * Pass an empty string to hide it.
   */
  eyebrow?: string;
  /**
   * Section headline — the `<h2>`, clamp(26px, 3vw, 38px), extrabold,
   * baseline-aligned with the count meta on the same row.
   */
  title?: string;
  /**
   * The roster itself. Cards fill a 3-column grid (2 columns ≤880px, 1 ≤560px)
   * with a 14px gap and reveal in order, staggered 90ms each.
   */
  members?: TeamRosterMember[];
  /**
   * The first ticking numeral — number of direct reports. Defaults to
   * `members.length`. Counts up from 0 when the section scrolls into view.
   */
  directCount?: number;
  /**
   * The second ticking numeral — total headcount in the wider org. Defaults to
   * `members.length` plus the sum of every member's `manages`.
   */
  orgCount?: number;
  /** Text after the first numeral. Default: `'direct reports'`. */
  directLabel?: string;
  /** Text after the second numeral. Default: `'in the org'`. */
  orgLabel?: string;
  /** Word before the number inside a card's "Manages N" pill. Default: `'Manages'`. */
  managesLabel?: string;
  /**
   * Show the "N direct reports · N in the org" meta line beside the headline.
   * Set false when the counts aren't meaningful for the section. Default: true.
   */
  showMeta?: boolean;
  /**
   * Run the scroll-triggered entrance (heads rise 34px, cards rise 26px on a
   * 90ms stagger, numerals tick up over 1100ms). When false — or when the
   * viewer prefers reduced motion — everything renders settled immediately.
   * Default: true.
   */
  animate?: boolean;
  /**
   * `id` applied to the `<h2>` and referenced by the section's `aria-labelledby`.
   * Auto-generated via `React.useId` when omitted; supply one to link the
   * heading from elsewhere or to keep ids stable in snapshot tests.
   */
  headingId?: string;
}

export declare function TeamRoster(props: TeamRosterProps): JSX.Element;
