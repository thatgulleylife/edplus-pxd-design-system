import { useEffect, useRef } from 'react';

/**
 * StatsHero — the "impact" flip-card hero from the leader microsite
 * (`leader.html > section#statsSection.statshero`, built by the inline
 * `impact stats hero` IIFE).
 *
 * Layout is a three-card staircase, not a grid:
 *
 *   .sh-wrap (flex, align-items:flex-start, gap 20)
 *   ├── .sh-left  (flex 0 0 44%, column, space-between, min-height 640)
 *   │    ├── copy block (eyebrow + h2 + sub)
 *   │    └── card 1 (.c1 — 250px tall, pushed down 44px)
 *   ├── card 2     (.c2 — 430px tall, align-self:flex-end, flex:1)
 *   └── .sh-right  (flex 1, column)
 *        ├── card 3 (.c3 — 600px tall)
 *        └── "See More" button
 *
 * Each card is a 3D flip: `.sh-inner` has `transform-style: preserve-3d` and
 * rotates 180° on hover (and on keyboard focus, added here for a11y). The front
 * face carries a cover background image scaled 1.05 and bled 12px past the
 * edges, a bottom-up black shade gradient, the big stat number and its label.
 * The back face is a maroon gradient with the number, an all-caps label and the
 * description; it is a size container so the back copy scales off card height
 * (`cqh`) on desktop.
 *
 * Two behaviours are reproduced in JS because CSS cannot express them:
 *  1. `fit()` — the front number starts at 72/96/110px (per card) and steps
 *     down 2px at a time until it fits the card's inner width.
 *  2. `revealCards()` — an IntersectionObserver adds `.in`, firing the shared
 *     `cardRise` keyframe with a 120ms-per-card stagger.
 *
 * Everything below hover/media/container-query level is inline; the rules that
 * inline styles cannot express live in the component-scoped <style> block.
 */

/** Front-face number sizes per card position, from the source `MAX` array. */
const NUM_MAX = [72, 96, 110];

const DEFAULT_ITEMS = [
  {
    stat: '00%',
    label: 'Metric label one',
    desc: 'One or two sentences explaining what this number measures and why it matters. Revealed when the card flips.',
    img: '../../images/placeholders/stock-01.svg',
  },
  {
    stat: '000',
    label: 'Metric label two',
    desc: 'One or two sentences explaining what this number measures and why it matters. Revealed when the card flips.',
    img: '../../images/placeholders/stock-02.svg',
  },
  {
    stat: '00%',
    label: 'Metric label three',
    desc: 'One or two sentences explaining what this number measures and why it matters. Revealed when the card flips.',
    img: '../../images/placeholders/stock-03.svg',
  },
];

