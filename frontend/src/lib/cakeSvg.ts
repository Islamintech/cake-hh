// Draws a cake design as an SVG string (ported from the demo). All text is escaped.
import { esc } from './format';
import type { CatalogIndex } from './rules';
import { toppingDefs, toppingSVG } from './toppingArt';
import type { CakeDesign, Layer } from './types';

export type Anim =
  | { type: 'pan' | 'size' }
  | { type: 'pour' | 'rise' | 'frost' | 'tier'; layer: number }
  | { type: 'top'; layer: number; k: number };

export interface CakeSvgOptions {
  anim?: Anim | null;
  /** Toppings get data-act="rmTop" so a tap can remove them. */
  interactive?: boolean;
  /** Typewriter effect: show only the first n letters of the lettering. */
  letterShown?: number | null;
  label?: string;
  /** Tighter viewBox for thumbnails. */
  crop?: boolean;
  /** Unique id suffix for gradients (several cakes can be on one page). */
  uid: string;
}

/** Lighten (amt > 0) or darken (amt < 0) a #rrggbb color. */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

interface Tier { bodySvg: string; topSvg: (c: string) => string; svg: string; tx: number; ty: number; rx: number; ry: number; L: number; R: number; yt: number }

function tierSVG(shape: string, cx: number, yb: number, h: number, w: number, body: string, top: string, uid: string, shadeOn = true): Tier {
  const yt = yb - h, ry = Math.max(9, w * 0.1);
  const sh = shadeOn ? `fill="url(#sh${uid})"` : 'fill="none"';
  if (shape === 'square') {
    const L = cx - w / 2, R = cx + w / 2 - 16, d = ry * 1.6;
    const bodySvg = `<rect x="${L}" y="${yt}" width="${R - L}" height="${h}" fill="${body}"/>
      <polygon points="${R},${yt} ${R + 16},${yt - d} ${R + 16},${yb - d} ${R},${yb}" fill="${shade(body, -0.22)}"/>
      <rect x="${L}" y="${yt}" width="${R - L}" height="${h}" ${sh}/>`;
    const topSvg = (c: string) => `<polygon points="${L},${yt} ${L + 16},${yt - d} ${R + 16},${yt - d} ${R},${yt}" fill="${c}"/>`;
    return { bodySvg, topSvg, svg: bodySvg + topSvg(top), tx: cx, ty: yt - d / 2, rx: (w - 32) / 2, ry: d / 2, L, R, yt };
  }
  const bw = shape === 'heart' ? w * 0.9 : w;
  const L = cx - bw / 2, R = cx + bw / 2, rx = bw / 2;
  const topSvg = (c: string) => {
    if (shape !== 'heart') return `<ellipse cx="${cx}" cy="${yt}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
    const hw = w * 0.62, hy = ry * 1.9;
    return `<ellipse cx="${cx}" cy="${yt}" rx="${rx}" ry="${ry}" fill="${shade(c, -0.06)}"/>
      <path d="M${cx},${yt + hy * 0.55} C${cx - hw},${yt - hy * 0.1} ${cx - hw * 0.5},${yt - hy * 1.05} ${cx},${yt - hy * 0.35} C${cx + hw * 0.5},${yt - hy * 1.05} ${cx + hw},${yt - hy * 0.1} ${cx},${yt + hy * 0.55} Z" fill="${c}" stroke="${shade(c, -0.12)}" stroke-width="1.5"/>`;
  };
  const bodySvg = `<path d="M${L},${yt} V${yb} A${rx},${ry} 0 0 0 ${R},${yb} V${yt} Z" fill="${body}"/>
    <path d="M${L},${yt} V${yb} A${rx},${ry} 0 0 0 ${R},${yb} V${yt} Z" ${sh}/>`;
  return { bodySvg, topSvg, svg: bodySvg + topSvg(top), tx: cx, ty: yt, rx, ry, L, R, yt };
}

/** Small deterministic PRNG, so drips and textures stay the same on every render. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n1 = (v: number) => +v.toFixed(1);

/** Lighting, texture and shadow definitions shared by every tier of one cake. */
function tierDefs(uid: string): string {
  return `
    <linearGradient id="cyl${uid}" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".30"/><stop offset=".12" stop-color="#fff" stop-opacity=".06"/>
      <stop offset=".3" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".86" stop-color="#000" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity=".42"/>
    </linearGradient>
    <radialGradient id="topHi${uid}" cx=".36" cy=".3" r=".8">
      <stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".45" stop-color="#fff" stop-opacity=".06"/>
      <stop offset="1" stop-color="#000" stop-opacity=".16"/>
    </radialGradient>
    <radialGradient id="rosHi${uid}" cx=".36" cy=".3" r=".75">
      <stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".22"/>
    </radialGradient>
    <linearGradient id="plate${uid}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="var(--plate-top)"/><stop offset="1" stop-color="var(--plate)"/>
    </linearGradient>
    <filter id="crumb${uid}" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="4" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3.2 0 0 0 1.62" result="m"/>
      <feComposite in="SourceGraphic" in2="m" operator="in"/>
    </filter>
    <filter id="pores${uid}" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="11" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.4 0 0 0 -2" result="m"/>
      <feComposite in="SourceGraphic" in2="m" operator="in"/>
    </filter>
    <filter id="scrape${uid}" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency=".07 .02" numOctaves="4" seed="7" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.2 0 0 0 -1.1" result="m"/>
      <feComposite in="SourceGraphic" in2="m" operator="in"/>
    </filter>
    <filter id="cream${uid}" x="-4%" y="-8%" width="108%" height="116%">
      <feTurbulence type="fractalNoise" baseFrequency=".035 .09" numOctaves="3" seed="8" result="n"/>
      <feDiffuseLighting in="n" surfaceScale="2.4" lighting-color="#fff" result="l"><feDistantLight azimuth="225" elevation="60"/></feDiffuseLighting>
      <feBlend in="SourceGraphic" in2="l" mode="multiply" result="b"/>
      <feComponentTransfer in="b" result="c"><feFuncR type="linear" slope="1.16"/><feFuncG type="linear" slope="1.16"/><feFuncB type="linear" slope="1.16"/></feComponentTransfer>
      <feComposite in="c" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="soft${uid}" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="soft1${uid}" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="1.2"/></filter>`;
}

interface TierGeo {
  L: number; R: number; yt: number; yb: number; rx: number; ry: number;
  /** Where toppings go: centre and half-axes of the top surface. */
  tx: number; ty: number; trx: number; try: number;
  /** Front face outline(s) of the tier, without fill. */
  clip: string;
  body: (fill: string) => string;
  top: (fill: string, extra?: string) => string;
  /** y of the front top edge at x. */
  edge: (x: number) => number;
  /** Path segment that closes an edge-following outline from R back to L along the top edge. */
  closeBack: string;
  /** Points along the top rim; `back` ones are hidden behind toppings. */
  rim: (n: number) => { x: number; y: number; back: boolean }[];
}

function tierGeo(shape: string, cx: number, yb: number, h: number, w: number): TierGeo {
  const yt = yb - h, ry = Math.max(9, w * 0.1);
  if (shape === 'square') {
    const L = cx - w / 2, R = cx + w / 2 - 16, d = ry * 1.6;
    const front = `M${L},${yt} H${R} V${yb} H${L} Z`;
    const side = `M${R},${yt} L${R + 16},${yt - d} V${yb - d} L${R},${yb} Z`;
    return {
      L, R, yt, yb, rx: (R - L) / 2, ry,
      tx: cx, ty: yt - d / 2, trx: (w - 32) / 2, try: d / 2,
      clip: `<path d="${front}"/><path d="${side}"/>`,
      body: (c) => `<path d="${front}" fill="${c}"/><path d="${side}" fill="${shade(c, -0.25)}"/>`,
      top: (c, extra = '') => `<path d="M${L},${yt} L${L + 16},${yt - d} H${R + 16} L${R},${yt} Z" fill="${c}" ${extra}/>`,
      edge: () => yt,
      closeBack: `H${L} Z`,
      rim: (n) => {
        const pts: { x: number; y: number; back: boolean }[] = [];
        const m = Math.max(3, Math.round(n / 2));
        for (let k = 0; k <= m; k++) pts.push({ x: L + 16 + ((R - L) * k) / m, y: yt - d + 2, back: true });
        for (let k = 0; k <= m; k++) pts.push({ x: L + 3 + ((R - L - 6) * k) / m, y: yt + 1, back: false });
        return pts;
      },
    };
  }
  const bw = shape === 'heart' ? w * 0.9 : w;
  const L = cx - bw / 2, R = cx + bw / 2, rx = bw / 2;
  const front = `M${L},${yt} V${yb} A${rx},${ry} 0 0 0 ${R},${yb} V${yt} Z`;
  const heart = (c: string, extra: string) => {
    const hw = w * 0.62, hy = ry * 1.9;
    return `<path d="M${cx},${yt + hy * 0.55} C${cx - hw},${yt - hy * 0.1} ${cx - hw * 0.5},${yt - hy * 1.05} ${cx},${yt - hy * 0.35} C${cx + hw * 0.5},${yt - hy * 1.05} ${cx + hw},${yt - hy * 0.1} ${cx},${yt + hy * 0.55} Z" fill="${c}" ${extra}/>`;
  };
  return {
    L, R, yt, yb, rx, ry, tx: cx, ty: yt, trx: rx, try: ry,
    clip: `<path d="${front}"/>`,
    body: (c) => `<path d="${front}" fill="${c}"/>`,
    top: (c, extra = '') => `<ellipse cx="${cx}" cy="${yt}" rx="${rx}" ry="${ry}" fill="${c}" ${extra}/>${shape === 'heart' ? heart(c, extra) : ''}`,
    edge: (x) => yt + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)),
    closeBack: `A${rx},${ry} 0 0 1 ${L},${yt} Z`,
    rim: (n) => Array.from({ length: n }, (_, k) => {
      const a = (k / n) * Math.PI * 2 + 0.12;
      return { x: cx + Math.cos(a) * rx * 0.9, y: yt + Math.sin(a) * ry * 0.86, back: Math.sin(a) < 0 };
    }),
  };
}

/**
 * The frosting's front edge: follows the top edge down by `band`, with organic drips
 * (random length, width and a rounded drop at the end) when `drips` is set.
 */
function frostEdge(g: TierGeo, band: number, drips: boolean, maxLen: number, rand: () => number): { d: string; shines: string } {
  const { L, R, edge } = g;
  const cx = (L + R) / 2, half = (R - L) / 2;
  const list: { x: number; w: number; len: number }[] = [];
  if (drips) {
    const n = Math.round((R - L) / 19);
    for (let k = 0; k < n; k++) {
      const x = L + ((k + 0.5) / n) * (R - L) + (rand() - 0.5) * 6;
      const t = Math.abs(x - cx) / half;
      if (t > 0.9) continue;
      const falloff = Math.sqrt(1 - t * t);
      list.push({ x, w: 6 + rand() * 6, len: (6 + rand() ** 1.3 * maxLen) * (0.45 + 0.55 * falloff) });
    }
  }
  const y = (x: number) => edge(x) + band;
  let d = `M${n1(L)},${n1(edge(L))} L${n1(L)},${n1(y(L))}`;
  let shines = '';
  let x = L;
  const walk = (to: number) => {
    for (x += 2.5; x < to; x += 2.5) d += ` L${n1(x)},${n1(y(x))}`;
    x = to;
    d += ` L${n1(to)},${n1(y(to))}`;
  };
  for (const dr of list) {
    const x0 = dr.x - dr.w / 2, x1 = dr.x + dr.w / 2;
    if (x0 <= x) continue;
    walk(x0);
    const y0 = y(x0), end = y0 + dr.len, r = dr.w * 0.5;
    d += ` C${n1(x0 + dr.w * 0.12)},${n1(y0 + dr.len * 0.45)} ${n1(x0 + dr.w * 0.1)},${n1(end - r * 1.1)} ${n1(x0 + dr.w * 0.04)},${n1(end - r * 0.5)}`;
    d += ` A${n1(r)},${n1(r)} 0 1 0 ${n1(x1 - dr.w * 0.04)},${n1(end - r * 0.5)}`;
    d += ` C${n1(x1 - dr.w * 0.1)},${n1(end - r * 1.1)} ${n1(x1 - dr.w * 0.12)},${n1(y0 + dr.len * 0.45)} ${n1(x1)},${n1(y(x1))}`;
    x = x1;
    shines += `<path d="M${n1(x0 + dr.w * 0.3)},${n1(y0 + 2)} L${n1(x0 + dr.w * 0.26)},${n1(end - r * 0.6)}" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".32"/>`;
  }
  walk(R);
  d += ` L${n1(R)},${n1(edge(R))} ${g.closeBack}`;
  return { d, shines };
}

/** A piped rosette of cream at (x, y). */
function rosette(x: number, y: number, r: number, c: string, uid: string, cls: string, delay: number): string {
  const style = cls ? ` style="animation-delay:${delay.toFixed(2)}s"` : '';
  return `<g transform="translate(${n1(x)} ${n1(y)})"><g class="${cls}"${style}>
    <ellipse cx="${n1(r * 0.15)}" cy="${n1(r * 0.55)}" rx="${n1(r * 1.1)}" ry="${n1(r * 0.42)}" fill="#1E0F08" opacity=".2" filter="url(#soft1${uid})"/>
    <circle r="${n1(r)}" fill="${c}"/><circle r="${n1(r)}" fill="url(#rosHi${uid})"/>
    <path d="M${n1(-r * 0.62)},${n1(r * 0.1)} A${n1(r * 0.62)},${n1(r * 0.56)} 0 1 1 ${n1(r * 0.3)},${n1(-r * 0.5)} M${n1(r * 0.42)},${n1(-r * 0.05)} A${n1(r * 0.34)},${n1(r * 0.3)} 0 1 1 ${n1(-r * 0.1)},${n1(-r * 0.2)}"
      stroke="${shade(c, -0.16)}" stroke-width="${n1(r * 0.12)}" fill="none" stroke-linecap="round" opacity=".5"/></g></g>`;
}

interface BakedParts { back: string; front: string; geo: TierGeo }

/**
 * A baked tier drawn like the real thing: lit like a cylinder, crumb texture, and when frosted a
 * semi-naked finish (thin scraped cream over the sponge, visible cream fillings), cream on top with
 * relief, then drips (ganache and fruit creams) or a piped rosette border (white creams).
 */
function bakedTier(ix: CatalogIndex, shape: string, cx: number, yb: number, w: number, layer: Layer, i: number, uid: string, anim: Anim | null): BakedParts {
  const h = 44;
  const g = tierGeo(shape, cx, yb, h, w);
  const bat = (layer.batter && ix.byId[layer.batter]?.color) || FALLBACK_COLOR;
  const dark = !!(layer.batter && ix.byId[layer.batter]?.dark);
  const fr = layer.frosting ? ix.byId[layer.frosting]?.color ?? '#FFFBF4' : null;
  const dripping = layer.frosting === 'ganache' || layer.frosting === 'berry';
  const glossy = layer.frosting === 'ganache';
  const rand = rng((i + 1) * 7919 + Math.round(w));
  const clipId = `clip${uid}t${i}`;
  const box = `x="${n1(g.L - 30)}" y="${n1(g.yt - 60)}" width="${n1(g.R - g.L + 60)}" height="${n1(h + 90)}"`;
  const over = (fill: string, filter: string, op: number) =>
    `<rect ${box} fill="${fill}" ${filter ? `filter="url(#${filter}${uid})"` : ''} opacity="${op}" clip-path="url(#${clipId})"/>`;
  const on = (type: Anim['type']) => anim?.type === type && 'layer' in anim && anim.layer === i;

  const side = fr ? bat : shade(bat, -0.14);
  let sponge = `<clipPath id="${clipId}">${g.clip}</clipPath>${g.body(side)}`;
  sponge += over('#1E0F08', 'crumb', dark ? 0.35 : 0.24) + over('#fff', 'pores', dark ? 0.12 : 0.18);
  if (fr) {
    // Cream fillings between the sponge layers, then a thin scraped coat over the sides.
    for (const t of [0.38, 0.7]) {
      const yy = g.yt + h * t;
      const arc = shape === 'square' ? `M${g.L},${n1(yy)} H${g.R}` : `M${g.L},${n1(yy)} A${g.rx},${g.ry} 0 0 0 ${g.R},${n1(yy)}`;
      sponge += `<path d="${arc}" stroke="#1E0F08" stroke-width="4.4" fill="none" opacity=".16" transform="translate(0 1.4)" clip-path="url(#${clipId})"/>`;
      sponge += `<path d="${arc}" stroke="${fr}" stroke-width="3.4" fill="none" clip-path="url(#${clipId})"/>`;
    }
    sponge += over(fr, 'scrape', dripping ? 0.45 : 0.7);
  }
  sponge += over(`url(#cyl${uid})`, '', 1);
  // The sponge's top: golden crust when bare, cut crumb under the cream (seen while the cream spreads).
  sponge += g.top(fr ? shade(bat, 0.04) : shade(bat, -0.06)) + g.top('#1E0F08', `filter="url(#crumb${uid})" opacity=".2"`) + g.top(`url(#topHi${uid})`);
  if (on('rise')) sponge += `<g class="raw">${g.body('#FFF3D6')}${g.top('#FFF3D6')}</g>`;

  const shadowUnder = `<ellipse cx="${n1((g.L + g.R) / 2 + (shape === 'square' ? 8 : 0))}" cy="${n1(yb + 1)}" rx="${n1((g.R - g.L) / 2 + 8)}" ry="${n1(g.ry * 0.5)}" fill="#1E0F08" opacity=".32" filter="url(#soft${uid})"/>`;
  let back = shadowUnder + `<g class="${on('rise') ? 'rise2' : ''}">${sponge}</g>`;
  let front = '';

  if (fr) {
    const frosting = on('frost');
    const edge = frostEdge(g, dripping ? 5 : 5, dripping, h * 0.72, rand);
    const edgeShadow = `<path d="${edge.d}" fill="#1E0F08" opacity=".22" transform="translate(0 2)" filter="url(#soft1${uid})"/>`;
    let top = g.top(fr, `filter="url(#cream${uid})"`) + g.top(`url(#topHi${uid})`)
      + g.top('none', `stroke="${shade(fr, -0.2)}" stroke-width="1" opacity=".5"`);
    if (glossy) top += `<ellipse cx="${n1(g.tx - g.trx * 0.28)}" cy="${n1(g.ty - g.try * 0.3)}" rx="${n1(g.trx * 0.42)}" ry="${n1(g.try * 0.14)}" fill="#fff" opacity=".22" filter="url(#soft1${uid})" transform="rotate(-6 ${n1(g.tx)} ${n1(g.ty)})"/>`;
    back += `<g class="${frosting ? 'run' : ''}">${edgeShadow}<path d="${edge.d}" fill="${fr}"/><path d="${edge.d}" fill="url(#cyl${uid})" opacity=".55"/>${edge.shines}</g>`;
    back += `<g class="${frosting ? 'spread' : ''}">${top}</g>`;
    if (!dripping) {
      const r = Math.max(3.4, Math.min(6.5, g.rx / 13));
      const pts = g.rim(Math.round(g.rx / 5.4));
      pts.forEach((p, k) => {
        const svg = rosette(p.x, p.y, p.back ? r * 0.9 : r, fr, uid, frosting ? 'pipe' : '', 0.55 + k * 0.035);
        if (p.back) back += svg; else front += svg;
      });
    }
  }
  return { back, front, geo: g };
}

const FALLBACK_COLOR = '#EFC98E';

export function cakeSVG(ix: CatalogIndex, cake: CakeDesign, o: CakeSvgOptions): string {
  const { uid } = o;
  const anim = o.anim ?? null;
  const size = (cake.size && ix.sizeById[cake.size]) || ix.sizeById.m || ix.catalog.sizes[0]!;
  const color = (id: string | null) => (id && ix.byId[id]?.color) || FALLBACK_COLOR;
  const cx = 160, base = 222;
  const parts: string[] = [];
  const plateW = (cake.shape ? size.w : 170) / 2 + 30;
  parts.push(`<ellipse cx="${cx}" cy="${base + 12}" rx="${plateW + 10}" ry="12" fill="#1E0F08" opacity=".22" filter="url(#soft${uid})"/>
    <ellipse cx="${cx}" cy="${base + 8}" rx="${plateW + 4}" ry="14" fill="var(--plate)"/>
    <ellipse cx="${cx}" cy="${base + 4}" rx="${plateW}" ry="11" fill="url(#plate${uid})"/>
    <path d="M${cx - plateW * 0.8},${base - 1} A${plateW},11 0 0 1 ${cx + plateW * 0.2},${base - 6.8}" stroke="#fff" stroke-width="1.2" fill="none" opacity=".35"/>`);

  if (!cake.shape) {
    parts.push(`<ellipse cx="${cx}" cy="${base - 30}" rx="80" ry="12" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="6 6" opacity=".6"/>`);
  } else {
    let yb = base;
    cake.layers.forEach((L, i) => {
      const w = size.w * Math.pow(0.72, i);
      const cls: string[] = [];
      if (anim?.type === 'tier' && anim.layer === i) cls.push('tierdrop');
      if (anim?.type === 'pan' && i === 0) cls.push('drop');
      if (anim?.type === 'size' && i === 0) cls.push('grow');
      let g = '';
      if (!L.baked) {
        const h = 26;
        g += tierSVG(cake.shape!, cx, yb, h, w, '#8E95A5', '#C9CED8', uid).svg;
        if (L.batter) {
          const c = color(L.batter);
          const inner = tierSVG(cake.shape!, cx, yb - 3, h - 8, w * 0.86, c, shade(c, 0.18), uid, false);
          g += `<g class="${anim?.type === 'pour' && anim.layer === i ? 'pour' : ''}">${inner.svg}</g>`;
        }
        parts.push(`<g class="${cls.join(' ')}">${g}</g>`);
        yb = yb - h + 4;
      } else {
        const t = bakedTier(ix, cake.shape!, cx, yb, w, L, i, uid, anim);
        const geo = t.geo;
        let g2 = t.back;
        const hasAbove = i < cake.layers.length - 1;
        const u = Math.max(15, 21 * Math.pow(0.85, i));
        const placed = L.toppings.map((tp, k) => {
          let fx = tp.fx;
          // Keep toppings on the rim when another tier sits on top.
          if (hasAbove && Math.abs(fx) < 0.78) fx = (fx < 0 ? -1 : 1) * (0.8 + Math.abs(tp.fy) * 0.1);
          return { tp, k, x: geo.tx + fx * geo.trx * 0.8, y: geo.ty + tp.fy * geo.try * 0.72 + 3 };
        });
        // Back to front, so nearer toppings overlap farther ones.
        placed.sort((a, b) => a.y - b.y).forEach(({ tp, k, x, y }) => {
          const isNew = anim?.type === 'top' && anim.layer === i && anim.k === k;
          const act = o.interactive ? ` data-act="rmTop" data-v="${i}:${k}"` : '';
          const art = toppingSVG(tp.id, x, y, u, uid, k + i * 5, isNew ? 'fall' : '');
          g2 += art
            ? `<g class="tp"${act}>${art}</g>`
            : `<text class="tp ${isNew ? 'fall' : ''}" x="${x.toFixed(1)}" y="${(y + 2).toFixed(1)}" font-size="${Math.round(u * 0.95)}" text-anchor="middle"${act}>${esc(ix.byId[tp.id]?.e ?? '•')}</text>`;
        });
        g2 += t.front;
        parts.push(`<g class="${cls.join(' ')}">${g2}</g>`);
        yb = geo.yt;
      }
    });

    // Lettering on the front of the top baked tier.
    const topI = cake.layers.length - 1;
    const TL = cake.layers[topI]!;
    if (cake.lettering && TL.baked) {
      const w = size.w * Math.pow(0.72, topI);
      let y = base;
      for (let i = 0; i < topI; i++) y -= 44;
      const dark = !!(TL.batter && ix.byId[TL.batter]?.dark);
      // Piped writing: chocolate on light sponge, white cream on dark.
      const col = dark ? '#FFF6EC' : '#3B2016';
      const txt = o.letterShown != null ? cake.lettering.slice(0, o.letterShown) : cake.lettering;
      const fs = Math.max(10, Math.min(17, ((w * 0.9) / Math.max(6, cake.lettering.length)) * 1.6));
      const lx = cake.shape === 'square' ? 152 : 160;
      const ty = y - 22 + fs * 0.55 + 4;
      const attrs = `x="${lx}" y="${ty}" font-size="${fs}" font-weight="800" font-style="italic" text-anchor="middle" font-family="var(--sans)"`;
      parts.push(`<text ${attrs} fill="#000" opacity=".28" transform="translate(.6 .9)">${esc(txt)}</text><text ${attrs} fill="${col}" stroke="${dark ? '#E9D9C8' : '#6A4030'}" stroke-width=".4">${esc(txt)}</text>`);
    }
  }

  return `<svg class="cake-svg" viewBox="${o.crop ? '40 70 240 180' : '0 0 320 250'}" role="img" aria-label="${esc(o.label ?? 'Cake preview')}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sh${uid}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>${tierDefs(uid)}${toppingDefs(uid)}</defs>
    ${parts.join('')}</svg>`;
}
