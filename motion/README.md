# Motion

All keyframes live in `keyframes.css`, imported by the root `styles.css`.
Easing curves and durations are tokens (`tokens/motion.css`) — reference those
rather than hardcoding values, so timing stays consistent system-wide.

## Groups

| Group | Keyframes | Use |
|-------|-----------|-----|
| Entrance | `cardRise`, `fcFade`, `jrpop` | content arriving on scroll or mount |
| Attention | `pulse`, `pf-sparkPulse`, `pf-sparkGlow`, `sheen` | draw the eye — one per view, sparingly |
| Ambient | `pf-floatY`, `pf-twinkle`, `spin`, `pf-starSpin` | continuous background life |
| Fan | `pf-fanCenter`, `pf-fanLeft`, `pf-fanRight` | staged three-card hero choreography |

## Utilities

`.anim-rise` `.anim-fade` `.anim-pulse` `.anim-float` `.anim-twinkle` `.anim-spin`

`.stagger` on a parent reveals children in sequence at 70ms intervals.

## Easing

| Token | Curve | Feel |
|-------|-------|------|
| `--ease-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | snappy, spring-like — entrances |
| `--ease-bounce` | `cubic-bezier(0.34, 1.4, 0.5, 1)` | slight overshoot — card hover |
| `--ease-magnetic` | `cubic-bezier(0.2, 1.5, 0.4, 1)` | pronounced overshoot |
| `--ease-out` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | general purpose |

## Accessibility

`keyframes.css` ends with a `prefers-reduced-motion` block that collapses every
animation and transition to ~0ms. Content still appears — it just arrives without
travel. **Never remove that block**, and never add motion that bypasses it.
