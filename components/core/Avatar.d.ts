import { Avatar } from './Avatar';

/** Avatar — circular headshot with gradient-initial fallback. */
export interface AvatarProps {
  /** Image URL */
  src?: string;
  /** Person's name — used for initials fallback */
  name?: string;
  /** Diameter in px */
  size?: number;
  /** Show ring decoration */
  ring?: boolean;
  /** Ring color */
  ringColor?: string;
}
