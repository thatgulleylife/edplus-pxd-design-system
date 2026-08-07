import { Eyebrow } from './Eyebrow';

/** Eyebrow — all-caps label with optional decorative left rule. Used above section headings. */
export interface EyebrowProps {
  children: React.ReactNode;
  /** Show the decorative left line */
  withLine?: boolean;
}
