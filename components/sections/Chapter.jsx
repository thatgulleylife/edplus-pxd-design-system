import React, { useEffect, useRef, useState } from 'react';

/**
 * Chapter — the numbered narrative section shell used four times on the
 * long-form "note" page (`section.chapter` at lines ~349, ~383, ~406, ~562 of
 * the source page). One component covers all four variations:
 *
 *   1. Rule eyebrow + heading + two-column problem/lead grid + proportional bar
 *   2. Rule eyebrow + heading (accent word) + subhead, sitting on a full-bleed
 *      tinted band (`#f7f5f8` → var(--bg-soft))
 *   3. Rule eyebrow + heading + subhead + accent "hint" pill, body slotted in
 *   4. Centered accent eyebrow row + heading + subhead (the portfolio variant,
 *      which drops the mono marker for a short accent rule + caps label)
 *
 * Geometry (desktop, straight from the source CSS):
 *   section      — padding 64px 0 96px, no max-width of its own (the page's
 *                  .wrap column supplies max-width 1280 / 56px side padding)
 *   tint band    — ::before, inset 0 calc(50% - 50vw), z-index -1, isolation
 *                  isolate on the section so it never paints over the page
 *   rule eyebrow — flex row, gap 20, margin-bottom 56; mono 12.5px / 700 /
 *                  .24em caps in --muted, then a 1px --line rule filling the row
 *   heading      — clamp(28px, 3.4vw, 46px), 800, -0.035em, line-height 1.02;
 *                  margin-bottom 44 when it stands alone, 0 when a subhead follows
 *   subhead      — 16.5px / 1.6 --muted, margin-top 24, max-width 480
 *                  (centered variant: margin-top 18, no max-width)
 *   hint pill    — 9/15 padding, --accent-soft on --accent, 13.5px 700, pill radius
 *   grid         — .85fr / 1.15fr, gap 64, align-items start; collapses to one
 *                  column with gap 28 at 820px
 *   problem card — 1px --line, radius 16, padding 22/24, white, max-width 400
 *   lead         — clamp(18px, 1.9vw, 22px) / 1.55 in --ink; <em> renders italic
 *                  --accent at weight 500
 *   viz bar      — margin-top 64; 62px tall pill-radius row, 3px gaps, first
 *                  segment flex 0 0 85% in a soft accent tint, last segment
 *                  flex 1 with the 140deg accent → accent-deep gradient; legend
 *                  row below with 11px square-ish (3px radius) swatches
 *
 * Motion — the page's `.sreveal` scroll reveal, reproduced exactly: each block
 * starts at opacity 0 / translateY(34px) and settles with
 * `opacity 1s ease, transform 1.15s var(--ease-spring)`, with the source's small
 * per-block transition-delays (0s eyebrow → .1s second grid column). The
 * IntersectionObserver contract matches the source: enter at
 * rootMargin '0px 0px -15% 0px'; reset (so the reveal can replay) only once the
 * block has dropped fully below the true viewport bottom, so scrolling back up
 * never re-animates. prefers-reduced-motion short-circuits to the rested state.
 *
 * No named keyframes are required — the whole section is transition-driven.
 */

/* Shared `.sreveal` observer contract. Returns [ref, shown]. */
function useSReveal(animate) {
  const ref = useRef(null);
  const [shown, setShown] = useState(!animate);

  useEffect(() => {
    if (!animate) {
      setShown(true);
      return undefined;
    }
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return undefined;
    }
    const el = ref.current;
    if (!el) return undefined;

    // Enter — trigger line pulled up 15% so a block animates once it is
    // comfortably on screen rather than the instant it peeks in.
    const ioIn = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setShown(true);
        });
      },
      { threshold: 0, rootMargin: '0px 0px -15% 0px' }
    );

    // Reset — true viewport bottom (no rootMargin), so the reset is never seen.
    const ioReset = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) return;
          const rb = e.rootBounds || { bottom: window.innerHeight };
          if (e.boundingClientRect.top >= rb.bottom - 1) setShown(false);
        });
      },
      { threshold: 0 }
    );

    ioIn.observe(el);
    ioReset.observe(el);
    return () => {
      ioIn.disconnect();
      ioReset.disconnect();
    };
  }, [animate]);

  return [ref, shown];
}

