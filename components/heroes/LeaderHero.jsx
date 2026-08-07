/**
 * LeaderHero — the leader-page hero from the live microsite.
 *
 * Structure mirrors `leader.html > section.hero`: text column (eyebrow, name,
 * role, bio, chips) beside a portrait in a tilted frame with a glare sweep and
 * a floating stat badge overlapping the lower-left corner.
 *
 * The tilt/glare is presentational only — no pointer tracking here, so the
 * component stays deterministic for previews and server rendering.
 */
export function LeaderHero({
  eyebrow = 'Leadership',
  name = 'Leader Name',
  role = 'Role Title',
  bio,
  chips = [],
  photo,
  badgeValue,
  badgeLabel = 'total in\nthe org',
}) {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '1.05fr .95fr',
        gap: 48,
        alignItems: 'center',
        padding: '40px 0',
      }}
    >
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 'var(--ls-caps)',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}
        >
          <span
            style={{
              width: 26,
              height: 2,
              background: 'var(--accent)',
              borderRadius: 2,
              display: 'inline-block',
            }}
          />
          {eyebrow}
        </div>

        <h1
          style={{
            margin: '18px 0 0',
            fontWeight: 'var(--fw-extrabold)',
            letterSpacing: 'var(--ls-tighter)',
            lineHeight: 1.02,
            fontSize: 'clamp(38px, 4.6vw, 64px)',
            color: 'var(--ink)',
          }}
        >
          {name}
        </h1>

        <div
          style={{
            marginTop: 12,
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--accent)',
          }}
        >
          {role}
        </div>

        {bio && (
          <p
            style={{
              fontSize: 16.5,
              lineHeight: 'var(--lh-relaxed)',
              color: 'var(--muted)',
              maxWidth: 460,
              margin: '18px 0 0',
              textWrap: 'pretty',
            }}
          >
            {bio}
          </p>
        )}

        {chips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
            {chips.map((chip, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(176,30,84,.18)',
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Portrait — tilted frame, glare sweep, floating stat badge. */}
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <div
          style={{
            position: 'relative',
            transform: 'rotate(-2deg)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'visible',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 300,
              height: 380,
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              background: 'var(--bg-soft)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {photo && (
              <img
                src={photo}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 24%',
                }}
              />
            )}
            {/* Glare sweep across the frame. */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(115deg, rgba(255,255,255,0) 40%, rgba(255,255,255,.28) 50%, rgba(255,255,255,0) 60%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {badgeValue != null && (
            <div
              style={{
                position: 'absolute',
                left: -26,
                bottom: 34,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#fff',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--shadow-lg)',
                padding: '12px 16px',
                animation: 'pf-floatY var(--dur-float) ease-in-out infinite',
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 'var(--fw-extrabold)',
                  letterSpacing: 'var(--ls-tight)',
                  color: 'var(--accent)',
                  lineHeight: 1,
                }}
              >
                {badgeValue}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--muted)',
                  lineHeight: 1.25,
                  whiteSpace: 'pre-line',
                }}
              >
                {badgeLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
