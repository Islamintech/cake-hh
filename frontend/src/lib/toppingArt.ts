// Drawn toppings for the cake renderer, lit from the upper left like the cake itself.
// Each one is drawn around (0, 0) = where it touches the cream, in units of `u` pixels.
// Toppings with a picture in public/art/toppings use it; anything with neither falls back to its emoji.

import { art, itemArt } from './art';

const f = (n: number) => +n.toFixed(2);
/** Size of a topping picture, in units of u (the item fills a bit under half its canvas). */
const PIC_SCALE = 1.6;

/** Gradients shared by the drawn toppings. Ids are suffixed with the cake's uid. */
export function toppingDefs(uid: string): string {
  const radial = (id: string, stops: [number, string, number?][], cx = 0.35, cy = 0.3) =>
    `<radialGradient id="${id}${uid}" cx="${cx}" cy="${cy}" r="0.75">${stops
      .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
  return [
    radial('tStraw', [[0, '#FF7A7A'], [0.35, '#E0283A'], [0.8, '#A30F1E'], [1, '#6E0712']]),
    radial('tBlue', [[0, '#8E9BD6'], [0.3, '#4B5AA0'], [0.75, '#26306A'], [1, '#161B45']]),
    radial('tCherry', [[0, '#FF8A96'], [0.18, '#D4203D'], [0.7, '#86091D'], [1, '#43040E']]),
    radial('tKiwi', [[0, '#F4F7D2'], [0.2, '#D9EB8A'], [0.55, '#8DC63F'], [1, '#5E9A22']], 0.5, 0.5),
    `<linearGradient id="tLeaf${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8FD16F"/><stop offset="1" stop-color="#2E7A2C"/></linearGradient>`,
    `<linearGradient id="tChoc${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A4A33"/><stop offset="1" stop-color="#3A1F14"/></linearGradient>`,
    radial('tPeach', [[0, '#FFE2B0'], [0.45, '#F9B268'], [0.85, '#EE8A3C'], [1, '#C8562A']], 0.4, 0.2),
    radial('tYuja', [[0, '#FFF3A8'], [0.5, '#F8C93A'], [1, '#D8901A']]),
    radial('tCookie', [[0, '#E8B878'], [0.6, '#C98B4A'], [1, '#9A6230']], 0.4, 0.35),
    radial('tNut', [[0, '#F2D39A'], [0.6, '#D6A866'], [1, '#A8763C']]),
    radial('tStar', [[0, '#FFF7C9'], [0.5, '#F7D251'], [1, '#D9A21C']], 0.4, 0.3),
    radial('tGummyR', [[0, '#FF9AA8', 0.95], [0.6, '#E8344E', 0.9], [1, '#A5122A', 0.95]]),
    radial('tGummyG', [[0, '#C9F59A', 0.95], [0.6, '#5FC23A', 0.9], [1, '#2E7F1C', 0.95]]),
    `<linearGradient id="tWax${uid}" x1="0" x2="1"><stop offset="0" stop-color="#F7F1E6"/><stop offset=".45" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D8CFC0"/></linearGradient>`,
    `<radialGradient id="tFlame${uid}" cx=".5" cy=".75" r=".7"><stop offset="0" stop-color="#FFFBE6"/><stop offset=".35" stop-color="#FFD35A"/><stop offset=".75" stop-color="#FF8A1E"/><stop offset="1" stop-color="#FF5A1F" stop-opacity="0"/></radialGradient>`,
    `<filter id="tSh${uid}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>`,
  ].join('');
}

/** Soft contact shadow on the cream; drawn outside the falling group so it stays put and grows. */
const shadow = (u: number, uid: string, w: number, cls: string) =>
  `<ellipse class="${cls}" cx="${f(u * 0.04)}" cy="${f(u * 0.04)}" rx="${f(u * w)}" ry="${f(u * 0.11)}" fill="#1E0F08" opacity=".32" filter="url(#tSh${uid})"/>`;

