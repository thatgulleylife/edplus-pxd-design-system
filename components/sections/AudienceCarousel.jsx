/**
 * AudienceCarousel — the fanned persona-card carousel.
 *
 * Ported 1:1 from the live microsite's `section#depthub.aud-section`. The DOM
 * there is empty in the HTML; every card is built by an inline script, so the
 * real geometry lives in JS. That math is reproduced exactly here:
 *
 *   d          = shortest signed wrap distance from the active index
 *   pos        = d + (dragPx / spacing)
 *   ap         = |pos|
 *   rotate     = pos * 7deg
 *   translateX = pos * spacing            (spacing: 152 / 112 / 96 by viewport)
 *   translateY = ap*ap*9 + ap*5           (quadratic droop — the "fan" arc)
 *   scale      = max(0.74, 1 - ap*0.085)
 *   zIndex     = 100 - round(ap*10)
 *   opacity    = ap > 2.45 ? 0 : 1        (cards cull past ap 2.6)
 *   contentOp  = clamp(1 - ap*1.9)        (text fades ~2x faster than the card)
 *   isActive   = ap < 0.5
 *
 * Each card is `translate(-50%,-54%)` off the stage centre with a
 * `transform-origin: 50% 96%` — the pivot sits near the bottom edge, which is
 * what makes the 7deg-per-step rotation read as a hand of cards being fanned
 * rather than a row of tilted rectangles.
 *
 * Interaction parity: pointer drag with pointer capture (snap to the nearest
 * step, or a single step past a 26% threshold), click-to-focus on any
 * non-active card, prev/next arrows, arrow-key support on the stage, a zero
 * padded "NN / N" counter, and a dot rail that stretches the active dot.
 * During a drag every transition is killed so the stack tracks the finger 1:1.
 */
