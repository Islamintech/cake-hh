// Draws a cake design as an SVG string (ported from the demo). All text is escaped.
import { esc } from './format';
import type { CatalogIndex } from './rules';
import type { CakeDesign } from './types';

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

function dripsSVG(L: number, R: number, yt: number, ry: number, color: string, seed: number): string {
  const n = 8, seg = (R - L) / n;
  let d = `M${L},${yt} L${L},${yt + ry * 0.5}`;
  for (let j = 0; j < n; j++) {
    const x0 = L + j * seg, x1 = x0 + seg, dep = ry * 0.5 + 6 + ((j * 7 + seed * 3) % 4) * 4;
    d += ` Q${x0 + seg * 0.2},${yt + dep + 6} ${x0 + seg / 2},${yt + dep} Q${x0 + seg * 0.8},${yt + dep - 8} ${x1},${yt + ry * 0.5}`;
  }
  d += ` L${R},${yt} Z`;
  return `<path d="${d}" fill="${color}"/>`;
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
  parts.push(`<ellipse cx="${cx}" cy="${base + 8}" rx="${plateW + 4}" ry="14" fill="var(--plate)"/><ellipse cx="${cx}" cy="${base + 4}" rx="${plateW}" ry="11" fill="var(--plate-top)"/>`);

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
        const h = 44;
        const bat = color(L.batter);
        const fr = L.frosting ? color(L.frosting) : null;
        const probe = tierSVG(cake.shape!, cx, yb, h, w, bat, fr ?? shade(bat, 0.2), uid);
        const frost = fr
          ? `<g class="${anim?.type === 'frost' && anim.layer === i ? 'sweep' : ''}">${dripsSVG(probe.L, probe.R, probe.yt, probe.ry, fr, i + 1)}${probe.topSvg(fr)}</g>`
          : '';
        g += `<g class="${anim?.type === 'rise' && anim.layer === i ? 'rise' : ''}">${probe.bodySvg}${probe.topSvg(shade(bat, 0.2))}</g>` + frost;
        const hasAbove = i < cake.layers.length - 1;
        L.toppings.forEach((t, k) => {
          let fx = t.fx;
          const fy = t.fy;
          // Keep toppings on the rim when another tier sits on top.
          if (hasAbove && Math.abs(fx) < 0.78) fx = (fx < 0 ? -1 : 1) * (0.8 + Math.abs(fy) * 0.1);
          const x = probe.tx + fx * probe.rx * 0.82, y = probe.ty + fy * probe.ry * 0.75 + 6;
          const fs = Math.max(14, 20 * Math.pow(0.85, i));
          const isNew = anim?.type === 'top' && anim.layer === i && anim.k === k;
          const act = o.interactive ? ` data-act="rmTop" data-v="${i}:${k}"` : '';
          g += `<text class="tp ${isNew ? 'drop' : ''}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${fs}" text-anchor="middle"${act}>${esc(ix.byId[t.id]?.e ?? '•')}</text>`;
        });
        parts.push(`<g class="${cls.join(' ')}">${g}</g>`);
        yb = probe.yt;
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
      const col = dark ? '#FFF1F7' : '#D6336C';
      const txt = o.letterShown != null ? cake.lettering.slice(0, o.letterShown) : cake.lettering;
      const fs = Math.max(10, Math.min(17, ((w * 0.9) / Math.max(6, cake.lettering.length)) * 1.6));
      const lx = cake.shape === 'square' ? 152 : 160;
      parts.push(`<text x="${lx}" y="${y - 22 + fs * 0.55 + 4}" font-size="${fs}" font-weight="800" text-anchor="middle" fill="${col}" font-family="var(--display)">${esc(txt)}</text>`);
    }
  }

  return `<svg class="cake-svg" viewBox="${o.crop ? '40 70 240 180' : '0 0 320 250'}" role="img" aria-label="${esc(o.label ?? 'Cake preview')}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sh${uid}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>
    ${parts.join('')}</svg>`;
}