function strawberry(u: number, uid: string, seed: number): string {
  const p = (x: number, y: number) => `${f(x * u)},${f(y * u)}`;
  const body = `M${p(0, 0.02)} C${p(-0.3, -0.06)} ${p(-0.44, -0.44)} ${p(-0.3, -0.64)} C${p(-0.18, -0.8)} ${p(0.18, -0.8)} ${p(0.3, -0.64)} C${p(0.44, -0.44)} ${p(0.3, -0.06)} ${p(0, 0.02)} Z`;
  const seeds = [[-0.18, -0.52], [0, -0.58], [0.18, -0.5], [-0.24, -0.34], [-0.06, -0.38], [0.12, -0.32], [0.26, -0.3], [-0.12, -0.18], [0.06, -0.14], [-0.02, -0.06 - (seed % 2) * 0.02]]
    .map(([x, y]) => `<ellipse cx="${f(x! * u)}" cy="${f(y! * u)}" rx="${f(u * 0.022)}" ry="${f(u * 0.034)}" fill="#F6D86B" opacity=".9"/>`).join('');
  const calyx = [-60, -25, 5, 35, 65].map((a) => `<path d="M${p(0, -0.7)} q${f(u * 0.06)},${f(-u * 0.05)} ${f(u * 0.02)},${f(-u * 0.2)} q${f(-u * 0.08)},${f(u * 0.08)} ${f(-u * 0.02)},${f(u * 0.2)}Z" fill="url(#tLeaf${uid})" transform="rotate(${a + 180} 0 ${f(-u * 0.7)})"/>`).join('');
  return `<path d="${body}" fill="url(#tStraw${uid})"/>${seeds}${calyx}
    <ellipse cx="${f(-u * 0.16)}" cy="${f(-u * 0.5)}" rx="${f(u * 0.06)}" ry="${f(u * 0.11)}" fill="#fff" opacity=".42" transform="rotate(20 ${f(-u * 0.16)} ${f(-u * 0.5)})"/>`;
}

function blueberry(u: number, uid: string): string {
  const r = u * 0.26, cy = -r * 0.95;
  const crown = [0, 72, 144, 216, 288].map((a) => `<path d="M0,${f(cy - r * 0.62)} l${f(r * 0.1)},${f(-r * 0.22)}" stroke="#12143A" stroke-width="${f(r * 0.12)}" stroke-linecap="round" transform="rotate(${a} 0 ${f(cy - r * 0.62)})"/>`).join('');
  return `<circle cx="0" cy="${f(cy)}" r="${f(r)}" fill="url(#tBlue${uid})"/>
    <circle cx="0" cy="${f(cy)}" r="${f(r)}" fill="#DDE3F5" opacity=".14"/>${crown}
    <ellipse cx="${f(-r * 0.4)}" cy="${f(cy - r * 0.4)}" rx="${f(r * 0.22)}" ry="${f(r * 0.14)}" fill="#fff" opacity=".35"/>`;
}

function cherry(u: number, uid: string): string {
  const r = u * 0.3, cy = -r;
  return `<path d="M${f(r * 0.05)},${f(cy - r * 0.8)} C${f(r * 0.2)},${f(cy - r * 2.2)} ${f(r * 1.2)},${f(cy - r * 2.8)} ${f(r * 1.6)},${f(cy - r * 3)}" stroke="#5E7B2B" stroke-width="${f(u * 0.045)}" fill="none" stroke-linecap="round"/>
    <circle cx="0" cy="${f(cy)}" r="${f(r)}" fill="url(#tCherry${uid})"/>
    <path d="M${f(-r * 0.15)},${f(cy - r * 0.92)} q${f(r * 0.2)},${f(r * 0.25)} ${f(r * 0.4)},0" stroke="#3A0409" stroke-width="${f(r * 0.1)}" fill="none" opacity=".6"/>
    <ellipse cx="${f(-r * 0.38)}" cy="${f(cy - r * 0.38)}" rx="${f(r * 0.2)}" ry="${f(r * 0.3)}" fill="#fff" opacity=".7" transform="rotate(35 ${f(-r * 0.38)} ${f(cy - r * 0.38)})"/>`;
}

