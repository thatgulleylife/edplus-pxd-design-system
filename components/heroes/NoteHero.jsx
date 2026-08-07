import React from 'react';

/**
 * NoteHero — the editorial "note from…" hero from the live microsite.
 *
 * Ported 1:1 from `section.note-hero`. Two-column grid, text-heavy left column
 * (eyebrow → oversized headline with accent spans → lead → pill byline) beside a
 * media column whose image deliberately BLEEDS off the right edge of the screen:
 *
 *   grid-template-columns : minmax(0,1.35fr) minmax(0,1fr)
 *   gap                   : 24px, align-items:center, padding 88px 0 24px
 *   img width             : calc(100% + var(--gutter) + 32px)   ← the overhang
 *   img height            : clamp(380px, 42vw, 560px), object-fit:contain,
 *                           object-position:left center
 *
 * `--gutter` is the page-level distance from the viewport's left edge to the
 * content column — `max(56px, calc(50vw - 584px))` for the 1280/56 shell. It is
 * read here with that exact fallback so the component keeps its geometry when
 * dropped into a page that has not declared it. The host page needs
 * `overflow-x: clip` on body for the overhang to be clipped rather than scroll.
 *
 * Breakpoints (component-local <style>, scoped by a generated uid):
 *   ≤880px — single column, gap 36px; the media un-bleeds and instead spans
 *            full width via negative gutter margins, height clamp(260px,58vw,400px)
 *   ≤680px — section padding tightens to 52px 0 16px
 *   ≤560px — byline wraps, corner softens to --radius-card, the "·" separator hides
 *
 * Motion mirrors the site-wide `.sreveal` scroll reveal (opacity 0→1,
 * translateY(34px)→0; `opacity 1s ease, transform 1.15s var(--ease-spring)`),
 * driven by the same directional IntersectionObserver pair as home.js: an enter
 * observer with the trigger line pulled up 15% from the viewport bottom, and a
 * reset observer on the true bottom edge so an element only replays after it has
 * fully dropped below the fold. Scrolling back up past the top never replays it.
 * The media column trails the text by `mediaRevealDelay` (0.12s on the source).
 * Honors prefers-reduced-motion.
 */

let uidSeq = 0;

/** Normalizes a headline line into an array of {text, accent} segments. */
function toSegments(line) {
  if (typeof line === 'string') return [{ text: line, accent: false }];
  if (Array.isArray(line)) {
    return line.map((s) => (typeof s === 'string' ? { text: s, accent: false } : s));
  }
  return [line];
}

