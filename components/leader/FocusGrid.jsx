/* FocusGrid — leader page "areas of focus" section.
   Ported from section#focusSection.focus + the JS that builds #fgrid.

   Structure (faithful to source):
     section.focus
       .seyebrow  (accent bar + uppercase label, scroll-revealed)
       h2         (scroll-revealed, 80ms delay)
       p.sub      (scroll-revealed, 180ms delay)
       .fgrid     3 → 2 → 1 columns
         button.fcard  ×N  (staggered cardRise entrance, 130ms apart)
           .blob  .fhead(.ficon + .idx)  .ft  .fd  .fmore
         .fcoming        (dashed "coming soon" placeholder when items is empty)

   Motion: header/`sub` use the shared reveal transition; cards use the shared
   `cardRise` keyframe from motion/keyframes.css. Both replay when the section
   scrolls fully below the viewport, matching the source's revealCards().        */

const FG_CLASS = 'edp-fgrid';

/* Geometric line icons keyed by `item.icon`. Purely decorative, no branding. */
const FOCUS_ICONS = {
  product: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2.5" /><path d="M3 9h18" /><path d="M9 21V9" />
    </svg>
  ),
  media: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M10 9.2l5 2.8-5 2.8z" fill="currentColor" stroke="none" />
    </svg>
  ),
  creative: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.9 4.9L19 9.8l-5.1 1.9L12 16.6l-1.9-4.9L5 9.8l5.1-1.9z" />
      <path d="M18.5 14.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z" />
    </svg>
  ),
  system: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.7" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.7" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.7" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.7" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4v16h16" />
      <rect x="8" y="11" width="2.6" height="6" rx="0.6" fill="currentColor" stroke="none" />
      <rect x="13" y="7" width="2.6" height="10" rx="0.6" fill="currentColor" stroke="none" />
      <rect x="17.6" y="13.5" width="2.6" height="3.5" rx="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="12" height="12" rx="2.2" />
      <path d="M9 1.8v3M15 1.8v3M9 19.2v3M15 19.2v3M1.8 9h3M1.8 15h3M19.2 9h3M19.2 15h3" />
      <circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none" />
    </svg>
  ),
  cloud: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 9.2 3.8 3.8 0 0 0 7 18z" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6z" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  _default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  ),
};

const DEFAULT_ITEMS = [
  { icon: 'system',   title: 'Focus area one',   desc: 'Short supporting line about this area.', detail: 'A longer paragraph describing this focus area goes here. It appears when the card is selected.' },
  { icon: 'product',  title: 'Focus area two',   desc: 'Short supporting line about this area.', detail: 'A longer paragraph describing this focus area goes here. It appears when the card is selected.' },
  { icon: 'data',     title: 'Focus area three', desc: 'Short supporting line about this area.', detail: 'A longer paragraph describing this focus area goes here. It appears when the card is selected.' },
  { icon: 'creative', title: 'Focus area four',  desc: 'Short supporting line about this area.', detail: 'A longer paragraph describing this focus area goes here. It appears when the card is selected.' },
  { icon: 'media',    title: 'Focus area five',  desc: 'Short supporting line about this area.', detail: 'A longer paragraph describing this focus area goes here. It appears when the card is selected.' },
  { icon: 'shield',   title: 'Focus area six',   desc: 'Short supporting line about this area.', detail: 'A longer paragraph describing this focus area goes here. It appears when the card is selected.' },
];

/* Scroll reveal, ported from revealCards():
   - enter observer pulls the trigger line up 15% from the viewport bottom
   - reset observer uses the true viewport bottom, so an element only resets
     (to replay) once it has fully dropped below the fold                        */