export function AudienceCarousel({
  eyebrow = 'Eyebrow label',
  title = 'Section headline goes here',
  intro = 'One or two supporting sentences that frame the section and set up what the cards below are showing.',
  audiences = DEFAULT_AUDIENCES,
  initialIndex = 0,
  showDots = true,
  showCounter = true,
  showArrows = true,
  enableImageDrop = false,
  dropHint = 'Drop to use',
  onChange,
  onImageDrop,
  sectionId = 'audiences',
  style,
}) {
  const items = audiences && audiences.length ? audiences : DEFAULT_AUDIENCES;
  const N = items.length;

  const [active, setActive] = React.useState(
    () => ((initialIndex % N) + N) % N
  );
  const [drag, setDrag] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [hoverId, setHoverId] = React.useState(null);
  const [vw, setVw] = React.useState(
    () => (typeof window !== 'undefined' ? window.innerWidth : 1280)
  );
  const [revealed, setRevealed] = React.useState(false);

  const sectionRef = React.useRef(null);
  const stageRef = React.useRef(null);
  const activeRef = React.useRef(active);
  activeRef.current = active;

  /* pointer bookkeeping — mirrors the source's module-scope vars */
  const startX = React.useRef(0);
  const downX = React.useRef(0);
  const downY = React.useRef(0);
  const moved = React.useRef(false);
  const pid = React.useRef(null);
  const draggingRef = React.useRef(false);
  const dragRef = React.useRef(0);

  /* ── viewport → spacing + card box (the source's calcSpacing + media queries) ── */
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const spacing = vw <= 400 ? 96 : vw <= 600 ? 112 : 152;
  const small = vw <= 600;
  const tiny = vw <= 400;
  const dims = {
    cardW: tiny ? 236 : small ? 262 : 300,
    cardH: tiny ? 332 : small ? 368 : 420,
    stageH: tiny ? 430 : small ? 474 : 540,
    stageMt: small ? 6 : 14,
    arrow: tiny ? 48 : 54,
    txtInset: small ? 18 : 22,
    nameSize: small ? 21 : 23,
    descSize: small ? 13.5 : 14.5,
    sectionPad: small ? '54px 16px 60px' : '84px 24px 96px',
    ctrlGap: small ? 16 : 22,
    ctrlMt: small ? 14 : 18,
    dotsMt: small ? 18 : 22,
  };

  /* ── scroll reveal (.sreveal → .in, rootMargin -15% like home.js) ── */
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      setRevealed(true);
      return undefined;
    }
    const node = sectionRef.current;
    if (!node) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setRevealed(true);
        });
      },
      { rootMargin: '0px 0px -15% 0px' }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  /* ── index helpers ── */
  const rel = React.useCallback(
    (i) => {
      let d = i - activeRef.current;
      d = ((d % N) + N) % N;
      if (d > N / 2) d -= N;
      return d;
    },
    [N]
  );

  const go = React.useCallback(
    (i) => {
      const next = ((i % N) + N) % N;
      activeRef.current = next;
      dragRef.current = 0;
      setActive(next);
      setDrag(0);
      if (onChange) onChange(next, items[next]);
    },
    [N, items, onChange]
  );

  /* ── pointer drag ── */
  const onPointerDown = (e) => {
    startX.current = e.clientX;
    downX.current = e.clientX;
    downY.current = e.clientY;
    moved.current = false;
    draggingRef.current = true;
    setDragging(true);
    pid.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      /* no-op */
    }
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    downX.current = e.clientX;
    downY.current = e.clientY;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 6) moved.current = true;
    dragRef.current = dx;
    setDrag(dx);
  };

  const endDrag = (e) => {
    if (!draggingRef.current) return;
    const dx = dragRef.current;
    draggingRef.current = false;
    dragRef.current = 0;
    setDragging(false);
    setDrag(0);
    try {
      if (pid.current != null && stageRef.current)
        stageRef.current.releasePointerCapture(pid.current);
    } catch (err) {
      /* no-op */
    }
    pid.current = null;

    if (!moved.current) {
      /* a tap, not a drag — focus whichever card sits under the pointer */
      const px = e && e.clientX != null ? e.clientX : downX.current;
      const py = e && e.clientY != null ? e.clientY : downY.current;
      const hit =
        typeof document !== 'undefined' ? document.elementFromPoint(px, py) : null;
      const card = hit && hit.closest ? hit.closest('[data-aud-index]') : null;
      const idx = card ? Number(card.getAttribute('data-aud-index')) : -1;
      if (idx >= 0 && Math.abs(rel(idx)) >= 0.5) go(idx);
      return;
    }

    let steps = Math.round(dx / spacing);
    if (steps === 0 && Math.abs(dx) > spacing * 0.26) steps = dx > 0 ? 1 : -1;
    if (steps !== 0) go(activeRef.current - steps);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') go(active - 1);
    else if (e.key === 'ArrowRight') go(active + 1);
  };

  const dragFrac = drag / spacing;
  const cardTransition = dragging
    ? 'none'
    : 'transform var(--dur-slow, .55s) var(--aud-ease-fan), opacity .4s';

  const revealStyle = (delay) => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'none' : 'translateY(34px)',
    transition: 'var(--transition-reveal, opacity 1s ease, transform 1.15s cubic-bezier(.16,1,.3,1))',
    transitionDelay: delay,
    willChange: 'opacity, transform',
  });

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      aria-labelledby={`${sectionId}-title`}
      style={{
        /* the fan easing is not in the shared motion tokens — scope it here */
        '--aud-ease-fan': 'cubic-bezier(.22,.68,.16,1)',
        position: 'relative',
        background: 'transparent',
        padding: dims.sectionPad,
        overflow: 'hidden',
        fontFamily: 'var(--font)',
        ...style,
      }}
    >
      <style>{`
        .edp-aud-arrow:hover { border-color:#c4c4ca; }
        .edp-aud-arrow:active { transform:scale(.93); }
        .edp-aud-arrow:focus-visible,
        .edp-aud-dot:focus-visible { outline:2px solid var(--accent); outline-offset:3px; }
        .edp-aud-stage:focus-visible { outline:2px solid var(--accent); outline-offset:6px; border-radius:var(--radius-card); }
      `}</style>

      {/* ── head ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '760px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontWeight: 'var(--fw-bold)',
            fontSize: '13px',
            letterSpacing: 'var(--ls-widest)',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '16px',
            ...revealStyle('0s'),
          }}
        >
          {eyebrow}
        </div>
        <h2
          id={`${sectionId}-title`}
          style={{
            fontWeight: 'var(--fw-extrabold)',
            fontSize: 'clamp(28px, 3.4vw, 46px)',
            lineHeight: 1.02,
            letterSpacing: 'var(--ls-tighter)',
            color: 'var(--ink)',
            margin: '0 0 18px',
            textWrap: 'balance',
            ...revealStyle('.08s'),
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontWeight: 'var(--fw-regular)',
            fontSize: '16.5px',
            lineHeight: 'var(--lh-relaxed)',
            color: 'var(--muted)',
            margin: '0 auto',
            maxWidth: '600px',
            textWrap: 'pretty',
            ...revealStyle('.16s'),
          }}
        >
          {intro}
        </p>
      </div>

      {/* ── stage: absolutely-positioned fanned cards ── */}
      <div
        ref={stageRef}
        className="edp-aud-stage"
        role="group"
        aria-roledescription="carousel"
        aria-label={title}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        style={{
          position: 'relative',
          zIndex: 2,
          height: `${dims.stageH}px`,
          maxWidth: '1180px',
          margin: `${dims.stageMt}px auto 0`,
          touchAction: 'pan-y',
          ...revealStyle('.24s'),
        }}
      >
        {items.map((a, i) => {
          const d = i - active;
          const wrapped = ((d % N) + N) % N;
          const signed = wrapped > N / 2 ? wrapped - N : wrapped;
          const pos = signed + dragFrac;
          const ap = Math.abs(pos);
          const visible = ap <= 2.6;
          const rot = pos * 7;
          const tx = pos * spacing;
          const ty = ap * ap * 9 + ap * 5;
          const scale = Math.max(0.74, 1 - ap * 0.085);
          const z = 100 - Math.round(ap * 10);
          const op = ap > 2.45 ? 0 : 1;
          const contentOp = Math.max(0, Math.min(1, 1 - ap * 1.9));
          const isActive = ap < 0.5;
          const isOver = enableImageDrop && hoverId === a.id;

          return (
            <div
              key={a.id != null ? a.id : i}
              data-aud-index={i}
              aria-hidden={visible ? undefined : true}
              onDragOver={
                enableImageDrop
                  ? (e) => {
                      e.preventDefault();
                      if (hoverId !== a.id) setHoverId(a.id);
                    }
                  : undefined
              }
              onDragLeave={
                enableImageDrop
                  ? () => {
                      if (hoverId === a.id) setHoverId(null);
                    }
                  : undefined
              }
              onDrop={
                enableImageDrop
                  ? (e) => {
                      e.preventDefault();
                      setHoverId(null);
                      const f =
                        e.dataTransfer &&
                        e.dataTransfer.files &&
                        e.dataTransfer.files[0];
                      if (f && onImageDrop) onImageDrop(a.id, f);
                    }
                  : undefined
              }
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: `${dims.cardW}px`,
                height: `${dims.cardH}px`,
                transformOrigin: '50% 96%',
                borderRadius: 'var(--radius-card)',
                overflow: 'hidden',
                background:
                  'linear-gradient(160deg, var(--color-maroon-deep), #3a0c1c)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                willChange: 'transform',
                transform: `translate(-50%, -54%) translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg) scale(${scale})`,
                transition: cardTransition,
                opacity: op,
                zIndex: z,
                pointerEvents: visible ? 'auto' : 'none',
                cursor: isActive ? 'grab' : 'pointer',
                boxShadow: isActive
                  ? '0 38px 70px -22px rgba(28,8,16,.6), 0 10px 26px -10px rgba(28,8,16,.45)'
                  : '0 24px 48px -20px rgba(28,8,16,.5), 0 6px 16px -8px rgba(28,8,16,.35)',
              }}
            >
              {/* image */}
              <div
                role="img"
                aria-label={a.alt || a.name}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: a.image ? `url("${a.image}")` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#3a0c1c',
                }}
              />

              {/* legibility scrim — deepens on the active card */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: isActive
                    ? 'linear-gradient(to top, rgba(20,6,12,.92) 4%, rgba(20,6,12,.55) 34%, rgba(60,12,28,.12) 62%, rgba(20,6,12,.18) 100%)'
                    : 'linear-gradient(to top, rgba(18,6,11,.7) 0%, rgba(18,6,11,.2) 38%, rgba(18,6,11,.18) 100%)',
                }}
              />

              {/* category pill — flips to gold when the card is active */}
              {a.label ? (
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    fontWeight: 'var(--fw-extrabold)',
                    fontSize: '10.5px',
                    letterSpacing: 'var(--ls-widest)',
                    textTransform: 'uppercase',
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-pill)',
                    boxShadow: '0 3px 10px rgba(20,8,14,.28)',
                    whiteSpace: 'nowrap',
                    background: isActive
                      ? 'var(--color-gold-asu)'
                      : 'rgba(255,255,255,.95)',
                    color: isActive ? '#2a1118' : '#3a1420',
                    transition: dragging
                      ? 'none'
                      : 'background var(--dur-normal, .35s)',
                  }}
                >
                  {a.label}
                </div>
              ) : null}

              {/* drag-and-drop target ring (authoring affordance) */}
              {isOver ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: '6px',
                    border: '3px dashed var(--color-gold-asu)',
                    borderRadius: '18px',
                    background: 'rgba(140,29,64,.28)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'var(--fw-extrabold)',
                    fontSize: '13px',
                    letterSpacing: '.05em',
                    textTransform: 'uppercase',
                    color: '#fff',
                    textShadow: '0 1px 6px rgba(0,0,0,.5)',
                  }}
                >
                  {dropHint}
                </div>
              ) : null}

              {/* copy — fades ~2x faster than the card itself */}
              <div
                style={{
                  position: 'absolute',
                  left: `${dims.txtInset}px`,
                  right: `${dims.txtInset}px`,
                  bottom: `${dims.txtInset}px`,
                  color: '#fff',
                  pointerEvents: 'none',
                  opacity: contentOp,
                  transition: dragging
                    ? 'none'
                    : 'opacity var(--dur-normal, .35s)',
                }}
              >
                <div
                  style={{
                    fontWeight: 'var(--fw-extrabold)',
                    fontSize: `${dims.nameSize}px`,
                    lineHeight: 1.08,
                    letterSpacing: '-.015em',
                    margin: '0 0 9px',
                  }}
                >
                  {a.name}
                </div>
                <div
                  style={{
                    fontWeight: 'var(--fw-medium)',
                    fontSize: `${dims.descSize}px`,
                    lineHeight: 1.48,
                    color: 'rgba(255,255,255,.9)',
                    margin: 0,
                    textWrap: 'pretty',
                  }}
                >
                  {a.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── controls ── */}
      {showArrows || showCounter ? (
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${dims.ctrlGap}px`,
            marginTop: `${dims.ctrlMt}px`,
          }}
        >
          {showArrows ? (
            <button
              type="button"
              className="edp-aud-arrow"
              title="Previous"
              aria-label="Previous"
              onClick={() => go(active - 1)}
              style={arrowStyle(dims.arrow)}
            >
              <span style={chevron('prev')} />
            </button>
          ) : null}

          {showCounter ? (
            <div
              aria-live="polite"
              style={{
                fontWeight: 'var(--fw-extrabold)',
                fontSize: '16px',
                letterSpacing: '.05em',
                color: '#2a1118',
                minWidth: '74px',
                textAlign: 'center',
              }}
            >
              <span style={{ color: 'var(--ink)' }}>
                {String(active + 1).padStart(2, '0')}
              </span>
              <span style={{ color: '#b8b8be' }}> / {N}</span>
            </div>
          ) : null}

          {showArrows ? (
            <button
              type="button"
              className="edp-aud-arrow"
              title="Next"
              aria-label="Next"
              onClick={() => go(active + 1)}
              style={arrowStyle(dims.arrow)}
            >
              <span style={chevron('next')} />
            </button>
          ) : null}
        </div>
      ) : null}

      {/* ── dot rail — the active dot stretches from 9px to 26px ── */}
      {showDots ? (
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            marginTop: `${dims.dotsMt}px`,
            flexWrap: 'wrap',
            maxWidth: '520px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {items.map((a, i) => (
            <button
              key={a.id != null ? a.id : i}
              type="button"
              className="edp-aud-dot"
              title={a.name}
              aria-label={a.name}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => go(i)}
              style={{
                height: '9px',
                width: i === active ? '26px' : '9px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: i === active ? 'var(--accent)' : '#d4d4d8',
                transition: 'all var(--dur-normal, .35s) var(--aud-ease-fan)',
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/* ── style helpers ─────────────────────────────────────────────────────── */

function arrowStyle(size) {
  return {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: 'var(--radius-circle)',
    border: '1.5px solid var(--line)',
    background: 'var(--bg)',
    color: 'var(--ink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition:
      'border-color var(--dur-fast, .2s), color var(--dur-fast, .2s), transform var(--dur-fast, .2s), box-shadow .25s',
    boxShadow: '0 6px 16px -10px rgba(20,20,30,.3)',
  };
}

/* the arrows are pure CSS chevrons: an 11px box with two borders, rotated 45deg */
function chevron(dir) {
  const base = {
    display: 'inline-block',
    width: '11px',
    height: '11px',
  };
  return dir === 'prev'
    ? {
        ...base,
        borderLeft: '2.6px solid currentColor',
        borderBottom: '2.6px solid currentColor',
        transform: 'translateX(2px) rotate(45deg)',
      }
    : {
        ...base,
        borderRight: '2.6px solid currentColor',
        borderTop: '2.6px solid currentColor',
        transform: 'translateX(-2px) rotate(45deg)',
      };
}

/* ── generic placeholder content ───────────────────────────────────────── */

const PLACEHOLDER_AVATARS = [
  '../../faces/placeholders/avatar-01.svg',
  '../../faces/placeholders/avatar-02.svg',
  '../../faces/placeholders/avatar-03.svg',
  '../../faces/placeholders/avatar-04.svg',
  '../../faces/placeholders/avatar-05.svg',
  '../../faces/placeholders/avatar-06.svg',
];

const PLACEHOLDER_LABELS = ['Group A', 'Group B', 'Group C'];

/* Twelve entries so the default preview matches the "NN / 12" counter and the
   full depth of the stack (cards cull at ap > 2.6, so ~6 read at once). */
const DEFAULT_AUDIENCES = Array.from({ length: 12 }, (_, i) => ({
  id: `audience-${i + 1}`,
  label: PLACEHOLDER_LABELS[i % PLACEHOLDER_LABELS.length],
  name: `Audience ${i + 1}`,
  description:
    'One sentence describing this audience and the outcome the work is designed to reach for them.',
  image: PLACEHOLDER_AVATARS[i % PLACEHOLDER_AVATARS.length],
  alt: 'Placeholder portrait illustration',
}));