const CSS = `
.ds-statshero .sh-wrap{ display:flex; align-items:flex-start; gap:var(--space-5); }
.ds-statshero .sh-left{ flex:0 0 44%; display:flex; flex-direction:column; justify-content:space-between; min-height:640px; }
.ds-statshero .sh-right{ flex:1; display:flex; flex-direction:column; }

/* staggered card heights — the staircase */
.ds-statshero .sh-card.c1{ height:250px; margin-top:44px; }
.ds-statshero .sh-card.c2{ flex:1; align-self:flex-end; height:430px; }
.ds-statshero .sh-card.c3{ height:600px; }

/* the flip */
.ds-statshero .sh-card:hover .sh-inner,
.ds-statshero .sh-card:focus-visible .sh-inner,
.ds-statshero .sh-card:focus-within .sh-inner{ transform:rotateY(180deg); }
.ds-statshero .sh-card:focus-visible{ outline:2px solid var(--accent); outline-offset:4px; }

.ds-statshero .sh-face{ position:absolute; inset:0; }
.ds-statshero .sh-back{ position:absolute; inset:0; justify-content:center; padding:clamp(20px,2.4vw,30px); gap:5px;
                        container-type:size; }
.ds-statshero .sh-label{ font-size:13px; }

/* back-face type scales off card height (cqh); floors keep the short c1 legible */
.ds-statshero .bnum{ font-size:clamp(34px,11cqh,54px); }
.ds-statshero .blabel{ font-size:clamp(12px,3.3cqh,14px); }
.ds-statshero .bdesc{ font-size:clamp(15px,4.2cqh,18px); line-height:1.5; }

/* scroll reveal */
.ds-statshero .sh-card{ opacity:0; transform:translateY(30px); }
.ds-statshero .sh-card.in{ opacity:1; transform:none; animation:cardRise 1.05s var(--ease-spring) backwards; }
.ds-statshero .sreveal{ opacity:0; transform:translateY(34px);
                        transition:opacity 1s ease, transform 1.15s var(--ease-spring); will-change:opacity, transform; }
.ds-statshero .sreveal.in{ opacity:1; transform:none; }

/* Desktop keeps the fixed-height staircase, so size the back description per
   card (c1 is shortest → smallest text) to stop long blurbs clipping. */
@media(min-width:1001px){
  .ds-statshero .sh-back{ gap:6px; }
  .ds-statshero .sh-card.c1 .bdesc{ font-size:12px; line-height:1.45; }
  .ds-statshero .sh-card.c2 .bdesc{ font-size:13.5px; line-height:1.5; }
  .ds-statshero .sh-card.c3 .bdesc{ font-size:15px; line-height:1.55; }
}

/* Below 1000px the staircase squeezes the cards too narrow. Stack them
   full-width; both faces share one grid cell so the card auto-sizes to the
   taller face instead of clipping. */
@media(max-width:1000px){
  .ds-statshero .sh-wrap{ flex-direction:column; align-items:stretch; gap:var(--space-4); }
  .ds-statshero .sh-left{ flex:none; width:100%; min-height:auto; justify-content:flex-start; gap:var(--space-4); }
  .ds-statshero .sh-right{ flex:none; width:100%; }
  .ds-statshero .sh-card{ width:100%; align-self:stretch; margin-top:0; }
  .ds-statshero .sh-card.c1,
  .ds-statshero .sh-card.c2,
  .ds-statshero .sh-card.c3{ height:auto; flex:none; }
  .ds-statshero .sh-inner{ display:grid; min-height:300px; }
  .ds-statshero .sh-face{ position:relative; inset:auto; grid-area:1/1; min-height:300px; }
  .ds-statshero .sh-back{ position:relative; inset:auto; grid-area:1/1; justify-content:center; align-items:center;
                          padding:clamp(28px,4.5vw,52px); gap:10px; container-type:normal; }
  .ds-statshero .sh-back > *{ width:100%; max-width:680px; }
  .ds-statshero .bnum{ font-size:clamp(30px,3.6vw,38px); }
  .ds-statshero .blabel{ font-size:12px; letter-spacing:.12em; }
  .ds-statshero .bdesc{ font-size:clamp(14px,1.5vw,16px); line-height:var(--lh-relaxed); }
  .ds-statshero .sh-label{ font-size:14px; }
}

@media(max-width:430px){
  .ds-statshero .sh-back{ padding:24px; }
  .ds-statshero .bnum{ font-size:32px; }
  .ds-statshero .bdesc{ font-size:14px; line-height:1.5; }
}

@media(prefers-reduced-motion:reduce){
  .ds-statshero .sh-card,
  .ds-statshero .sreveal{ opacity:1 !important; transform:none !important; animation:none !important; }
  .ds-statshero .sh-inner{ transition:none !important; }
}
`;

