// Static illustrations (ported from the demo). Pure strings: no user input goes in here.

export const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="27" rx="13" ry="3" fill="var(--plate)"/><path d="M5 14v11a11 3 0 0 0 22 0V14z" fill="var(--sponge)"/><path d="M5 19a11 3 0 0 0 22 0v2a11 3 0 0 1-22 0z" fill="var(--cream)"/><path d="M5 14v3q2 3 4 0q2 4 4 0q3 4 5 0q2 3 4 0q3 4 5 0v-3z" fill="var(--cream)"/><ellipse cx="16" cy="14" rx="11" ry="3" fill="var(--cream)"/><path d="M16 4c3 0 4 3 3 5.5c-.6 1.5-2 2.5-3 2.5s-2.4-1-3-2.5C12 7 13 4 16 4z" fill="var(--pink)"/><path d="M14 4.5l2 1.5l2-1.5" stroke="var(--mint)" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;

export const ICON_SOUND_ON = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
export const ICON_SOUND_OFF = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

export function artStrawberry(x: number, y: number, s = 1, rot = 0, cls = '', delay = 0): string {
  return `<g class="${cls}" style="animation-delay:${delay}s"><g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">
    <path d="M0,14 C-9,8 -11,-2 -8,-6 C-5,-10 5,-10 8,-6 C11,-2 9,8 0,14Z" fill="url(#gBerry)"/>
    <g fill="#FFE7A8" opacity=".9"><ellipse cx="-4" cy="0" rx=".9" ry="1.3"/><ellipse cx="3" cy="-1" rx=".9" ry="1.3"/><ellipse cx="-1" cy="4" rx=".9" ry="1.3"/><ellipse cx="4" cy="5" rx=".9" ry="1.3"/><ellipse cx="-4" cy="7" rx=".9" ry="1.3"/><ellipse cx="0" cy="9.5" rx=".8" ry="1.1"/></g>
    <path d="M0,-7 L-7,-10 L-3,-6 L-8,-4 L-2,-5 L0,-1 L2,-5 L8,-4 L3,-6 L7,-10Z" fill="#5E9B3A"/>
    <ellipse cx="-4" cy="-3" rx="2.2" ry="3.4" fill="#fff" opacity=".35" transform="rotate(20 -4 -3)"/></g></g>`;
}

export function artBlueberry(x: number, y: number, s = 1, cls = '', delay = 0): string {
  return `<g class="${cls}" style="animation-delay:${delay}s"><g transform="translate(${x},${y}) scale(${s})">
    <circle r="6" fill="url(#gBlue)"/><path d="M-2,-4.5 L0,-3 L2,-4.5 L1.2,-2.2 L-1.2,-2.2Z" fill="#2A2F5E"/><circle cx="-2.2" cy="-1.4" r="1.4" fill="#fff" opacity=".35"/></g></g>`;
}

function artRosette(x: number, y: number, s = 1, delay = 0): string {
  return `<g class="h-rose" style="animation-delay:${delay}s"><g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="0" cy="2" rx="8" ry="4" fill="#E9DCD3"/><path d="M-7,1 C-8,-5 -2,-8 0,-8 C3,-8 8,-5 7,1 C5,4 -5,4 -7,1Z" fill="var(--cream)"/>
    <path d="M-4,-1 C-3,-5 3,-5 3,-2 C3,0 -1,1 -1,-2" stroke="#E6D6CC" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M0,-8 L1,-11" stroke="#E6D6CC" stroke-width="1.2" stroke-linecap="round"/></g></g>`;
}

