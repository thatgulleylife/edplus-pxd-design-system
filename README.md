# EdPlus P&XD Design System

**Arizona State University — EdPlus · Product & Experience Design.**
Tokens, components, motion, and layout conventions for building on-brand ASU Online
and EdPlus interfaces.

## Arizona State University

ASU is a comprehensive public research university in Tempe, Arizona — one of the
largest and most innovative in the United States, built on the premise that
excellence and access are not in tension.

> *ASU is a comprehensive public research university, measured not by whom it
> excludes, but by whom it includes and how they succeed; advancing research and
> discovery of public value; and assuming fundamental responsibility for the
> economic, social, cultural and overall health of the communities it serves.*
> — the ASU Charter

The charter is the design brief. Inclusion, public value, and responsibility to
community set the bar for every interface built with this system.

### ASU Online

**ASU Online** delivers the full ASU degree experience to learners who can't be on
campus — same faculty, same curriculum, same diploma. Its students are working,
raising families, serving in the military, returning to finish what they started,
or studying from another country. Many are the first in their family to attend
university.

**What that means for design:** the interface *is* the campus. There's no advisor
down the hall to compensate for a confusing page. Every screen has to work on a
phone, on a slow connection, late at night, for someone with limited time and high
stakes. Clarity isn't a preference here — it's the product.

> **This system is de-identified.** Every name, headshot, headcount, and piece of
> narrative copy in previews and templates is a generic placeholder. Swap in real
> content at use time — never commit real people's names or photos to this repo.

---

## What's here

```
tokens/          CSS custom properties — colors, type, spacing, radius, shadow, motion
base/            minimal reset
motion/          keyframes + utility classes extracted from the live microsite
components/      React components (.jsx) with typed prop APIs (.d.ts) and preview cards
guidelines/      spec cards — the visual reference for each foundation
faces/           neutral silhouette placeholder avatars (no real people)
styles.css       single entry point — @imports everything above
```

## Quick start

Import one file and every token, reset rule, and animation is available:

```html
<link rel="stylesheet" href="styles.css">
```

```css
.cta {
  background: var(--color-maroon);
  border-radius: var(--radius-pill);
  transition: var(--transition-fast);
}
.card { animation: cardRise var(--dur-enter) var(--ease-spring) both; }
```

React components are plain function components with inline styles — no CSS-in-JS
library, no dependencies beyond React itself.

## Brand essentials

**The ASU logo leads the header.** It is the primary identifier and is never
replaced by a unit wordmark. A sub-unit name may follow it, separated by a hairline
rule, at a smaller weight. See `guidelines/brand/identity.card.html`.

**Color.** Maroon `#b01e54` is the primary accent; gold `#e9b53a` / `#ffc627`
supports it. The secondary palette uses the official ASU colors:

| Token | Value | Use |
|-------|-------|-----|
| `--color-green` | `#78BE20` | ASU Green (PANTONE 368 C) — **fills only** |
| `--color-green-ink` | `#47700F` | accessible green text |
| `--color-blue` | `#00A3E0` | ASU Blue (PANTONE 299 C) — **fills only** |
| `--color-blue-ink` | `#00648A` | accessible blue text |

⚠️ ASU Green and ASU Blue are bright fills. Neither passes WCAG AA as text on
white (2.29:1 and 2.87:1). Use them as backgrounds with **dark ink on top**
(7.60:1 and 6.05:1), and reach for the `-ink` variants whenever the color must
carry text.

**Type.** Plus Jakarta Sans (300–800), JetBrains Mono for technical labels.
Headlines are weight 800 with negative tracking; eyebrows are ALL CAPS at
`0.14–0.16em`.

**Motion.** All animations live in `motion/keyframes.css` and honor
`prefers-reduced-motion` — that block must never be removed. Easing and duration
come from `tokens/motion.css`; don't hardcode timing values.

## Conventions

`DESIGN-CONVENTIONS.md` holds the layout grid (1280px column, 56px gutter,
full-bleed `--gutter` pattern) and the shared type scale. Read it before adding
a page or section.

---

*Extracted from the P&XD team portfolio microsite and de-identified for reuse.*
