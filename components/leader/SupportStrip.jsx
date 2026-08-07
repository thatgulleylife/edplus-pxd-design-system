/* SupportStrip — leader page "what we support" horizontal feature-card scroller.
   Ported from section#supportSection.support + the JS that builds #sgrid.

   Structure (faithful to source):
     section.support
       .seyebrow             accent rule + uppercase label, scroll-revealed
       h2                    scroll-revealed, 180ms delay
       .fcwrap               (position:relative — anchors the offscreen measure layer)
         .fcstrip            flex row, overflow-x:auto, scrollbar hidden.
                             Negative side margins (-44px desktop / -20px mobile) with
                             matching padding let the scroll clip-region extend into the
                             page gutter so a hovered card's shadow isn't sliced off,
                             while the cards stay aligned with the heading.
           button.fccard ×N  150px collapsed → 380px active (108 → min(76vw,320px) mobile)
             collapsed:  .fc-cnum "01."  +  .fc-cbottom(.fc-iconbubble.fc-sm + .fc-ctitle)
             active:     .fc-wave(<img> OR generated line-wave SVG)
                       + .fc-abody(.fc-iconbubble + .fc-atitle + .fc-asub? + .fc-adesc?)
         nav.fcnav           prev button · "01 / 06" counter · next button

   Motion:
     - eyebrow / h2  use the shared reveal transition (opacity 1s, transform 1.15s spring)
     - cards         enter with the shared `cardRise` keyframe, staggered 70ms apart,
                     `backwards` so the stagger holds the from-state. It runs as a
                     keyframe (not a transition) so the .55s width-expand transition
                     is left untouched.
     - active body   fades up with the shared `fcFade` keyframe (.36s ease .18s both)
     - width         .55s var(--ease-in-out) — matches the source cubic-bezier(.4,0,.2,1)

   Geometry note (fcScroll): centring uses the TARGET widths that mirror the CSS, not
   live offsetWidth — cards animate their width over .55s, so measuring mid-transition
   miscentres them. The leftover viewport on each side becomes the peek of the
   neighbouring cards, the "there's more to swipe" cue.

   Height note (fcMeasure): every card is sized to the TALLEST card's real content,
   measured at the active width in an offscreen layer, instead of a fixed height —
   this kills dead whitespace under shorter cards and adapts per page. Re-runs on
   resize because the active width (and thus how text wraps) changes with viewport.
   On mobile the result is capped to 82% of the viewport height so a long card can
   never grow taller than the screen.                                              */

const FCS = 'edp-fcstrip';

/* ── Line/solid glyphs keyed by `item.icon`. Purely decorative, no branding.
      Source drew these at 15×15 with a flat #555; here they inherit currentColor
      so the icon well can be themed from a token.                              ── */
const SUPPORT_ICONS = {
  lightning: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M13 2L3 14h8l-2 8 10-12h-8z" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  migrate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3L4 7l4 4" /><path d="M4 7h16" /><path d="M16 21l4-4-4-4" /><path d="M20 17H4" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M12 2v10l8.5 4.9A10 10 0 1 1 12 2z" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  flow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  database: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  network: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="4" r="2" /><circle cx="20" cy="18" r="2" /><circle cx="4" cy="18" r="2" />
      <line x1="12" y1="6" x2="12" y2="12" /><line x1="12" y1="12" x2="20" y2="16" /><line x1="12" y1="12" x2="4" y2="16" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  rocket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    </svg>
  ),
  present: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h20" /><path d="M3 3v11h18V3" /><path d="M12 14v4" /><path d="M9 21l3-3 3 3" />
    </svg>
  ),
  education: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
    </svg>
  ),
};

/* Fallback wave palette — [background, midtone stroke, accent stroke]. */
const DEF_COLORS = ['var(--accent-soft)', 'var(--color-maroon-mid)', 'var(--accent)'];

