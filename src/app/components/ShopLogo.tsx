export function ShopLogo() {
  return (
    <svg
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-label="PaperlessHope Shop Logo"
    >
      <defs>
        {/* Fine paper grain */}
        <filter id="l-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.86 0.80"
            numOctaves="4"
            seed="12"
            stitchTiles="stitch"
          />
        </filter>

        {/* Letterpress — monogram "P" */}
        <filter id="l-lp" x="-6%" y="-6%" width="112%" height="112%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b" />
          <feOffset dx="-2.5" dy="-2.5" in="b" result="bTL" />
          <feOffset dx="3" dy="3.5" in="b" result="bBR" />
          <feFlood floodColor="#FFF8EC" floodOpacity="0.9" result="hiC" />
          <feFlood floodColor="#130803" floodOpacity="0.22" result="shC" />
          <feComposite in="hiC" in2="bTL" operator="in" result="hi" />
          <feComposite in="shC" in2="bBR" operator="in" result="sh" />
          <feMerge>
            <feMergeNode in="sh" />
            <feMergeNode in="hi" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Letterpress — small text */}
        <filter id="l-lp-sm" x="-10%" y="-30%" width="120%" height="170%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="b" />
          <feOffset dx="-0.6" dy="-0.6" in="b" result="bTL" />
          <feOffset dx="0.8" dy="1" in="b" result="bBR" />
          <feFlood floodColor="#FFF8EC" floodOpacity="0.82" result="hiC" />
          <feFlood floodColor="#130803" floodOpacity="0.15" result="shC" />
          <feComposite in="hiC" in2="bTL" operator="in" result="hi" />
          <feComposite in="shC" in2="bBR" operator="in" result="sh" />
          <feMerge>
            <feMergeNode in="sh" />
            <feMergeNode in="hi" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Clip to safe zone circle */}
        <clipPath id="safe-circle">
          <circle cx="250" cy="250" r="240" />
        </clipPath>
      </defs>

      {/* ── BACKGROUND ─────────────────────────────────────── */}
      <rect width="500" height="500" fill="#F2D9D2" />

      {/* Paper grain */}
      <rect
        width="500"
        height="500"
        fill="#9E887A"
        filter="url(#l-grain)"
        style={{ mixBlendMode: 'multiply' as const }}
        opacity={0.058}
      />

      {/* ── OUTER RING — subtle border ──────────────────────── */}
      {/* Outer rule */}
      <circle cx="250" cy="250" r="232" fill="none" stroke="#C4A898" strokeWidth="0.8" opacity={0.4} />
      {/* Inner rule */}
      <circle cx="250" cy="250" r="225" fill="none" stroke="#C4A898" strokeWidth="0.4" opacity={0.25} />

      {/* ── MONOGRAM "P" ────────────────────────────────────── */}
      {/*
        Pinyon Script "P" — large, centered.
        Font has natural descenders so we position y slightly above
        center to account for the script's visual balance.
      */}
      <text
        x="250"
        y="300"
        fontFamily="'Pinyon Script', cursive"
        fontSize="300"
        fill="#3C332B"
        textAnchor="middle"
        filter="url(#l-lp)"
      >
        P
      </text>

      {/* ── SAGE DIVIDER + WORDMARK BENEATH ─────────────────── */}
      {/* Thin sage line */}
      <line x1="162" y1="360" x2="338" y2="360" stroke="#8FA98E" strokeWidth="1" opacity={0.55} />
      <circle cx="160" cy="360" r="2.5" fill="#8FA98E" opacity={0.45} />
      <circle cx="340" cy="360" r="2.5" fill="#8FA98E" opacity={0.45} />

      {/* Small wordmark beneath */}
      <text
        x="250"
        y="392"
        fontFamily="'Jost', 'Helvetica Neue', sans-serif"
        fontSize="18"
        fontWeight="300"
        fill="#6B5848"
        textAnchor="middle"
        letterSpacing="5"
        filter="url(#l-lp-sm)"
      >
        PAPERLESSHOPE
      </text>

      {/* Tiny tagline / descriptor */}
      <text
        x="250"
        y="416"
        fontFamily="'Jost', 'Helvetica Neue', sans-serif"
        fontSize="11"
        fontWeight="300"
        fill="#8FA98E"
        textAnchor="middle"
        letterSpacing="2.5"
        opacity={0.82}
      >
        digital templates
      </text>
    </svg>
  );
}