/* One `.sreveal` block. `as` keeps the semantics of whatever it wraps. */
function Reveal({ as: Tag = 'div', delay = 0, animate = true, style, children, ...rest }) {
  const [ref, shown] = useSReveal(animate);
  return (
    <Tag
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(34px)',
        transition: 'opacity 1s ease, transform 1.15s var(--ease-spring)',
        transitionDelay: delay ? `${delay}s` : undefined,
        willChange: 'opacity, transform',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* Wrap any occurrences of `accents` in an --accent span, and honor \n as <br>. */
function renderHeadline(text, accents) {
  if (typeof text !== 'string') return text;
  const list = (Array.isArray(accents) ? accents : accents ? [accents] : []).filter(Boolean);
  const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = list.length ? new RegExp(`(${list.map(esc).join('|')})`, 'gi') : null;

  return text.split('\n').map((line, li) => (
    <React.Fragment key={`l${li}`}>
      {li > 0 ? <br /> : null}
      {re
        ? line.split(re).map((part, pi) =>
            list.some((a) => String(a).toLowerCase() === part.toLowerCase()) ? (
              <span key={`a${pi}`} style={{ color: 'var(--accent)' }}>
                {part}
              </span>
            ) : (
              <React.Fragment key={`t${pi}`}>{part}</React.Fragment>
            )
          )
        : line}
    </React.Fragment>
  ));
}

/* Italic accent emphasis inside the lead paragraph ("...<em>became</em>..."). */
function renderLead(lead, emphasis) {
  if (typeof lead !== 'string' || !emphasis) return lead;
  const esc = String(emphasis).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = lead.split(new RegExp(`(${esc})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === String(emphasis).toLowerCase() ? <em key={i}>{part}</em> : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

/* The default hint-pill glyph — the source's cursor/tap arrow. */
const HINT_ICON = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    style={{ width: 16, height: 16, flex: '0 0 auto' }}
  >
    <path d="M4 4l7.07 17 2.51-7.39L21 11.07 4 4z" />
  </svg>
);

const MONO = 'var(--font-mono)';

export function Chapter({
  id,
  marker = 'Chapter 01',
  markerVariant = 'rule',
  headline = 'Section headline goes here',
  headlineAccent,
  headingLevel = 2,
  headlineSpacing,
  subhead = '',
  hint = '',
  hintIcon,
  align = 'left',
  tinted = false,
  tintColor = 'var(--bg-soft)',
  problem,
  lead = '',
  leadEmphasis = '',
  viz,
  animate = true,
  children,
  className = '',
  style,
}) {
  const Heading = `h${Math.min(Math.max(Number(headingLevel) || 2, 1), 6)}`;
  const headingId = `${id || 'edp-chapter'}-title`;
  const centered = align === 'center';
  const hasGrid = Boolean(problem || lead);
  const spacing = headlineSpacing || (subhead || hint || hasGrid ? 'tight' : 'wide');

  const rootClass = ['edp-chapter', tinted ? 'edp-chapter--tinted' : '', className]
    .filter(Boolean)
    .join(' ');

  const problemLabel = (problem && problem.label) || 'Label';
  const problemHeadline = (problem && problem.headline) || 'Short problem statement goes here.';

  const vizLabel = (viz && viz.label) || 'Metric label';
  const vizSegments = (viz && viz.segments) || [];
  const vizLegend = (viz && viz.legend) || [];

  const softFill = 'color-mix(in srgb, var(--accent) 13%, var(--bg))';
  const solidFill = 'linear-gradient(140deg, var(--accent), var(--accent-deep))';

  return (
    <section
      id={id}
      className={rootClass}
      aria-labelledby={headline ? headingId : undefined}
      style={{
        fontFamily: 'var(--font)',
        color: 'var(--ink)',
        textAlign: centered ? 'center' : undefined,
        '--edp-chapter-tint': tintColor,
        ...style,
      }}
    >
      <style>{`
        .edp-chapter{ padding:var(--space-16) 0 var(--space-24); }
        .edp-chapter--tinted{ position:relative; isolation:isolate; }
        .edp-chapter--tinted::before{
          content:""; position:absolute; inset:0 calc(50% - 50vw);
          background:var(--edp-chapter-tint); z-index:-1;
        }
        .edp-chapter__grid{
          display:grid; grid-template-columns:.85fr 1.15fr;
          gap:var(--space-16); align-items:start;
        }
        @media(max-width:820px){
          .edp-chapter__grid{ grid-template-columns:1fr; gap:var(--space-7); }
        }
        .edp-chapter__lead em{
          font-style:italic; color:var(--accent); font-weight:var(--fw-medium);
        }
      `}</style>

      {/* ── Eyebrow: mono "Chapter 0N" + hairline rule, or the centered accent row ── */}
      {marker && markerVariant === 'rule' ? (
        <Reveal
          animate={animate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-5)',
            marginBottom: 'var(--space-14)',
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: '12.5px',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: '.24em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {marker}
          </span>
          <span
            aria-hidden="true"
            style={{ flex: 1, height: 1, background: 'var(--line)' }}
          />
        </Reveal>
      ) : null}

      {marker && markerVariant === 'accent' ? (
        <Reveal
          animate={animate}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: centered ? 'center' : 'flex-start',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <span
            aria-hidden="true"
            style={{ width: 26, height: 2, borderRadius: 2, background: 'var(--accent)' }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--ls-caps)',
              textTransform: 'uppercase',
              color: 'var(--accent)',
            }}
          >
            {marker}
          </p>
        </Reveal>
      ) : null}

      {/* ── Headline ── */}
      {headline ? (
        <Reveal
          as={Heading}
          id={headingId}
          animate={animate}
          style={{
            fontSize: 'clamp(28px, 3.4vw, 46px)',
            fontWeight: 'var(--fw-extrabold)',
            letterSpacing: 'var(--ls-tighter)',
            lineHeight: 1.02,
            color: 'var(--ink)',
            margin: spacing === 'wide' ? '0 0 44px' : 0,
          }}
        >
          {renderHeadline(headline, headlineAccent)}
        </Reveal>
      ) : null}

      {/* ── Subhead ── */}
      {subhead ? (
        <Reveal
          as="p"
          animate={animate}
          style={{
            fontSize: '16.5px',
            lineHeight: 'var(--lh-relaxed)',
            fontWeight: 'var(--fw-regular)',
            color: 'var(--muted)',
            margin: centered ? '18px auto 0' : 'var(--space-6) 0 0',
            maxWidth: centered ? undefined : 480,
          }}
        >
          {subhead}
        </Reveal>
      ) : null}

      {/* ── Hint pill ── */}
      {hint ? (
        <Reveal
          as="p"
          animate={animate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            margin: '22px 0 0',
            padding: '9px 15px',
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            borderRadius: 'var(--radius-pill)',
            fontSize: '13.5px',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: '.01em',
          }}
        >
          {hintIcon === undefined ? HINT_ICON : hintIcon}
          {hint}
        </Reveal>
      ) : null}

      {/* ── Two-column problem / lead grid ── */}
      {hasGrid ? (
        <div className="edp-chapter__grid">
          <Reveal animate={animate}>
            {problem ? (
              <div
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 16,
                  padding: '22px 24px',
                  background: 'var(--bg)',
                  maxWidth: 400,
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 'var(--fw-bold)',
                    letterSpacing: '.2em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  {problemLabel}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--fw-extrabold)',
                    letterSpacing: '-0.02em',
                    lineHeight: 'var(--lh-snug)',
                    margin: 'var(--space-3) 0 0',
                    color: 'var(--ink)',
                  }}
                >
                  {problemHeadline}
                </div>
              </div>
            ) : null}
          </Reveal>

          <Reveal animate={animate} delay={0.1}>
            {lead ? (
              <p
                className="edp-chapter__lead"
                style={{
                  fontSize: 'clamp(18px, 1.9vw, 22px)',
                  lineHeight: 1.55,
                  color: 'var(--ink)',
                  margin: 0,
                  fontWeight: 'var(--fw-regular)',
                  letterSpacing: '-0.01em',
                  textWrap: 'pretty',
                  textAlign: 'left',
                }}
              >
                {renderLead(lead, leadEmphasis)}
              </p>
            ) : null}
          </Reveal>
        </div>
      ) : null}

      {/* ── Proportional bar + legend ── */}
      {viz ? (
        <Reveal animate={animate} style={{ marginTop: 'var(--space-16)', textAlign: 'left' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            {vizLabel}
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 'var(--space-5)',
              height: 62,
              borderRadius: 'var(--radius-pill)',
              overflow: 'hidden',
              gap: 3,
            }}
          >
            {vizSegments.map((seg, i) => {
              const solid = seg.tone !== 'soft';
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 26px',
                    overflow: 'hidden',
                    flex: seg.share ? `0 0 ${seg.share}%` : 1,
                    background: seg.background || (solid ? solidFill : softFill),
                    color: solid ? 'var(--color-bg)' : 'var(--accent)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--fw-bold)',
                      letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {seg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {vizLegend.length ? (
            <div
              style={{
                display: 'flex',
                gap: 26,
                marginTop: 18,
                flexWrap: 'wrap',
              }}
            >
              {vizLegend.map((item, i) => {
                const solid = item.tone !== 'soft';
                return (
                  <span
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--muted)',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: 3,
                        flex: '0 0 auto',
                        background: solid ? 'var(--accent)' : softFill,
                        boxShadow: solid
                          ? undefined
                          : 'inset 0 0 0 1px color-mix(in srgb, var(--accent-deep) 22%, transparent)',
                      }}
                    />
                    <b style={{ fontWeight: 'var(--fw-bold)', color: 'var(--ink)' }}>
                      {item.label}
                    </b>
                    {item.value ? <>&nbsp;— {item.value}</> : null}
                  </span>
                );
              })}
            </div>
          ) : null}
        </Reveal>
      ) : null}

      {children}
    </section>
  );
}
