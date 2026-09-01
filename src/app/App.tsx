import { ShopBanner } from './components/ShopBanner';
import { ShopLogo } from './components/ShopLogo';

const PALETTE = [
  { hex: '#FAF3E7', name: 'Warm Cream', role: 'Background' },
  { hex: '#3C332B', name: 'Espresso', role: 'Wordmark' },
  { hex: '#F2D9D2', name: 'Blush', role: 'Accent / Logo BG' },
  { hex: '#8FA98E', name: 'Sage', role: 'Divider / CTA' },
  { hex: '#6B5848', name: 'Warm Umber', role: 'Tagline' },
  { hex: '#C4A898', name: 'Dusty Rose', role: 'Ornament' },
];

export default function App() {
  return (
    <div
      style={{
        background: '#1A1310',
        minHeight: '100vh',
        fontFamily: "'Jost', 'Helvetica Neue', sans-serif",
        fontWeight: 300,
        padding: '48px 40px 72px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── HEADER ──────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <p
          style={{
            color: '#6B5848',
            fontSize: '10px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            margin: '0 0 10px',
          }}
        >
          Brand Concept Preview
        </p>
        <div
          style={{
            fontFamily: "'Pinyon Script', cursive",
            fontSize: '58px',
            color: '#E8D5C0',
            lineHeight: 1.1,
            marginBottom: '8px',
          }}
        >
          PaperlessHope
        </div>
        <p
          style={{
            color: '#5A4E44',
            fontSize: '11px',
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Digital Templates · Personal Milestones
        </p>
      </div>

      {/* ── DELIVERABLE 01 — BANNER ─────────────────────────── */}
      <section style={{ marginBottom: '56px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '16px',
            marginBottom: '14px',
          }}
        >
          <span
            style={{
              color: '#8FA98E',
              fontSize: '9px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            Deliverable 01
          </span>
          <span style={{ color: '#4A3E36', fontSize: '9px', letterSpacing: '1px' }}>
            Shop Banner · 3360 × 840 px
          </span>
        </div>

        <div
          style={{
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: '0 24px 72px rgba(0,0,0,0.55)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <ShopBanner />
        </div>

        <p
          style={{
            color: '#3D3530',
            fontSize: '10px',
            letterSpacing: '1px',
            marginTop: '10px',
          }}
        >
          Safe zone: center 60% · Safe for Etsy mobile crop · Pinyon Script wordmark with letterpress emboss ·
          Sage divider · Deckle paper edge · Birthday template phone mockup
        </p>
      </section>

      {/* ── DELIVERABLE 02 — LOGO ───────────────────────────── */}
      <section style={{ marginBottom: '56px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '16px',
            marginBottom: '14px',
          }}
        >
          <span
            style={{
              color: '#8FA98E',
              fontSize: '9px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            Deliverable 02
          </span>
          <span style={{ color: '#4A3E36', fontSize: '9px', letterSpacing: '1px' }}>
            Shop Icon / Logo Mark · 500 × 500 px
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '40px', flexWrap: 'wrap' }}>
          {/* Full preview */}
          <div>
            <p
              style={{
                color: '#4A3E36',
                fontSize: '9px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Full size · 500px
            </p>
            <div
              style={{
                width: '220px',
                height: '220px',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 12px 44px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <ShopLogo />
            </div>
          </div>

          {/* Square thumbnail */}
          <div>
            <p
              style={{
                color: '#4A3E36',
                fontSize: '9px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Thumbnail · 80px
            </p>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '6px',
                overflow: 'hidden',
                boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
              }}
            >
              <ShopLogo />
            </div>
          </div>

          {/* Circular crop — as Etsy shows it */}
          <div>
            <p
              style={{
                color: '#4A3E36',
                fontSize: '9px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Etsy circle crop · 48px
            </p>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
              }}
            >
              <ShopLogo />
            </div>
          </div>

          {/* On dark — e.g. browser tab */}
          <div>
            <p
              style={{
                color: '#4A3E36',
                fontSize: '9px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              On dark bg · 48px
            </p>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
                background: '#2A2318',
                padding: '4px',
                boxSizing: 'border-box',
              }}
            >
              <ShopLogo />
            </div>
          </div>
        </div>
      </section>

      {/* ── COLOUR PALETTE ──────────────────────────────────── */}
      <section>
        <p
          style={{
            color: '#8FA98E',
            fontSize: '9px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '14px',
          }}
        >
          Brand Palette
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {PALETTE.map(({ hex, name, role }) => (
            <div key={hex} style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '6px',
                  background: hex,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              />
              <div>
                <p style={{ color: '#C8B8A8', fontSize: '10px', margin: 0, letterSpacing: '0.5px' }}>
                  {name}
                </p>
                <p style={{ color: '#4A3E36', fontSize: '9px', margin: '1px 0 0', letterSpacing: '0.3px' }}>
                  {hex}
                </p>
                <p style={{ color: '#3A3028', fontSize: '8px', margin: '1px 0 0', letterSpacing: '0.5px' }}>
                  {role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