/* Generic placeholder content. No real names, teams, metrics or imagery. */
const DEFAULT_ITEMS = [
  { t: 'Capability one',   d: 'One or two sentences describing this area of work and who it serves.', icon: 'user',     colors: ['var(--accent-soft)',      'var(--color-maroon-mid)', 'var(--accent)'] },
  { t: 'Capability two',   d: 'One or two sentences describing this area of work and who it serves.', icon: 'chat',     colors: ['var(--color-gold-soft)',  'var(--color-gold)',       'var(--color-gold-ink)'] },
  { t: 'Capability three', d: 'One or two sentences describing this area of work and who it serves.', icon: 'chart',    colors: ['var(--color-green-soft)', 'var(--color-green)',      'var(--color-green-ink)'] },
  { t: 'Capability four',  d: 'One or two sentences describing this area of work and who it serves.', icon: 'globe',    colors: ['var(--color-blue-soft)',  'var(--color-blue)',       'var(--color-blue-ink)'] },
  { t: 'Capability five',  d: 'One or two sentences describing this area of work and who it serves.', icon: 'shield',   colors: ['var(--accent-soft)',      'var(--color-maroon)',     'var(--color-maroon-deep)'] },
  { t: 'Capability six',   d: 'One or two sentences describing this area of work and who it serves.', icon: 'database', colors: ['var(--bg-soft)',          'var(--color-muted)',      'var(--color-ink-2)'] },
];

const pad2 = (n) => (n < 10 ? '0' : '') + n;
const isMobile = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(max-width:720px)').matches
    : false;
/* Target widths that mirror the CSS below — kept in one place so the scroll math
   and the measure pass can't drift from the stylesheet. */
const activeWidth = () =>
  isMobile() ? Math.min((typeof window !== 'undefined' ? window.innerWidth : 1280) * 0.76, 320) : 380;

/* ── Generated line-wave artwork, ported 1:1 from fcWave(). 24 cubic curves swept
      down a 400×200 box; every other stroke swaps between the midtone and accent
      colour, every fifth is thicker, and opacity ramps 0.1 → 0.8 top to bottom.
      Colours are applied via `style` (not the stroke attribute) so CSS custom
      properties resolve.                                                       ── */
function WaveArt({ colors }) {
  const c = colors && colors.length === 3 ? colors : DEF_COLORS;
  const [bg, mid, accent] = c;
  const paths = [];
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    const y0 = 4 + t * 192;
    const cp1y = y0 + Math.cos(t * Math.PI * 2.4 + 0.6) * 58 - 18;
    const cp2y = y0 + Math.sin(t * Math.PI * 1.9 + 1.1) * 46;
    const y1 = 8 + t * 178 + Math.sin(t * Math.PI * 2.9) * 14;
    paths.push(
      <path
        key={i}
        d={`M-5 ${y0.toFixed(1)} C88 ${cp1y.toFixed(1)}, 258 ${cp2y.toFixed(1)}, 405 ${y1.toFixed(1)}`}
        fill="none"
        style={{ stroke: i % 2 === 0 ? mid : accent }}
        strokeWidth={i % 5 === 0 ? 2.2 : 1}
        opacity={(0.1 + t * 0.7).toFixed(3)}
      />
    );
  }
  /* <span> rather than <div>: the card is a real <button>, whose content model
     only allows phrasing content. Display is restored to block in the CSS. */
  return (
    <span className={`${FCS}-waveinner`} style={{ background: bg }}>
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">{paths}</svg>
    </span>
  );
}

function IconBubble({ icon, small }) {
  return (
    <span className={`${FCS}-bubble${small ? ` ${FCS}-bubble-sm` : ''}`} aria-hidden="true">
      <span className={`${FCS}-bubble-g`}>{SUPPORT_ICONS[icon] || SUPPORT_ICONS.lightning}</span>
    </span>
  );
}

/* Expanded card contents: artwork band + fading body. */
function ActiveBody({ item }) {
  return (
    <>
      <span className={`${FCS}-wave`}>
        {item.img ? (
          <img className={`${FCS}-topimg`} src={item.img} alt={item.imgAlt || ''} loading="lazy" decoding="async" />
        ) : (
          <WaveArt colors={item.colors} />
        )}
      </span>
      <span className={`${FCS}-abody`}>
        <IconBubble icon={item.icon} />
        <span className={`${FCS}-atitle`}>{item.t}</span>
        {item.sub ? <span className={`${FCS}-asub`}>{item.sub}</span> : null}
        {item.d ? <span className={`${FCS}-adesc`}>{item.d}</span> : null}
      </span>
    </>
  );
}

/* Collapsed card contents: big ghosted index number, icon + title pinned bottom. */
function CollapsedBody({ item, index }) {
  return (
    <>
      <span className={`${FCS}-cnum`} aria-hidden="true">{pad2(index + 1)}.</span>
      <span className={`${FCS}-cbottom`}>
        <IconBubble icon={item.icon} small />
        <span className={`${FCS}-ctitle`}>{item.t}</span>
      </span>
    </>
  );
}

/* Scroll reveal, ported from revealCards():
   - enter observer pulls the trigger line up 15% from the viewport bottom
   - reset observer uses the TRUE viewport bottom, so an element only resets
     (to replay) once it has fully dropped below the fold; elements scrolled
     past the top stay revealed                                                */