export function artDefs(): string {
  return `<defs>
    <linearGradient id="gSponge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4D59C"/><stop offset="1" stop-color="#E0AE68"/></linearGradient>
    <linearGradient id="gSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".78" stop-color="#000" stop-opacity=".04"/><stop offset="1" stop-color="#6B3A1E" stop-opacity=".28"/></linearGradient>
    <linearGradient id="gCream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F7EDE6"/></linearGradient>
    <radialGradient id="gBerry" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FF7A8C"/><stop offset=".55" stop-color="#E23349"/><stop offset="1" stop-color="#A9172E"/></radialGradient>
    <radialGradient id="gBlue" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#7F8BE0"/><stop offset=".6" stop-color="#3B4595"/><stop offset="1" stop-color="#232A63"/></radialGradient>
    <linearGradient id="gMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E3E5EA"/><stop offset=".45" stop-color="#B9BEC8"/><stop offset="1" stop-color="#8E94A1"/></linearGradient>
    <radialGradient id="gGlow" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="#FFD37A"/><stop offset=".5" stop-color="#FF8A3D"/><stop offset="1" stop-color="#7A2A14"/></radialGradient>
    <radialGradient id="gHalo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="var(--surface)" stop-opacity=".9"/><stop offset="1" stop-color="var(--surface)" stop-opacity="0"/></radialGradient>
    <clipPath id="cBelt"><rect x="12" y="238" width="336" height="10" rx="5"/></clipPath>
  </defs>`;
}

