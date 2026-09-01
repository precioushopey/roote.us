export function ShopBanner() {
  return (
    <svg
      viewBox="0 0 3360 840"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-label="PaperlessHope Etsy Shop Banner"
    >
      <defs>
        {/* Fine paper grain — fractal noise at ~5% multiply */}
        <filter id="b-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.84 0.79"
            numOctaves="4"
            seed="7"
            stitchTiles="stitch"
          />
        </filter>

        {/* Letterpress / emboss — large wordmark */}
        <filter id="lp-lg" x="-4%" y="-10%" width="108%" height="130%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="b" />
          <feOffset dx="-2" dy="-2" in="b" result="bTL" />
          <feOffset dx="2.5" dy="3" in="b" result="bBR" />
          <feFlood floodColor="#FFF8EC" floodOpacity="0.92" result="hiC" />
          <feFlood floodColor="#130803" floodOpacity="0.2" result="shC" />
          <feComposite in="hiC" in2="bTL" operator="in" result="hi" />
          <feComposite in="shC" in2="bBR" operator="in" result="sh" />
          <feMerge>
            <feMergeNode in="sh" />
            <feMergeNode in="hi" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Letterpress — small tagline */}
        <filter id="lp-sm" x="-8%" y="-25%" width="116%" height="160%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="b" />
          <feOffset dx="-0.7" dy="-0.7" in="b" result="bTL" />
          <feOffset dx="0.9" dy="1.1" in="b" result="bBR" />
          <feFlood floodColor="#FFF8EC" floodOpacity="0.85" result="hiC" />
          <feFlood floodColor="#130803" floodOpacity="0.16" result="shC" />
          <feComposite in="hiC" in2="bTL" operator="in" result="hi" />
          <feComposite in="shC" in2="bBR" operator="in" result="sh" />
          <feMerge>
            <feMergeNode in="sh" />
            <feMergeNode in="hi" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft drop shadow for phone */}
        <filter id="phone-sh" x="-20%" y="-8%" width="148%" height="124%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="16" result="blur" />
          <feOffset dx="0" dy="10" in="blur" result="off" />
          <feFlood floodColor="#120804" floodOpacity="0.38" result="col" />
          <feComposite in="col" in2="off" operator="in" result="cshadow" />
          <feMerge>
            <feMergeNode in="cshadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Phone screen clip */}
        <clipPath id="ph-clip">
          <rect x="2410" y="104" width="192" height="400" rx="14" />
        </clipPath>

        {/* Left vignette gradient */}
        <linearGradient id="vigL" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7A6244" stopOpacity="1" />
          <stop offset="100%" stopColor="#7A6244" stopOpacity="0" />
        </linearGradient>

        {/* Right vignette gradient */}
        <linearGradient id="vigR" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#7A6244" stopOpacity="1" />
          <stop offset="100%" stopColor="#7A6244" stopOpacity="0" />
        </linearGradient>

        {/* Top vignette gradient */}
        <linearGradient id="vigT" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7A6244" stopOpacity="1" />
          <stop offset="100%" stopColor="#7A6244" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── BACKGROUND ─────────────────────────────────────── */}
      <rect width="3360" height="840" fill="#FAF3E7" />

      {/* Paper grain overlay — multiply at ~6% */}
      <rect
        width="3360"
        height="840"
        fill="#A09282"
        filter="url(#b-grain)"
        style={{ mixBlendMode: 'multiply' as const }}
        opacity={0.062}
      />

      {/* Subtle warm edge vignettes */}
      <rect x="0" y="0" width="280" height="840" fill="url(#vigL)" opacity={0.09} />
      <rect x="3080" y="0" width="280" height="840" fill="url(#vigR)" opacity={0.09} />
      <rect x="0" y="0" width="3360" height="100" fill="url(#vigT)" opacity={0.07} />

      {/* ── DECKLE / TORN PAPER EDGE (bottom) ──────────────── */}
      {/* First layer — lighter, wider undulation */}
      <path
        d={
          'M 0 808 ' +
          'Q 60 801,120 810 Q 180 818,240 806 Q 300 795,360 808 ' +
          'Q 420 820,480 807 Q 540 795,600 808 Q 660 820,720 807 ' +
          'Q 780 795,840 809 Q 900 821,960 807 Q 1020 794,1080 808 ' +
          'Q 1140 821,1200 807 Q 1260 794,1320 808 Q 1380 821,1440 807 ' +
          'Q 1500 795,1560 808 Q 1620 820,1680 807 Q 1740 795,1800 808 ' +
          'Q 1860 820,1920 806 Q 1980 793,2040 807 Q 2100 820,2160 806 ' +
          'Q 2220 793,2280 807 Q 2340 820,2400 806 Q 2460 793,2520 807 ' +
          'Q 2580 820,2640 806 Q 2700 793,2760 807 Q 2820 820,2880 806 ' +
          'Q 2940 793,3000 807 Q 3060 820,3120 806 Q 3180 793,3240 807 ' +
          'Q 3300 819,3360 810 ' +
          'L 3360 840 L 0 840 Z'
        }
        fill="#EDD8BC"
        opacity={0.52}
      />
      {/* Second layer — slightly higher, smaller undulation */}
      <path
        d={
          'M 0 820 ' +
          'Q 84 814,168 823 Q 252 831,336 819 Q 420 808,504 821 ' +
          'Q 588 833,672 820 Q 756 808,840 821 Q 924 833,1008 820 ' +
          'Q 1092 808,1176 821 Q 1260 833,1344 820 Q 1428 808,1512 821 ' +
          'Q 1596 833,1680 820 Q 1764 808,1848 821 Q 1932 833,2016 820 ' +
          'Q 2100 808,2184 821 Q 2268 833,2352 820 Q 2436 808,2520 821 ' +
          'Q 2604 833,2688 820 Q 2772 808,2856 821 Q 2940 833,3024 820 ' +
          'Q 3108 808,3192 821 Q 3276 832,3360 822 ' +
          'L 3360 840 L 0 840 Z'
        }
        fill="#E5CCAA"
        opacity={0.38}
      />

      {/* ── MAIN TEXT BLOCK ─────────────────────────────────── */}

      {/* "PaperlessHope" — Pinyon Script with letterpress */}
      <text
        x="1340"
        y="400"
        fontFamily="'Pinyon Script', cursive"
        fontSize="182"
        fill="#3C332B"
        textAnchor="middle"
        filter="url(#lp-lg)"
      >
        PaperlessHope
      </text>

      {/* Sage divider line with terminal dots */}
      <circle cx="893" cy="452" r="3.5" fill="#8FA98E" opacity={0.55} />
      <line x1="900" y1="452" x2="1780" y2="452" stroke="#8FA98E" strokeWidth="1.4" opacity={0.6} />
      <circle cx="1787" cy="452" r="3.5" fill="#8FA98E" opacity={0.55} />

      {/* Tagline */}
      <text
        x="1340"
        y="510"
        fontFamily="'Jost', 'Helvetica Neue', sans-serif"
        fontSize="35"
        fontWeight="300"
        fill="#6B5848"
        textAnchor="middle"
        letterSpacing="2.2"
        filter="url(#lp-sm)"
      >
        Paperless celebrations for life&apos;s little milestones
      </text>

      {/* ── PHONE MOCKUP ────────────────────────────────────── */}
      <g filter="url(#phone-sh)">
        {/* Device shell */}
        <rect x="2392" y="68" width="228" height="462" rx="30" fill="#2C2118" />
        {/* Subtle left-edge shine */}
        <rect x="2392" y="96" width="4" height="406" rx="2" fill="#504030" opacity={0.55} />
        {/* Inner bezel */}
        <rect x="2402" y="80" width="208" height="438" rx="25" fill="#1C1410" />
        {/* Screen surface */}
        <rect x="2410" y="104" width="192" height="400" rx="14" fill="#FAF3E7" />

        {/* ── Screen content ── */}
        <g clipPath="url(#ph-clip)">
          {/* Blush header band */}
          <rect x="2410" y="104" width="192" height="88" fill="#F2D9D2" />

          {/* Template wordmark on screen */}
          <text
            x="2506"
            y="154"
            fontFamily="'Pinyon Script', cursive"
            fontSize="26"
            fill="#3C332B"
            textAnchor="middle"
          >
            Happy Birthday
          </text>

          {/* Tiny sage dot accent */}
          <circle cx="2506" cy="171" r="2" fill="#8FA98E" opacity={0.75} />

          {/* Sage divider on screen */}
          <line x1="2440" y1="178" x2="2572" y2="178" stroke="#8FA98E" strokeWidth="0.75" opacity={0.6} />

          {/* Cream body area */}
          <rect x="2410" y="192" width="192" height="200" fill="#FAF3E7" />

          {/* Blush photo placeholder */}
          <rect x="2440" y="200" width="132" height="88" rx="6" fill="#F2D9D2" opacity={0.78} />
          {/* Ornament in photo area */}
          <text x="2506" y="252" fontFamily="Georgia, serif" fontSize="30" fill="#C4A898" textAnchor="middle" opacity={0.68}>
            ✦
          </text>

          {/* Simulated text lines */}
          <rect x="2440" y="302" width="132" height="7" rx="3.5" fill="#C4B0A0" opacity={0.48} />
          <rect x="2450" y="316" width="112" height="7" rx="3.5" fill="#C4B0A0" opacity={0.38} />
          <rect x="2462" y="330" width="88" height="7" rx="3.5" fill="#C4B0A0" opacity={0.3} />

          {/* Sage bottom band */}
          <rect x="2410" y="392" width="192" height="112" fill="#B5C9B4" opacity={0.28} />

          {/* CTA button */}
          <rect x="2456" y="405" width="100" height="28" rx="14" fill="#8FA98E" opacity={0.9} />
          <text
            x="2506"
            y="424"
            fontFamily="'Jost', sans-serif"
            fontSize="10"
            fontWeight="400"
            fill="white"
            textAnchor="middle"
            letterSpacing="1.8"
            opacity={0.95}
          >
            VIEW TEMPLATE
          </text>

          {/* Date */}
          <text
            x="2506"
            y="455"
            fontFamily="'Jost', sans-serif"
            fontSize="9"
            fontWeight="300"
            fill="#8FA98E"
            textAnchor="middle"
            letterSpacing="1.2"
            opacity={0.78}
          >
            July 2026
          </text>
        </g>

        {/* Dynamic island */}
        <rect x="2472" y="101" width="68" height="14" rx="7" fill="#1C1410" />

        {/* Home indicator */}
        <rect x="2477" y="490" width="58" height="5" rx="2.5" fill="#3C332B" opacity={0.18} />
      </g>

      {/* ── SUBTLE PAPER CHAIN LINES (left-side detail) ─────── */}
      {/* Very faint horizontal chain lines referencing laid paper texture */}
      {[160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640].map((y) => (
        <line
          key={y}
          x1="672"
          y1={y}
          x2="2280"
          y2={y}
          stroke="#C8B89A"
          strokeWidth="0.5"
          opacity={0.12}
        />
      ))}
    </svg>
  );
}