function useScrollReveal(count) {
  const [shown, setShown] = React.useState({});
  const [reduce, setReduce] = React.useState(false);
  const nodes = React.useRef({});

  const register = React.useCallback((key) => (el) => {
    if (el) nodes.current[key] = el;
    else delete nodes.current[key];
  }, []);

  React.useEffect(() => {
    const mq = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    const isReduced = !!(mq && mq.matches);
    setReduce(isReduced);

    const showAll = () => {
      const all = {};
      Object.keys(nodes.current).forEach((k) => { all[k] = true; });
      setShown(all);
    };

    if (isReduced || typeof IntersectionObserver === 'undefined') { showAll(); return undefined; }

    const mark = (key, on) => setShown((s) => (s[key] === on ? s : { ...s, [key]: on }));

    const ioIn = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) mark(e.target.dataset.revealKey, true); });
    }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });

    const ioReset = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) return;
        const rb = e.rootBounds || { bottom: window.innerHeight };
        if (e.boundingClientRect.top >= rb.bottom - 1) mark(e.target.dataset.revealKey, false);
      });
    }, { threshold: 0 });

    Object.values(nodes.current).forEach((el) => { ioIn.observe(el); ioReset.observe(el); });
    return () => { ioIn.disconnect(); ioReset.disconnect(); };
  }, [count]);

  return { shown, reduce, register };
}

