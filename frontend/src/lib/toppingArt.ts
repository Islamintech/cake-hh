// Drawn toppings for the cake renderer, lit from the upper left like the cake itself.
// Each one is drawn around (0, 0) = where it touches the cream, in units of `u` pixels.
// Toppings without a drawing yet fall back to their emoji.

const f = (n: number) => +n.toFixed(2);

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

/** Drawing and the half-width of its shadow (in units of u). */
const DRAWN: Record<string, [(u: number, uid: string, seed: number) => string, number]> = {
  straw: [strawberry, 0.3], blue: [blueberry, 0.3], cherry: [cherry, 0.34], mint: [mint, 0.3], kiwi: [kiwi, 0.36], choc: [chocolate, 0.34],
};

export const hasDrawing = (id: string): boolean => id in DRAWN;

/**
 * One topping at (x, y). Returns null when there is no drawing (use the emoji).
 * `cls` goes on an inner group with no transform attribute, so CSS animations don't fight the placement.
 */
export function toppingSVG(id: string, x: number, y: number, u: number, uid: string, seed: number, cls = ''): string | null {
  const entry = DRAWN[id];
  if (!entry) return null;
  const [draw, w] = entry;
  // A little turn per placement so a ring of strawberries doesn't look stamped.
  const rot = ((seed * 37) % 24) - 12;
  return `<g transform="translate(${f(x)} ${f(y)})">${shadow(u, uid, w, cls ? `${cls}-sh` : '')}<g class="${cls}"><g transform="rotate(${rot})">${draw(u, uid, seed)}</g></g></g>`;
}