export function NoteHero({
  eyebrow = 'Eyebrow label',
  headlineLines = [
    [{ text: 'Section ' }, { text: 'headline', accent: true }],
    'goes here',
    [{ text: 'on three lines' }, { text: '.', accent: true }],
  ],
  lead = ['Supporting sentence goes here,', 'and a second line follows.'],
  authorName = 'Author Name',
  authorRole = 'Role Title, Organization',
  avatarInitials,
  avatarSrc,
  mediaSrc,
  mediaAlt = 'Section illustration',
  revealOnScroll = true,
  mediaRevealDelay = 0.12,
  className = '',
  style = {},
  ...rest
}) {
  const uid = React.useMemo(() => 'edp-notehero-' + (uidSeq += 1), []);
  const textRef = React.useRef(null);
  const mediaRef = React.useRef(null);
  const [revealed, setRevealed] = React.useState(() => [!revealOnScroll, !revealOnScroll]);

  /* --- directional scroll reveal, mirroring the page's .sreveal observer pair --- */
  React.useEffect(() => {
    if (!revealOnScroll) {
      setRevealed([true, true]);
      return undefined;
    }
    const nodes = [textRef.current, mediaRef.current].filter(Boolean);
    if (!nodes.length) return undefined;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setRevealed([true, true]);
      return undefined;
    }

    const setAt = (node, on) => {
      const i = node === mediaRef.current ? 1 : 0;
      setRevealed((prev) => (prev[i] === on ? prev : i === 0 ? [on, prev[1]] : [prev[0], on]));
    };

    // Enter — trigger line pulled up 15% from the bottom.
    const ioIn = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setAt(e.target, true);
        });
      },
      { threshold: [0], rootMargin: '0px 0px -15% 0px' }
    );

    // Reset — true viewport bottom only; elements past the TOP stay revealed.
    const ioReset = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) return;
          const rb = e.rootBounds || { bottom: window.innerHeight };
          if (e.boundingClientRect.top >= rb.bottom - 1) setAt(e.target, false);
        });
      },
      { threshold: 0 }
    );

    nodes.forEach((n) => {
      ioIn.observe(n);
      ioReset.observe(n);
    });
    return () => {
      ioIn.disconnect();
      ioReset.disconnect();
    };
  }, [revealOnScroll]);

  /* ---------- derived content ---------- */
  const initials =
    avatarInitials != null
      ? avatarInitials
      : String(authorName || '')
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w.charAt(0).toUpperCase())
          .join('');

  const leadLines = Array.isArray(lead) ? lead : lead == null ? [] : [lead];
  const lines = Array.isArray(headlineLines) ? headlineLines : [headlineLines];

  /* ---------- styles ---------- */
  const revealStyle = (on, delay) => ({
    opacity: on ? 1 : 0,
    transform: on ? 'none' : 'translateY(34px)',
    transition:
      'opacity 1s ease, transform 1.15s var(--ease-spring, cubic-bezier(.16,1,.3,1))',
    transitionDelay: delay ? delay + 's' : undefined,
    willChange: 'opacity, transform',
  });

  const sectionStyle = {
    padding: '88px 0 24px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)',
    gap: 24,
    alignItems: 'center',
    fontFamily:
      'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif)',
    color: 'var(--ink)',
    ...style,
  };

  return (
    <section
      {...rest}
      className={(uid + ' edp-note-hero ' + className).trim()}
      style={sectionStyle}
    >
      <style>{`
        .${uid}{ --edp-nh-gutter: var(--gutter, max(56px, calc(50vw - 584px))); }
        .${uid} .edp-nh-media{ position:relative; }
        .${uid} .edp-nh-img{
          display:block;
          width:calc(100% + var(--edp-nh-gutter) + 32px);
          height:clamp(380px, 42vw, 560px);
          object-fit:contain;
          object-position:left center;
        }
        @media (max-width:880px){
          .${uid}{ grid-template-columns:1fr; gap:36px; }
          .${uid} .edp-nh-media{ margin:0 calc(-1 * var(--edp-nh-gutter)); }
          .${uid} .edp-nh-img{ width:100%; height:clamp(260px,58vw,400px); }
        }
        @media (max-width:680px){
          .${uid}{ padding:52px 0 16px; }
        }
        @media (max-width:560px){
          .${uid} .edp-nh-byline{ flex-wrap:wrap; border-radius:var(--radius-card, 22px); }
          .${uid} .edp-nh-bysep{ display:none; }
        }
        @media (prefers-reduced-motion: reduce){
          .${uid} .edp-nh-reveal{
            opacity:1 !important; transform:none !important; transition:none !important;
          }
        }
      `}</style>

      {/* ---------- text column ---------- */}
      <div
        ref={textRef}
        className="edp-nh-text edp-nh-reveal"
        style={revealStyle(revealed[0], 0)}
      >
        {eyebrow && (
          <div
            className="edp-nh-eyebrow"
            style={{
              fontSize: 'var(--text-sm, 14px)',
              fontWeight: 'var(--fw-bold, 700)',
              letterSpacing: 'var(--ls-caps, .16em)',
              textTransform: 'uppercase',
              color: 'var(--accent)',
            }}
          >
            {eyebrow}
          </div>
        )}

        <h1
          className="edp-nh-headline"
          style={{
            margin: '20px 0 0',
            fontWeight: 'var(--fw-extrabold, 800)',
            letterSpacing: 'var(--ls-tightest, -0.045em)',
            lineHeight: 0.94,
            fontSize: 'clamp(46px, 6.6vw, 96px)',
            color: 'var(--ink)',
          }}
        >
          {lines.map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {toSegments(line).map((seg, j) => (
                <span key={j} style={seg.accent ? { color: 'var(--accent)' } : undefined}>
                  {seg.text}
                </span>
              ))}
            </React.Fragment>
          ))}
        </h1>

        {leadLines.length > 0 && (
          <p
            className="edp-nh-lead"
            style={{
              margin: '26px 0 0',
              fontSize: 19,
              lineHeight: 'var(--lh-relaxed, 1.6)',
              color: 'var(--muted)',
              fontWeight: 'var(--fw-regular, 400)',
              maxWidth: 640,
              textWrap: 'balance',
            }}
          >
            {leadLines.map((l, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {l}
              </React.Fragment>
            ))}
          </p>
        )}

        {(authorName || authorRole) && (
          <div
            className="edp-nh-byline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 11,
              marginTop: 44,
              padding: '7px 16px 7px 7px',
              background: 'var(--bg-soft, #f4f4f6)',
              borderRadius: 'var(--radius-pill, 999px)',
            }}
          >
            <span
              className="edp-nh-avatar"
              aria-hidden={avatarSrc ? undefined : 'true'}
              style={{
                width: 30,
                height: 30,
                borderRadius: 'var(--radius-circle, 50%)',
                background: 'var(--accent)',
                color: 'var(--bg, #fff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'var(--fw-bold, 700)',
                fontSize: 11,
                letterSpacing: 'var(--ls-wide, .02em)',
                flex: '0 0 auto',
                overflow: 'hidden',
              }}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                initials
              )}
            </span>

            {authorName && (
              <span
                className="edp-nh-byname"
                style={{
                  fontWeight: 'var(--fw-bold, 700)',
                  fontSize: 13,
                  color: 'var(--ink)',
                }}
              >
                {authorName}
              </span>
            )}

            {authorName && authorRole && (
              <span
                className="edp-nh-bysep"
                aria-hidden="true"
                style={{ color: 'var(--muted)', fontSize: 13 }}
              >
                ·
              </span>
            )}

            {authorRole && (
              <span
                className="edp-nh-byrole"
                style={{ color: 'var(--muted)', fontSize: 12.5 }}
              >
                {authorRole}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ---------- media column — bleeds off the right edge ---------- */}
      <div
        ref={mediaRef}
        className="edp-nh-media edp-nh-reveal"
        style={revealStyle(revealed[1], mediaRevealDelay)}
      >
        {mediaSrc ? (
          <img className="edp-nh-img" src={mediaSrc} alt={mediaAlt} />
        ) : (
          // Placeholder keeps the exact overhang geometry before art is supplied.
          <div
            className="edp-nh-img"
            role="img"
            aria-label={mediaAlt}
            style={{
              background:
                'linear-gradient(135deg, var(--accent-soft, #fbeef3) 0%, var(--bg-soft) 100%)',
              borderRadius: 'var(--radius-card, 22px)',
            }}
          />
        )}
      </div>
    </section>
  );
}