function mint(u: number, uid: string): string {
  const leaf = (a: number) => `<g transform="rotate(${a})"><path d="M0,0 C${f(-u * 0.22)},${f(-u * 0.08)} ${f(-u * 0.24)},${f(-u * 0.4)} 0,${f(-u * 0.56)} C${f(u * 0.24)},${f(-u * 0.4)} ${f(u * 0.22)},${f(-u * 0.08)} 0,0Z" fill="url(#tLeaf${uid})"/>
    <path d="M0,0 L0,${f(-u * 0.5)}" stroke="#C8EDB0" stroke-width="${f(u * 0.025)}" opacity=".7"/></g>`;
  return `${leaf(-32)}${leaf(28)}`;
}

function kiwi(u: number, uid: string): string {
  const rx = u * 0.34, ry = u * 0.2, cy = -ry * 0.9;
  const seeds = Array.from({ length: 12 }, (_, k) => {
    const a = (k / 12) * Math.PI * 2;
    return `<ellipse cx="${f(Math.cos(a) * rx * 0.5)}" cy="${f(cy + Math.sin(a) * ry * 0.5)}" rx="${f(u * 0.02)}" ry="${f(u * 0.012)}" fill="#1A1A10"/>`;
  }).join('');
  return `<ellipse cx="0" cy="${f(cy + u * 0.04)}" rx="${f(rx)}" ry="${f(ry)}" fill="#6B4E26"/>
    <ellipse cx="0" cy="${f(cy)}" rx="${f(rx * 0.94)}" ry="${f(ry * 0.9)}" fill="url(#tKiwi${uid})"/>${seeds}`;
}

function chocolate(u: number, uid: string): string {
  const p = (x: number, y: number) => `${f(x * u)},${f(y * u)}`;
  return `<path d="M${p(-0.32, -0.1)} L${p(-0.12, -0.34)} L${p(0.34, -0.3)} L${p(0.18, -0.04)} Z" fill="url(#tChoc${uid})"/>
    <path d="M${p(-0.32, -0.1)} L${p(0.18, -0.04)} L${p(0.18, 0.04)} L${p(-0.32, -0.02)} Z" fill="#2E170E"/>
    <path d="M${p(0.18, -0.04)} L${p(0.34, -0.3)} L${p(0.34, -0.22)} L${p(0.18, 0.04)} Z" fill="#24120B"/>
    <path d="M${p(-0.26, -0.12)} L${p(-0.1, -0.3)}" stroke="#A06A4C" stroke-width="${f(u * 0.03)}" opacity=".7"/>`;
}

function peach(u: number, uid: string): string {
  const p = (x: number, y: number) => `${f(x * u)},${f(y * u)}`;
  // A wedge lying on its side: flesh on top, a thin blushed skin along the curve.
  return `<path d="M${p(-0.36, -0.06)} C${p(-0.3, -0.42)} ${p(0.3, -0.46)} ${p(0.38, -0.08)} Z" fill="url(#tPeach${uid})"/>
    <path d="M${p(-0.36, -0.06)} C${p(-0.3, -0.42)} ${p(0.3, -0.46)} ${p(0.38, -0.08)}" stroke="#D2452B" stroke-width="${f(u * 0.05)}" fill="none" stroke-linecap="round" opacity=".85"/>
    <path d="M${p(-0.36, -0.06)} L${p(0.38, -0.08)} L${p(0.36, -0.01)} L${p(-0.34, 0.01)} Z" fill="#E58A45"/>
    <path d="M${p(-0.2, -0.22)} C${p(-0.1, -0.33)} ${p(0.1, -0.34)} ${p(0.2, -0.26)}" stroke="#fff" stroke-width="${f(u * 0.03)}" fill="none" opacity=".45" stroke-linecap="round"/>`;
}