function FocusCard({ item, index, moreLabel, reduce, revealed, registerRef, onSelect }) {
  const [hovered, setHovered] = React.useState(false);
  const [keyFocus, setKeyFocus] = React.useState(false);
  const lit = hovered || keyFocus;

  return (
    <button
      type="button"
      ref={registerRef}
      data-reveal-key={`card-${index}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(e) => {
        let via = true;
        try { via = e.target.matches(':focus-visible'); } catch (err) { via = true; }
        setKeyFocus(via);
      }}
      onBlur={() => setKeyFocus(false)}
      onClick={() => onSelect && onSelect(item, index)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
        border: '1px solid var(--line)',
        borderColor: lit ? '#e2e2e6' /* no token: hover-darkened hairline */ : 'var(--line)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 22px',
        minHeight: '206px',
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        font: 'inherit',
        fontFamily: 'var(--font)',
        color: 'inherit',
        width: '100%',
        outline: keyFocus ? '2px solid var(--accent)' : 'none',
        outlineOffset: '2px',
        transform: lit ? 'translateY(-10px) rotate(-2.5deg)' : (revealed || reduce ? 'none' : 'translateY(30px)'),
        opacity: revealed || reduce ? 1 : 0,
        boxShadow: lit ? 'var(--shadow-xl)' : 'none',
        transition: 'transform var(--dur-normal) var(--ease-out), box-shadow var(--dur-normal) ease, border-color var(--dur-normal) ease',
        /* Entrance runs as a slow keyframe so the snappy hover transition above
           is untouched. `backwards` holds the from-state during the stagger.   */
        animation: revealed && !reduce ? 'cardRise 1.05s var(--ease-spring) backwards' : 'none',
        animationDelay: `${index * 130}ms`,
      }}
    >
      {/* decorative accent blob, grows out of the top-right corner on hover */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '108px',
          height: '108px',
          borderRadius: 'var(--radius-circle)',
          background: 'radial-gradient(circle at 30% 30%, var(--accent-soft), transparent 70%)',
          transform: lit ? 'scale(1.5)' : 'scale(.6)',
          opacity: lit ? 1 : 0,
          transition: 'transform var(--dur-slow) var(--ease-out), opacity var(--dur-slow) ease',
          pointerEvents: 'none',
        }}
      />

      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          aria-hidden="true"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            display: 'grid',
            placeItems: 'center',
            transform: lit ? 'scale(1.1) rotate(-5deg)' : 'none',
            transition: 'transform 0.4s var(--ease-magnetic)',
          }}
        >
          <span style={{ display: 'block', width: '24px', height: '24px' }}>
            {FOCUS_ICONS[item.icon] || FOCUS_ICONS._default}
          </span>
        </span>
        <span style={{
          fontSize: '13px',
          fontWeight: 'var(--fw-extrabold)',
          color: 'var(--accent)',
          letterSpacing: 'var(--ls-wide)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </span>

      <span style={{
        display: 'block',
        fontSize: '21px',
        fontWeight: 'var(--fw-bold)',
        letterSpacing: 'var(--ls-tight)',
        marginTop: '20px',
        lineHeight: 1.12,
      }}>
        {item.title}
      </span>

      <span style={{
        display: 'block',
        fontSize: 'var(--text-sm)',
        color: 'var(--muted)',
        marginTop: '7px',
        lineHeight: 'var(--lh-normal)',
      }}>
        {item.desc}
      </span>

      <span style={{
        display: 'block',
        marginTop: 'auto',
        paddingTop: 'var(--space-4)',
        fontSize: '13px',
        fontWeight: 'var(--fw-bold)',
        color: 'var(--accent)',
        opacity: lit ? 1 : 0,
        transform: lit ? 'none' : 'translateX(-5px)',
        transition: 'opacity var(--dur-fast) ease, transform var(--dur-fast) ease',
      }}>
        {moreLabel}
      </span>
    </button>
  );
}

export function FocusGrid({
  id = 'focusSection',
  eyebrow = 'Section eyebrow',
  heading = 'Section headline goes here',
  sub = 'A short supporting sentence about this section goes here.',
  items = DEFAULT_ITEMS,
  columns = 3,
  moreLabel = 'Learn more →',
  emptyTitle = 'Coming soon',
  emptyBody = 'A breakdown of this area is on the way.',
  onSelect,
  style,
}) {
  const list = Array.isArray(items) ? items : [];
  const { shown, reduce, register } = useScrollReveal(list.length);

  const revealStyle = (key, delay) => ({
    opacity: shown[key] || reduce ? 1 : 0,
    transform: shown[key] || reduce ? 'none' : 'translateY(34px)',
    transition: 'var(--transition-reveal)',
    transitionDelay: delay,
    willChange: 'opacity, transform',
  });

  return (
    <section
      id={id}
      className="focus"
      style={{ padding: 'var(--space-8) 0 var(--section-gap)', fontFamily: 'var(--font)', color: 'var(--ink)', ...style }}
    >
      {/* Column counts can't be expressed inline; everything else is inline. */}
      <style>{`
        .${FG_CLASS}{ display:grid; grid-template-columns:repeat(var(--edp-fg-cols,3),1fr); gap:14px; }
        @media(max-width:880px){ .${FG_CLASS}{ grid-template-columns:repeat(2,1fr); } }
        @media(max-width:520px){ .${FG_CLASS}{ grid-template-columns:1fr; } }
      `}</style>

      <div
        ref={register('eyebrow')}
        data-reveal-key="eyebrow"
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--fw-bold)',
          letterSpacing: 'var(--ls-caps)',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          margin: '0 0 14px',
          ...revealStyle('eyebrow', '0s'),
        }}
      >
        <span aria-hidden="true" style={{ width: '28px', height: '2px', background: 'var(--accent)', borderRadius: '2px', display: 'inline-block' }} />
        {eyebrow}
      </div>

      <h2
        ref={register('h2')}
        data-reveal-key="h2"
        style={{
          fontSize: 'clamp(26px, 3vw, 38px)',
          fontWeight: 'var(--fw-extrabold)',
          letterSpacing: 'var(--ls-tighter)',
          margin: '0 0 6px',
          ...revealStyle('h2', '.08s'),
        }}
      >
        {heading}
      </h2>

      {sub ? (
        <p
          ref={register('sub')}
          data-reveal-key="sub"
          style={{
            color: 'var(--muted)',
            fontSize: 'var(--text-base)',
            margin: '0 0 34px',
            ...revealStyle('sub', '.18s'),
          }}
        >
          {sub}
        </p>
      ) : (
        <div style={{ height: '34px' }} />
      )}

      <div className={FG_CLASS} style={{ '--edp-fg-cols': columns }}>
        {list.length > 0 ? (
          list.map((item, i) => (
            <FocusCard
              key={`${item.title}-${i}`}
              item={item}
              index={i}
              moreLabel={moreLabel}
              reduce={reduce}
              revealed={!!shown[`card-${i}`]}
              registerRef={register(`card-${i}`)}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div style={{
            gridColumn: '1/-1',
            border: '2px dashed #dcdce1' /* no token: dashed placeholder rule */,
            borderRadius: 'var(--radius-lg)',
            padding: '46px 24px',
            textAlign: 'center',
            background: 'var(--color-bg-warm)',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 'var(--fw-extrabold)', letterSpacing: 'var(--ls-tight)', color: 'var(--accent)' }}>
              {emptyTitle}
            </div>
            <div style={{ fontSize: '14.5px', color: 'var(--muted)', marginTop: '6px' }}>
              {emptyBody}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
