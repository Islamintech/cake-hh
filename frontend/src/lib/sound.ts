// Tiny arcade blips. Off by default; the header toggle turns them on.
let ctx: AudioContext | null = null;
let enabled = false;

export const setSoundEnabled = (on: boolean) => { enabled = on; };

export function blip(freq = 660, dur = 0.08, type: OscillatorType = 'square'): void {
  if (!enabled || typeof window === 'undefined') return;
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.stop(ctx.currentTime + dur + 0.02);
  } catch {
    /* audio unavailable */
  }
}
