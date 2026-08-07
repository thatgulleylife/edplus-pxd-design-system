import { TeamBox } from './TeamBox';

/**
 * TeamBox — tappable card for each team in the org grid.
 * @startingPoint section="Cards" subtitle="Team card with leader, count, and hover reveal" viewport="700x280"
 */
export interface TeamBoxProps {
  /** Team name */
  team: string;
  /** Leader full name */
  leader: string;
  /** Leader title */
  role: string;
  /** Team headcount */
  count?: number;
  /** SVG icon HTML string */
  icon?: string;
  /** One-sentence team description */
  sentence?: string;
  /** Click handler (opens modal or navigates) */
  onClick?: () => void;
}
