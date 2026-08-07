import { LeaderCard } from './LeaderCard';

/**
 * LeaderCard — photo card linking to a leader's profile page.
 * @startingPoint section="Cards" subtitle="Leader photo card with team, name, and hover lift" viewport="700x400"
 */
export interface LeaderCardProps {
  /** Leader full name */
  name: string;
  /** Team name */
  team: string;
  /** Job title */
  role: string;
  /** Headcount shown as badge */
  count?: number;
  /** Headshot URL */
  photo?: string;
  /** Link destination */
  href?: string;
}