export function StatsHero({
  id = 'statsSection',
  eyebrow = 'Section eyebrow',
  title = 'Section headline goes here',
  subtitle = 'One or two supporting sentences that frame the numbers below and explain what they add up to.',
  items = DEFAULT_ITEMS,
  showMore = true,
  moreLabel = 'See More',
  onMore,
  animate = true,
}) {
  const rootRef = useRef(null);
  const cards = items.slice(0, 3);

  /* Front numbers start at their max size and step down until they fit the
     card's inner width — the source `fit()` routine, verbatim in behaviour. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const fit = () => {
      root.querySelectorAll('[data-sh-num]').forEach((el) => {
        const card = el.closest('[data-sh-card]');
        if (!card) return;
        const max = parseFloat(el.getAttribute('data-sh-num')) || 110;
        el.style.fontSize = `${max}px`;
        const face = el.closest('[data-sh-face]');
        const ps = face
          ? getComputedStyle(face)
          : { paddingLeft: '0', paddingRight: '0' };
        const avail =
          card.clientWidth -
          (parseFloat(ps.paddingLeft) + parseFloat(ps.paddingRight));
        let size = max;
        while (el.scrollWidth > avail && size > 24) {
          size -= 2;
          el.style.fontSize = `${size}px`;
        }
      });
    };

    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [cards.length]);

  /* Scroll reveal — trigger line pulled up 15% so the section animates once
     it is comfortably on screen, matching `revealCards()`. Enter-only: nothing
     re-hides, so scrolling back up never replays. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll('[data-sh-card], [data-sh-reveal]');
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    if (!animate || reduce || !('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('in'));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in');
        });
      },
      { threshold: 0, rootMargin: '0px 0px -15% 0px' },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [animate, cards.length]);

  const renderCard = (item, i) => {
    const pos = ['c1', 'c2', 'c3'][i];
    return (
      <div
        key={i}
        data-sh-card=""
        className={`sh-card ${pos}`}
        tabIndex={0}
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          perspective: '1200px',
          cursor: 'pointer',
          animationDelay: `${i * 120}ms`,
        }}
      >
        <div
          className="sh-inner"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform .75s cubic-bezier(.45,.05,.55,.95)',
          }}
        >
          {/* front face — image, shade, number, label */}
          <div
            data-sh-face=""
            className="sh-face"
            style={{
              backfaceVisibility: 'hidden',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: 'var(--space-8)',
              background:
                'linear-gradient(150deg, var(--accent) 0%, var(--accent-deep) 100%)',
            }}
          >
            {item.img && (
              <div
                className="sh-bg"
                role={item.imgAlt ? 'img' : undefined}
                aria-label={item.imgAlt || undefined}
                style={{
                  position: 'absolute',
                  inset: '-12px',
                  backgroundImage: `url('${encodeURI(item.img)}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: 'scale(1.05)',
                }}
              />
            )}
            <div
              className="sh-shade"
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.22) 55%, rgba(0,0,0,.04) 100%)',
              }}
            />
            <div className="sh-fg" style={{ position: 'relative' }}>
              <div
                data-sh-num={NUM_MAX[i]}
                className="sh-num"
                style={{
                  fontWeight: 'var(--fw-extrabold)',
                  lineHeight: 'var(--lh-none)',
                  color: '#fff',
                  letterSpacing: 'var(--ls-tightest)',
                  whiteSpace: 'nowrap',
                  fontSize: `${NUM_MAX[i]}px`,
                }}
              >
                {item.stat}
              </div>
              <div
                className="sh-label"
                style={{
                  color: 'rgba(255,255,255,.78)',
                  marginTop: 'var(--space-3)',
                  fontWeight: 'var(--fw-medium)',
                }}
              >
                {item.label}
              </div>
            </div>
          </div>

          {/* back face — flipped 180°, revealed on hover/focus */}
          <div
            className="sh-back"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background:
                'linear-gradient(148deg, var(--color-maroon-mid) 0%, var(--accent) 100%)',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              className="bnum"
              style={{
                fontWeight: 'var(--fw-extrabold)',
                lineHeight: 'var(--lh-none)',
                letterSpacing: 'var(--ls-tighter)',
              }}
            >
              {item.stat}
            </div>
            <div
              className="blabel"
              style={{
                fontWeight: 'var(--fw-semibold)',
                color: 'rgba(255,255,255,.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                lineHeight: 1.35,
              }}
            >
              {item.label}
            </div>
            {item.desc && (
              <div
                className="bdesc"
                style={{
                  color: 'rgba(255,255,255,.88)',
                  fontWeight: 300,
                  marginTop: 'var(--space-1)',
                }}
              >
                {item.desc}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id={id}
      ref={rootRef}
      className="ds-statshero statshero"
      aria-labelledby={`${id}-title`}
      style={{ padding: 'var(--space-8) 0 var(--space-24)' }}
    >
      <style>{CSS}</style>

      <div className="sh-wrap">
        <div className="sh-left">
          <div data-sh-reveal="" className="sreveal">
            <div
              className="sh-eyebrow"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: '14px',
              }}
            >
              <span
                style={{
                  width: '28px',
                  height: '2px',
                  background: 'var(--accent)',
                  borderRadius: '2px',
                  display: 'inline-block',
                }}
              />
              <em
                style={{
                  fontStyle: 'normal',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--fw-bold)',
                  letterSpacing: 'var(--ls-caps)',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                }}
              >
                {eyebrow}
              </em>
            </div>

            <h2
              id={`${id}-title`}
              className="sh-title"
              style={{
                fontSize: 'clamp(26px, 3vw, 38px)',
                fontWeight: 'var(--fw-extrabold)',
                lineHeight: 'var(--lh-tight)',
                letterSpacing: 'var(--ls-tighter)',
                margin: '0 0 var(--space-5)',
                color: 'var(--ink)',
                textWrap: 'balance',
              }}
            >
              {title}
            </h2>

            {subtitle && (
              <p
                className="sh-sub"
                style={{
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--lh-relaxed)',
                  color: 'var(--muted)',
                  margin: 0,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {cards[0] && renderCard(cards[0], 0)}
        </div>

        {cards[1] && renderCard(cards[1], 1)}

        <div className="sh-right">
          {cards[2] && renderCard(cards[2], 2)}

          {showMore && (
            <button
              type="button"
              className="sh-more"
              onClick={onMore}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: '18px 4px 0',
                color: 'var(--accent)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--fw-semibold)',
                fontFamily: 'inherit',
                background: 'none',
                border: 0,
                cursor: 'pointer',
              }}
            >
              {moreLabel} <span aria-hidden="true">↓</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
