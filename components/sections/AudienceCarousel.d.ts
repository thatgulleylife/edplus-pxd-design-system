import { AudienceCarousel } from './AudienceCarousel';

/** One persona card in the fanned stack. */
export interface AudienceItem {
  /** Stable identifier — used as the React key and passed to `onImageDrop`. */
  id: string;
  /** Short uppercase category shown in the top-right pill (turns gold on the active card). Omit to hide the pill. */
  label?: string;
  /** Card headline — the persona name. */
  name: string;
  /** One-sentence body copy under the name. Fades out ~2x faster than the card as it leaves centre. */
  description: string;
  /** Background image URL, rendered `cover`/`center`. Prefer `../../faces/placeholders/avatar-0N.svg` for placeholders. */
  image?: string;
  /** Accessible label for the card image. Falls back to `name`. */
  alt?: string;
}

/**
 * AudienceCarousel — fanned persona-card carousel with drag, arrows, an
 * "NN / N" counter, and a stretching dot rail.
 *
 * Cards are stacked absolutely at the stage centre with a `50% 96%`
 * transform-origin, then fanned outward: 7deg of rotation and one `spacing`
 * step of X-translation per index away from active, plus a quadratic
 * `ap*ap*9 + ap*5` Y droop, a `1 - ap*0.085` scale falloff (floored at 0.74),
 * and a `100 - round(ap*10)` z-index. Spacing responds to viewport
 * (152 / 112 / 96px) as does the card box (300x420 / 262x368 / 236x332).
 * Settle motion is `transform .55s cubic-bezier(.22,.68,.16,1)`; all
 * transitions are suppressed mid-drag so the stack tracks the pointer 1:1.
 *
 * @startingPoint section="Sections" subtitle="Fanned persona-card carousel with drag, arrows, and dot rail" viewport="1280x900"
 */
export interface AudienceCarouselProps {
  /** Small uppercase kicker above the headline, in accent color. */
  eyebrow?: string;
  /** Section headline (renders as the `h2` and labels the section). */
  title?: string;
  /** Supporting paragraph under the headline, max 600px wide and centered. */
  intro?: string;
  /** The persona cards, in stack order. Defaults to 12 generic placeholders. */
  audiences?: AudienceItem[];
  /** Index focused on first render. Wrapped into range. Default `0`. */
  initialIndex?: number;
  /** Show the dot rail below the controls. Default `true`. */
  showDots?: boolean;
  /** Show the zero-padded "NN / N" counter between the arrows. Default `true`. */
  showCounter?: boolean;
  /** Show the circular prev/next chevron buttons. Default `true`. */
  showArrows?: boolean;
  /** Enable the drag-and-drop image target (dashed gold ring on hover). Authoring affordance — default `false`. */
  enableImageDrop?: boolean;
  /** Text shown inside the drop ring while a file is dragged over a card. Default `'Drop to use'`. */
  dropHint?: string;
  /** Fired whenever the focused card changes, with the new index and item. */
  onChange?: (index: number, item: AudienceItem) => void;
  /** Fired when a file is dropped on a card (only when `enableImageDrop`). Receives the card id and the `File`. */
  onImageDrop?: (id: string, file: File) => void;
  /** DOM id for the `section` element; also seeds the heading id used by `aria-labelledby`. Default `'audiences'`. */
  sectionId?: string;
  /** Extra inline styles merged onto the root `section`. */
  style?: React.CSSProperties;
}

export declare function AudienceCarousel(props: AudienceCarouselProps): JSX.Element;
