import { MemberCard } from './MemberCard';

/** MemberCard — team member row card with avatar, name, title, and optional manages count. */
export interface MemberCardProps {
  /** Full name */
  name: string;
  /** Job title */
  title: string;
  /** Avatar image URL */
  avatar?: string;
  /** Number of direct reports (shows manages pill if > 0) */
  manages?: number;
}
