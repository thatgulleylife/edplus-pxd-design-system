import { Pill } from './Pill';

/** Pill — inline badge/tag for metadata, counts, and labels. */
export interface PillProps {
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'accent' | 'maroon' | 'gold' | 'dark' | 'team';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
}