function yuja(u: number): string {
  // Thin curls of candied peel.
  const curl = (dx: number, dy: number, a: number, c: string) =>
    `<path d="M${f(dx * u)},${f(dy * u)} c${f(u * 0.12)},${f(-u * 0.2)} ${f(u * 0.34)},${f(-u * 0.16)} ${f(u * 0.3)},${f(u * 0.02)}" stroke="${c}" stroke-width="${f(u * 0.075)}" fill="none" stroke-linecap="round" transform="rotate(${a} ${f(dx * u)} ${f(dy * u)})"/>`;
  return curl(-0.26, -0.08, -10, '#E8A21E') + curl(-0.12, -0.14, 18, '#F6C43A') + curl(-0.2, -0.02, 40, '#FFD95E')
    + `<path d="M${f(-u * 0.08)},${f(-u * 0.2)} q${f(u * 0.08)},${f(-u * 0.08)} ${f(u * 0.16)},${f(-u * 0.04)}" stroke="#FFF6C2" stroke-width="${f(u * 0.02)}" fill="none" opacity=".8"/>`;
}

function cookie(u: number, uid: string): string {
  const rx = u * 0.36, ry = u * 0.2, cy = -u * 0.14;
  const chips = [[-0.14, -0.04], [0.1, -0.08], [0.02, 0.05], [0.2, 0.04], [-0.2, 0.06]]
    .map(([x, y]) => `<ellipse cx="${f(x! * u)}" cy="${f(cy + y! * u)}" rx="${f(u * 0.045)}" ry="${f(u * 0.03)}" fill="#3A1F14"/>`).join('');
  return `<ellipse cx="0" cy="${f(cy + u * 0.06)}" rx="${f(rx)}" ry="${f(ry)}" fill="#8A5528"/>
    <ellipse cx="0" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#tCookie${uid})"/>${chips}
    <ellipse cx="${f(-rx * 0.35)}" cy="${f(cy - ry * 0.4)}" rx="${f(rx * 0.3)}" ry="${f(ry * 0.25)}" fill="#fff" opacity=".18"/>`;
}

function peanut(u: number, uid: string): string {
  const half = (x: number, a: number) => `<g transform="translate(${f(x * u)} ${f(-u * 0.1)}) rotate(${a})">
    <ellipse rx="${f(u * 0.12)}" ry="${f(u * 0.085)}" fill="url(#tNut${uid})"/>
    <path d="M${f(-u * 0.08)},0 L${f(u * 0.08)},0" stroke="#A8763C" stroke-width="${f(u * 0.015)}" opacity=".7"/>
    <ellipse cx="${f(-u * 0.04)}" cy="${f(-u * 0.035)}" rx="${f(u * 0.04)}" ry="${f(u * 0.02)}" fill="#fff" opacity=".4"/></g>`;
  return half(-0.1, -20) + half(0.12, 25);
}

function star(u: number, uid: string): string {
  const pts = Array.from({ length: 10 }, (_, k) => {
    const r = (k % 2 ? 0.14 : 0.32) * u, a = (k / 10) * Math.PI * 2 - Math.PI / 2;
    return `${f(Math.cos(a) * r)},${f(-u * 0.24 + Math.sin(a) * r * 0.8)}`;
  }).join(' ');
  return `<polygon points="${pts}" fill="#B98512" transform="translate(0 ${f(u * 0.04)})"/>
    <polygon points="${pts}" fill="url(#tStar${uid})"/>
    <circle cx="${f(-u * 0.08)}" cy="${f(-u * 0.32)}" r="${f(u * 0.035)}" fill="#fff" opacity=".85"/>`;
}

function gummy(u: number, uid: string, seed: number): string {
  const fill = seed % 2 ? `url(#tGummyG${uid})` : `url(#tGummyR${uid})`;
  const p = (x: number, y: number) => `${f(x * u)},${f(y * u)}`;
  // A small bear: head, ears, round belly.
  return `<g opacity=".95"><ellipse cx="0" cy="${f(-u * 0.14)}" rx="${f(u * 0.17)}" ry="${f(u * 0.15)}" fill="${fill}"/>
    <circle cx="0" cy="${f(-u * 0.38)}" r="${f(u * 0.12)}" fill="${fill}"/>
    <circle cx="${f(-u * 0.1)}" cy="${f(-u * 0.48)}" r="${f(u * 0.05)}" fill="${fill}"/><circle cx="${f(u * 0.1)}" cy="${f(-u * 0.48)}" r="${f(u * 0.05)}" fill="${fill}"/>
    <path d="M${p(-0.16, -0.24)} l${f(-u * 0.08)},${f(-u * 0.04)} M${p(0.16, -0.24)} l${f(u * 0.08)},${f(-u * 0.04)}" stroke="${fill}" stroke-width="${f(u * 0.08)}" stroke-linecap="round"/>
    <ellipse cx="${f(-u * 0.05)}" cy="${f(-u * 0.42)}" rx="${f(u * 0.035)}" ry="${f(u * 0.05)}" fill="#fff" opacity=".6"/>
    <ellipse cx="${f(-u * 0.07)}" cy="${f(-u * 0.18)}" rx="${f(u * 0.04)}" ry="${f(u * 0.07)}" fill="#fff" opacity=".35"/></g>`;
}