function useScrollReveal() {
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
  }, []);

  return { shown, reduce, register };
}

export function SupportStrip({
  id = 'supportSection',
  eyebrow = 'Section eyebrow',
  heading = 'Section headline goes here',
  items = DEFAULT_ITEMS,
  initialIndex = 0,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  navLabel = 'Feature cards',
  arrowKeyNavigation = true,
  onSelect,
  style,
}) {
  const list = Array.isArray(items) && items.length ? items : [];
  const [index, setIndex] = React.useState(
    Math.max(0, Math.min(list.length - 1, initialIndex || 0))
  );
  const { shown, reduce, register } = useScrollReveal();

  const stripRef = React.useRef(null);
  const measureRef = React.useRef(null);
  const didMount = React.useRef(false);

  /* ── fcScroll: centre the active card using TARGET widths (not live
        offsetWidth — the cards animate their width over .55s, so measuring
        mid-transition miscentres them). Cards before the active one are all
        collapsed, so the active card's offsetLeft is simply the strip's
        padding-left plus `index` collapsed widths + gaps.                  ── */
  const scrollToCard = React.useCallback((idx) => {
    const sg = stripRef.current;
    if (!sg) return;
    const mobile = isMobile();
    const CW = mobile ? 108 : 150;
    const AW = activeWidth();
    const G = mobile ? 12 : 14;
    const padL = parseFloat(getComputedStyle(sg).paddingLeft) || 0;
    const left = padL + idx * (CW + G);
    sg.scrollLeft = Math.max(0, left - (sg.clientWidth - AW) / 2);
  }, []);

  const select = React.useCallback((next) => {
    const clamped = Math.max(0, Math.min(list.length - 1, next));
    /* Re-selecting the open card is a no-op — the source guards this so the
       expanded body doesn't flash its content out and back in. */
    if (clamped === index) return;
    setIndex(clamped);
    if (onSelect) onSelect(list[clamped], clamped);
  }, [list, index, onSelect]);

  /* Scroll after the class flip lands (source waits 30ms). Skipped on mount so
     the component never yanks the page on first paint. */
  React.useEffect(() => {
    if (!didMount.current) { didMount.current = true; return undefined; }
    const t = setTimeout(() => scrollToCard(index), 30);
    return () => clearTimeout(t);
  }, [index, scrollToCard]);

  /* ── fcMeasure: size every card to the tallest card's real content, measured
        at the active width in the offscreen layer. Runs on mount and on a
        debounced resize; on mobile the result is capped to 82vh.            ── */
  const measure = React.useCallback(() => {
    const sg = stripRef.current;
    const layer = measureRef.current;
    if (!sg || !layer) return;
    const mobile = isMobile();
    layer.style.width = `${activeWidth()}px`;
    let maxH = 0;
    Array.prototype.forEach.call(layer.children, (child) => {
      if (child.offsetHeight > maxH) maxH = child.offsetHeight;
    });
    if (!maxH) return;
    const cap = Math.round(window.innerHeight * 0.82);
    sg.style.setProperty('--fcH', `${mobile ? Math.min(maxH, cap) : maxH}px`);
  }, []);

  React.useLayoutEffect(() => {
    measure();
    let rt;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(measure, 150); };
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(rt); window.removeEventListener('resize', onResize); };
  }, [measure, list]);

  /* Left/right arrow keys step through the cards, same as the nav buttons.
     Ignored while the user is typing in a field. */
  React.useEffect(() => {
    if (!arrowKeyNavigation) return undefined;
    const onKey = (e) => {
      const el = e.target;
      const tag = el && el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el && el.isContentEditable)) return;
      if (e.key === 'ArrowLeft') select(index - 1);
      else if (e.key === 'ArrowRight') select(index + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [arrowKeyNavigation, index, select]);

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
      className="support"
      style={{
        padding: 'var(--space-8) 0 var(--section-gap)',
        fontFamily: 'var(--font)',
        color: 'var(--ink)',
        ...style,
      }}
    >
      {/* Hover states, hidden scrollbars, the width/height media queries and the
          reduced-motion escape hatch can't be expressed as inline styles. */}
      <style>{`
        .${FCS}-strip{ display:flex; gap:14px; overflow-x:auto; scroll-behavior:smooth; align-items:stretch;
          padding:24px 44px 48px; margin:0 -44px; scrollbar-width:none; -ms-overflow-style:none; }
        .${FCS}-strip::-webkit-scrollbar{ display:none; }

        .${FCS}-card{ flex:none; width:150px; height:var(--fcH,570px); background:var(--bg);
          border-radius:var(--radius-card); overflow:hidden; cursor:pointer; display:flex;
          flex-direction:column; position:relative; text-align:left; border:0; padding:0;
          margin:0; font:inherit; color:var(--ink); -webkit-appearance:none; appearance:none;
          box-shadow:var(--shadow-xs), 0 4px 20px rgba(0,0,0,.05);
          transition:width var(--dur-slow) var(--ease-in-out), box-shadow .22s ease;
          opacity:0; transform:translateY(28px); }
        /* entrance via keyframe so the width-expand transition above is untouched */
        .${FCS}-card.is-in{ opacity:1; transform:none; animation:cardRise .9s var(--ease-spring) backwards; }
        .${FCS}-card:hover{ box-shadow:0 2px 10px rgba(0,0,0,.09), var(--shadow-md); }
        .${FCS}-card.is-active{ width:380px; cursor:default; }
        .${FCS}-card:focus-visible{ outline:2px solid var(--accent); outline-offset:3px; }

        .${FCS}-measure{ position:absolute; left:-9999px; top:0; opacity:0; pointer-events:none; }
        .${FCS}-measure .${FCS}-card{ width:100%; height:auto; opacity:1; transform:none;
          animation:none; transition:none; box-shadow:none; }

        .${FCS}-wave{ flex:none; height:200px; overflow:hidden; display:block; }
        .${FCS}-waveinner{ display:block; width:100%; height:200px; position:relative; overflow:hidden; }
        .${FCS}-waveinner svg{ position:absolute; inset:0; width:100%; height:100%; }
        .${FCS}-topimg{ width:100%; height:100%; object-fit:cover; display:block; }

        .${FCS}-abody{ flex:1; padding:24px 28px 30px; display:flex; flex-direction:column;
          overflow:hidden; animation:fcFade .36s ease .18s both; }
        .${FCS}-bubble{ width:36px; height:36px; border-radius:var(--radius-circle);
          background:var(--bg-soft); display:flex; align-items:center; justify-content:center;
          flex-shrink:0; color:var(--ink-2); }
        .${FCS}-bubble-sm{ width:32px; height:32px; }
        .${FCS}-bubble-g{ display:block; width:15px; height:15px; }
        .${FCS}-bubble-g svg{ display:block; width:100%; height:100%; }

        .${FCS}-atitle{ display:block; font-size:27px; font-weight:var(--fw-semibold); line-height:1.17;
          letter-spacing:var(--ls-tight); color:var(--ink); margin-top:14px; flex-shrink:0; }
        /* secondary subtitle — only on the expanded card; smaller and bolder */
        .${FCS}-asub{ display:block; font-size:var(--text-sm); font-weight:var(--fw-bold); line-height:1.3;
          letter-spacing:-0.005em; color:var(--ink); margin-top:8px; flex-shrink:0; }
        .${FCS}-adesc{ display:block; font-size:13.5px; line-height:var(--lh-normal);
          color:var(--muted); margin-top:12px; overflow:hidden; }

        .${FCS}-cnum{ display:block; padding:18px 14px 0; font-size:72px; font-weight:300; line-height:var(--lh-none);
          letter-spacing:-0.04em; color:#d8d5ce; /* no token: warm ghosted numeral */
          white-space:nowrap; user-select:none; }
        .${FCS}-cbottom{ position:absolute; bottom:24px; left:14px; right:14px; display:flex;
          flex-direction:column; gap:var(--space-2); }
        .${FCS}-ctitle{ display:block; font-size:var(--text-sm); font-weight:var(--fw-bold); line-height:1.35;
          color:var(--ink); word-break:break-word; min-height:57px; }

        .${FCS}-nav{ display:flex; align-items:center; justify-content:center; gap:18px; margin-top:4px; }
        .${FCS}-btn{ width:46px; height:46px; border-radius:var(--radius-circle); border:1px solid var(--line);
          background:var(--bg); color:var(--accent); display:flex; align-items:center;
          justify-content:center; cursor:pointer; padding:0;
          transition:background var(--dur-fast), color var(--dur-fast), border-color var(--dur-fast),
                     transform var(--dur-fast), opacity var(--dur-fast); }
        .${FCS}-btn svg{ width:20px; height:20px; }
        .${FCS}-btn:hover{ background:var(--accent); color:var(--bg); border-color:var(--accent); transform:translateY(-2px); }
        .${FCS}-btn:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
        .${FCS}-btn:disabled{ opacity:.3; cursor:default; }
        .${FCS}-btn:disabled:hover{ background:var(--bg); color:var(--accent); border-color:var(--line); transform:none; }
        .${FCS}-count{ font-size:var(--text-sm); font-weight:var(--fw-bold); color:var(--ink);
          letter-spacing:0.04em; min-width:62px; text-align:center; font-variant-numeric:tabular-nums; }
        .${FCS}-count b{ color:var(--accent); font-weight:inherit; }

        /* mobile: shorter cards, and an active card sized so the next/prev cards
           peek in from the edges — signalling there's more to swipe through */
        @media(max-width:720px){
          .${FCS}-strip{ gap:12px; padding:16px 20px 28px; margin:0 -20px; scroll-padding-left:20px; }
          .${FCS}-card{ width:108px; height:var(--fcH,540px); }
          .${FCS}-card.is-active{ width:min(76vw,320px); }
          .${FCS}-measure .${FCS}-card{ width:100%; height:auto; }
          .${FCS}-wave, .${FCS}-waveinner{ height:150px; }
          .${FCS}-abody{ padding:18px 20px 22px; }
          /* titles can be long and the active card is narrow here, so size the
             title/description down to fit the fixed card height without clipping */
          .${FCS}-atitle{ font-size:18px; line-height:1.22; }
          .${FCS}-asub{ font-size:var(--text-xs); margin-top:6px; }
          .${FCS}-adesc{ font-size:var(--text-xs); line-height:1.45; margin-top:9px; }
          .${FCS}-cnum{ font-size:60px; }
          /* collapsed cards are only 108px wide — shrink the title and reclaim a
             little side room so long single words don't break mid-word */
          .${FCS}-cbottom{ left:8px; right:8px; }
          .${FCS}-ctitle{ font-size:10.5px; letter-spacing:-0.01em; }
        }

        @media(prefers-reduced-motion:reduce){
          .${FCS}-card{ opacity:1 !important; transform:none !important; animation:none !important; }
          .${FCS}-abody{ animation:none !important; }
          .${FCS}-strip{ scroll-behavior:auto; }
        }
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
          margin: '0 0 28px',
          ...revealStyle('h2', '.18s'),
        }}
      >
        {heading}
      </h2>

      <div style={{ position: 'relative' }}>
        <div className={`${FCS}-strip`} ref={stripRef}>
          {list.map((item, i) => {
            const active = i === index;
            const revealed = !!shown[`card-${i}`];
            return (
              <button
                key={`${item.t}-${i}`}
                type="button"
                ref={register(`card-${i}`)}
                data-reveal-key={`card-${i}`}
                className={`${FCS}-card${active ? ' is-active' : ''}${revealed || reduce ? ' is-in' : ''}`}
                style={{ animationDelay: `${i * 70}ms` }}
                aria-expanded={active}
                onClick={() => select(i)}
              >
                {active ? <ActiveBody item={item} /> : <CollapsedBody item={item} index={i} />}
              </button>
            );
          })}
        </div>

        {/* Offscreen measure layer — one auto-height clone per card, rendered at
            the active width, so --fcH can be set to the tallest real content.
            The artwork band is a fixed-height spacer here; loading the real
            image would not change the measurement. */}
        <div className={`${FCS}-measure`} ref={measureRef} aria-hidden="true">
          {list.map((item, i) => (
            <div className={`${FCS}-card`} key={`m-${i}`}>
              <span className={`${FCS}-wave`} />
              <span className={`${FCS}-abody`} style={{ animation: 'none' }}>
                <IconBubble icon={item.icon} />
                <span className={`${FCS}-atitle`}>{item.t}</span>
                {item.sub ? <span className={`${FCS}-asub`}>{item.sub}</span> : null}
                {item.d ? <span className={`${FCS}-adesc`}>{item.d}</span> : null}
              </span>
            </div>
          ))}
        </div>

        <nav className={`${FCS}-nav`} aria-label={navLabel}>
          <button
            type="button"
            className={`${FCS}-btn`}
            aria-label={prevLabel}
            disabled={index === 0}
            onClick={() => select(index - 1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <span className={`${FCS}-count`} aria-live="polite">
            <b>{pad2(index + 1)}</b> / {pad2(list.length)}
          </span>

          <button
            type="button"
            className={`${FCS}-btn`}
            aria-label={nextLabel}
            disabled={index === list.length - 1}
            onClick={() => select(index + 1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>
    </section>
  );
}