/** The landing page's self-building cake. Animated by toggling s-* classes on #heroSvg. */
export function heroSVG(): string {
  const cx = 180, L = 110, R = 250, top = 166, bot = 234;
  let drips = `M${L},${top} L${L},${top + 8}`;
  const dd = [12, 20, 10, 24, 14, 9, 19, 13, 22, 11];
  const seg = (R - L) / dd.length;
  dd.forEach((d, j) => {
    const x0 = L + j * seg, m = x0 + seg / 2, x1 = x0 + seg;
    drips += ` C${x0 + 2},${top + 8} ${m - 5},${top + 8 + d} ${m},${top + 8 + d} C${m + 5},${top + 8 + d} ${x1 - 2},${top + 8} ${x1},${top + 8}`;
  });
  drips += ` L${R},${top} Z`;
  const roses: [number, number][] = [];
  const n = 7;
  for (let k = 0; k < n; k++) { const t = Math.PI * (1.05 + k * (0.9 / (n - 1))); roses.push([cx + Math.cos(t) * 62, top + Math.sin(t) * 8 - 1]); }
  for (let k = 0; k < n; k++) { const t = Math.PI * (0.05 + k * (0.9 / (n - 1))); roses.push([cx + Math.cos(t) * 62, top + Math.sin(t) * 8 + 1]); }
  const stripes = Array.from({ length: 22 }, (_, i) => `<rect x="${i * 20 - 40}" y="238" width="10" height="10" fill="var(--belt-2)" transform="skewX(-20)"/>`).join('');
  const rollers = Array.from({ length: 9 }, (_, i) => `<circle cx="${30 + i * 38}" cy="252" r="5" fill="#6A4943"/><circle cx="${30 + i * 38}" cy="252" r="1.8" fill="#2A1714"/>`).join('');
  return `<svg id="heroSvg" viewBox="0 0 360 300" role="img" aria-label="A cake being built step by step: pan, batter, oven, cream, strawberries and a candle">
    ${artDefs()}
    <rect width="360" height="300" fill="var(--wall)"/>
    <circle cx="180" cy="160" r="150" fill="url(#gHalo)"/>
    <g opacity=".7"><rect x="262" y="74" width="80" height="5" rx="2.5" fill="var(--tile)"/><rect x="272" y="50" width="16" height="24" rx="5" fill="var(--surface)"/><rect x="274" y="44" width="12" height="8" rx="3" fill="var(--pink)" opacity=".7"/>
      <rect x="296" y="56" width="14" height="18" rx="4" fill="var(--surface)"/><path d="M320 74 v-22 m-4 0 h8" stroke="var(--muted)" stroke-width="2.5" stroke-linecap="round" opacity=".6"/></g>
    <g class="h-all">
      <rect x="8" y="236" width="344" height="30" rx="15" fill="var(--belt)"/>
      <g clip-path="url(#cBelt)"><rect x="12" y="238" width="336" height="10" fill="#4A2E29"/><g class="h-stripes">${stripes}</g></g>
      ${rollers}
      <ellipse class="h-plate" cx="${cx}" cy="237" rx="92" ry="10" fill="var(--plate-top)" stroke="var(--plate)" stroke-width="2"/>
      <g class="h-pan"><path d="M104,198 V232 A76,9 0 0 0 256,232 V198 Z" fill="url(#gMetal)"/><ellipse cx="${cx}" cy="198" rx="76" ry="9" fill="#D5D8DF" stroke="#9CA2AE" stroke-width="1.5"/><ellipse cx="${cx}" cy="199" rx="70" ry="6.5" fill="#6C7280"/></g>
      <ellipse class="h-batter" cx="${cx}" cy="199" rx="70" ry="6.5" fill="#F2D08F"/>
      <g class="h-nozzle"><path d="M156,-4 L204,-4 L188,40 L172,40 Z" fill="var(--pink)"/><rect x="172" y="38" width="16" height="8" rx="3" fill="#C9CDD5"/></g>
      <rect class="h-stream" x="176" y="46" width="8" height="152" rx="4" fill="#F2D08F"/>
      <g class="h-cake">
        <path d="M${L},${top} V${bot} A70,9 0 0 0 ${R},${bot} V${top} Z" fill="url(#gSponge)"/>
        <path d="M${L},196 A70,9 0 0 0 ${R},196 V204 A70,9 0 0 1 ${L},204 Z" fill="var(--cream)"/>
        <g fill="#E23349" opacity=".9"><ellipse cx="128" cy="205" rx="6" ry="2.6"/><ellipse cx="158" cy="208" rx="6" ry="2.6"/><ellipse cx="192" cy="208" rx="6" ry="2.6"/><ellipse cx="226" cy="205" rx="6" ry="2.6"/></g>
        <g fill="#C98E4A" opacity=".35"><circle cx="124" cy="180" r="1.2"/><circle cx="150" cy="186" r="1.2"/><circle cx="178" cy="182" r="1.2"/><circle cx="210" cy="186" r="1.2"/><circle cx="236" cy="180" r="1.2"/><circle cx="136" cy="220" r="1.2"/><circle cx="170" cy="224" r="1.2"/><circle cx="204" cy="222" r="1.2"/><circle cx="232" cy="218" r="1.2"/></g>
        <path d="M${L},${top} V${bot} A70,9 0 0 0 ${R},${bot} V${top} Z" fill="url(#gSide)"/>
        <ellipse cx="${cx}" cy="${top}" rx="70" ry="9" fill="#F7DDAE"/>
      </g>
      <g class="h-frost"><path d="${drips}" fill="url(#gCream)"/><ellipse cx="${cx}" cy="${top}" rx="71" ry="10" fill="var(--cream)"/><ellipse cx="160" cy="${top - 3}" rx="30" ry="3" fill="#fff" opacity=".8"/></g>
      ${roses.slice(0, n).map((r, k) => artRosette(r[0], r[1], 0.9, k * 0.05)).join('')}
      ${artStrawberry(162, 158, 1.15, -12, 'h-drop', 0)}${artStrawberry(196, 160, 1.15, 14, 'h-drop', 0.12)}${artStrawberry(180, 150, 1.2, 0, 'h-drop', 0.24)}
      ${artBlueberry(146, 166, 1, 'h-drop', 0.34)}${artBlueberry(214, 167, 1, 'h-drop', 0.4)}${artBlueberry(206, 156, 0.9, 'h-drop', 0.46)}
      <g class="h-candle"><rect x="186" y="118" width="6" height="36" rx="2" fill="#FFF"/><path d="M186,124 l6,-4 M186,132 l6,-4 M186,140 l6,-4 M186,148 l6,-4" stroke="var(--pink)" stroke-width="2"/>
        <path class="h-flame" d="M189,103 C193,108 194,112 189,116 C184,112 185,108 189,103Z" fill="#FFB53D"/><path class="h-flame" d="M189,108 C191,111 191,113 189,115 C187,113 187,111 189,108Z" fill="#FFF2B8"/></g>
      ${roses.slice(n).map((r, k) => artRosette(r[0], r[1], 1, 0.3 + k * 0.05)).join('')}
      <text class="h-score" x="180" y="92" text-anchor="middle" font-family="var(--pixel)" font-size="17" fill="var(--pink)" stroke="var(--surface)" stroke-width="4" paint-order="stroke">PERFECT +100</text>
      <g class="h-oven"><rect x="84" y="92" width="192" height="150" rx="20" fill="#F7EEEA" stroke="#E4D2CB" stroke-width="2"/>
        <rect x="150" y="84" width="60" height="12" rx="6" fill="#E4D2CB"/>
        <circle cx="108" cy="110" r="5" fill="#D8C4BC"/><circle cx="124" cy="110" r="5" fill="#D8C4BC"/>
        <text x="252" y="115" text-anchor="end" font-family="var(--pixel)" font-size="11" fill="var(--pink)">0:03</text>
        <rect x="104" y="124" width="152" height="96" rx="14" fill="#2B1A18"/><rect class="h-glow" x="108" y="128" width="144" height="88" rx="11" fill="url(#gGlow)"/>
        <rect x="118" y="130" width="40" height="5" rx="2.5" fill="#fff" opacity=".25"/></g>
    </g></svg>`;
}