function candle(u: number, uid: string): string {
  const w = u * 0.1, h = u * 0.95;
  const stripes = [0.15, 0.4, 0.65].map((t) => `<path d="M${f(-w / 2)},${f(-h * t)} L${f(w / 2)},${f(-h * t - w * 0.9)}" stroke="#E0457B" stroke-width="${f(w * 0.45)}"/>`).join('');
  return `<rect x="${f(-w / 2)}" y="${f(-h)}" width="${f(w)}" height="${f(h)}" rx="${f(w * 0.3)}" fill="url(#tWax${uid})"/>${stripes}
    <path d="M0,${f(-h)} l0,${f(-u * 0.06)}" stroke="#2A2A2A" stroke-width="${f(u * 0.02)}"/>
    <g class="flame"><ellipse cx="0" cy="${f(-h - u * 0.2)}" rx="${f(u * 0.2)}" ry="${f(u * 0.26)}" fill="#FFB347" opacity=".25"/>
    <path d="M0,${f(-h - u * 0.36)} C${f(u * 0.07)},${f(-h - u * 0.22)} ${f(u * 0.08)},${f(-h - u * 0.1)} 0,${f(-h - u * 0.06)} C${f(-u * 0.08)},${f(-h - u * 0.1)} ${f(-u * 0.07)},${f(-h - u * 0.22)} 0,${f(-h - u * 0.36)}Z" fill="url(#tFlame${uid})"/></g>`;
}

/** Drawing and the half-width of its shadow (in units of u). */
const DRAWN: Record<string, [(u: number, uid: string, seed: number) => string, number]> = {
  straw: [strawberry, 0.3], blue: [blueberry, 0.3], cherry: [cherry, 0.34], mint: [mint, 0.3], kiwi: [kiwi, 0.36], choc: [chocolate, 0.34],
  peach: [peach, 0.36], yuja: [yuja, 0.3], cookie: [cookie, 0.38], peanut: [peanut, 0.26], star: [star, 0.28], gummy: [gummy, 0.2], candle: [candle, 0.12],
};

/**
 * One topping at (x, y). Uses the picture from public/art/toppings when there is one, otherwise the drawing.
 * Returns null when there is neither (use the emoji).
 * `cls` goes on an inner group with no transform attribute, so CSS animations don't fight the placement.
 */
export function toppingSVG(id: string, x: number, y: number, u: number, uid: string, seed: number, cls = ''): string | null {
  const pic = itemArt(id);
  const entry = DRAWN[id];
  if (!pic && !entry) return null;
  // A little turn per placement so a ring of strawberries doesn't look stamped.
  const rot = ((seed * 37) % 24) - 12;
  // The pictures stand on the bottom of their canvas, with about 6% of empty space under them.
  const s = u * PIC_SCALE;
  const body = pic
    ? `<image href="${art(pic)}" x="${f(-s / 2)}" y="${f(-s * 0.94)}" width="${f(s)}" height="${f(s)}"/>`
    : entry![0](u, uid, seed);
  return `<g transform="translate(${f(x)} ${f(y)})">${shadow(u, uid, entry?.[1] ?? 0.3, cls ? `${cls}-sh` : '')}<g class="${cls}"><g transform="rotate(${rot})">${body}</g></g></g>`;
}
