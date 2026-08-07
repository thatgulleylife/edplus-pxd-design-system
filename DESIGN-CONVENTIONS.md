# Design Conventions — shared across all pages

> Extracted from the P&XD microsite codebase and de-identified. These are the
> layout, type, and motion rules every page follows. Token values referenced
> here are defined in `tokens/`; animations are in `motion/keyframes.css`.

These rules keep every page in the Team Pages microsite visually consistent
(`index.html`, `leader.html`, `profile.html`, and any new page). **`index.html`
is the source of truth** — when in doubt, match the homepage's computed values.

Applies to: **all pages.** When you add a new page or section, follow these.

---

## 1. Layout grid

Every page uses the same centered content column and the same nav width.

| Token | Value |
|-------|-------|
| Content column max-width | **1280px** |
| Side padding (desktop) | **56px** |
| Side padding (mobile ≤680px) | **24px** |
| Alignment | centered (`margin:0 auto`) |

```css
.wrap   { max-width:1280px; margin:0 auto; padding:0 56px; }
.nav-in { max-width:1280px; margin:0 auto; padding:16px 56px; }
@media(max-width:680px){ .wrap{ padding:0 24px; } .nav-in{ padding:14px 24px; } }
```

- The **nav** (brand text on the left, "Back to home" on the right) uses the same
  1280px width and 56px padding as the content, so it starts at the same left
  point on every page.
- **Every section lines up on the same left edge** as it flows down the page.
  Sections may run **off the right** of the screen (carousels, horizontal
  strips), but they must all **start at the same left edge**.

### Full-bleed sections (run off the right, aligned on the left)

For sections that break out of the column and run off the right edge (e.g. the
profile card carousel and the team-history year strip), drive their **left inset
off a shared `--gutter` variable** so they line up with the content column:

```css
:root{ --gutter: max(56px, calc(50vw - 584px)); }   /* content-left inset for a 1280 col */
@media(max-width:680px){ :root{ --gutter:24px; } }

.fullbleed        { width:100vw; margin-left:calc(50% - 50vw); }  /* break out */
.fullbleed-track  { padding-left:var(--gutter); }                 /* align first item to the column */
```

`--gutter` = the distance from the viewport's left edge to the content column.
`584 = 1280/2 − 56`. Use `var(--gutter)` for the left padding of any full-bleed
element (and `scroll-padding-left:var(--gutter)` on scroll-snap carousels so the
first card rests aligned instead of snapping to the viewport edge).

---

## 2. Type scale (headers, sub-headers, subtext)

All pages share one type scale, taken from the homepage. Weight is **800** for
titles; the brand font is Plus Jakarta Sans (via `--font`).

| Role | Size | Weight | Letter-spacing | Line-height |
|------|------|--------|----------------|-------------|
| **Hero H1** | `clamp(46px, 6.6vw, 96px)` | 800 | −0.045em | .94 |
| **Section title (H2)** | `clamp(28px, 3.4vw, 46px)` | 800 | −0.035em | 1.02 |
| **Eyebrow / kicker** | 14px | 700 | .16em, uppercase, accent color | — |
| **Hero lead (intro subtext)** | 19px | 400 | — | 1.6 |
| **Section sub (subtext)** | 16.5px | 400 | — | 1.6 |

Notes:
- **One size for all section titles on a page** — don't let different sections
  drift to different header sizes. On the profile page the chapter titles (`.ch-h`,
  `.jr-h`, `.pf-h`) and the team-history header all use the section-title values
  above.
- **Card titles** are a separate, smaller scale (e.g. `clamp(24px,2.4vw,30px)`)
  and are intentionally not section titles.
- Monospace "Chapter 01/02/03" markers on the profile page are a deliberate narrative
  accent, not part of the eyebrow scale.

---

## 3. Brand tokens (reference)

- Maroon `#8c1d40` (legacy) / `--accent:#b01e54` (current homepage value); gold `--gold`.
- Neutrals: `--ink`, `--ink-2`, `--muted`, `--line`.

---

## Change log

- **2026-07** — Standardized the type scale across pages to match the homepage
  (hero H1, section titles, eyebrows, leads, subtext). Applied to `profile.html`.
- **2026-07** — Aligned `profile.html` to the shared **1280px** grid (was 1080px):
  nav and all sections now start at the same left edge as the homepage; full-bleed
  sections (card carousel, team-history strip) driven off `--gutter` so they align
  on the left while running off the right.