/** [ms from start, class to add, HUD label (null = keep), score]. */
export const HERO_STEPS: [number, string, string | null, number][] = [
  [0, 's-pan', 'Pick a pan', 0], [1000, 's-pour', 'Pour the batter', 10], [2400, 's-oven', 'Bake it', 20],
  [3800, 's-baked', null, 40], [4300, 's-cream', 'Spread the cream', 55], [5000, 's-rose', null, 65],
  [5500, 's-berry', 'Add toppings', 80], [6300, 's-candle', null, 90], [6800, 's-score', 'Perfect cake', 100], [7500, 's-tag', null, 100],
];

export const STEP_ICONS = [
  `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="3" y="36" width="42" height="7" rx="3.5" fill="var(--belt)"/><path d="M12 22v12a12 3 0 0 0 24 0V22z" fill="var(--sponge)"/><path d="M12 22q3 5 6 0q3 6 6 0q3 6 6 0q3 5 6 0" fill="var(--cream)"/><ellipse cx="24" cy="22" rx="12" ry="3" fill="var(--cream)"/><path d="M24 11c3 0 4 3 3 5c-.6 1.3-2 2-3 2s-2.4-.7-3-2c-1-2 0-5 3-5z" fill="#E23349"/></svg>`,
  `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="8" width="36" height="32" rx="7" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/><rect x="11" y="17" width="26" height="18" rx="4" fill="#2B1A18"/><rect x="13" y="19" width="22" height="14" rx="3" fill="url(#gGlowIc)"/><circle cx="13" cy="12.5" r="1.8" fill="var(--muted)"/><circle cx="19" cy="12.5" r="1.8" fill="var(--muted)"/><defs><radialGradient id="gGlowIc" cx=".5" cy=".8" r=".8"><stop offset="0" stop-color="#FFD37A"/><stop offset="1" stop-color="#FF7A3D"/></radialGradient></defs></svg>`,
  `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="12" width="18" height="18" rx="3" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/><rect x="26" y="12" width="18" height="18" rx="3" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/><path d="M8 22v4a5 1.5 0 0 0 10 0v-4z" fill="var(--pink)" opacity=".75"/><ellipse cx="13" cy="22" rx="5" ry="1.5" fill="var(--cream)"/><path d="M30 22v4a5 1.5 0 0 0 10 0v-4z" fill="var(--sponge)"/><ellipse cx="35" cy="22" rx="5" ry="1.5" fill="var(--cream)"/><path d="M35 17l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L32 19.3l2-.3z" fill="var(--butter)"/><path d="M13 36h22" stroke="var(--muted)" stroke-width="2" stroke-dasharray="2 3" stroke-linecap="round"/></svg>`,
];

export const LOCK_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2.2" fill="none"/></svg>`;
