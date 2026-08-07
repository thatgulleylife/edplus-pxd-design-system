import { Button } from './Button';

/**
 * Button — interactive call-to-action element.
 * @startingPoint section="Core" subtitle="Primary, maroon, ghost, and soft variants" viewport="700x120"
 */
export interface ButtonProps {
  /** Button label */
  children: React.ReactNode;
  /** Visual style variant */
  variant?: 'primary' | 'maroon' | 'ghost' | 'soft';
  /** Renders as <a> when provided */
  href?: string;
  /** Click handler */
  onClick?: () => void;
  /** Disables interaction */
  disabled?: boolean;
  /** Trailing icon element */
  icon?: React.ReactNode;
}
