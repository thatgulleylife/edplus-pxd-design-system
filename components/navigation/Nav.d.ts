import { Nav } from './Nav';

/** Nav — sticky frosted-glass navigation bar with pulsing brand dot. */
export interface NavProps {
  /** Brand wordmark */
  brand?: string;
  /** Navigation links */
  links?: Array<{ label: string; href: string; active?: boolean; external?: boolean }>;
  /** Back link href (leader page style) */
  backHref?: string;
  /** Back link label */
  backLabel?: string;
}
