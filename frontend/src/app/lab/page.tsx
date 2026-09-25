'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { presetCake, type CatalogIndex } from '@/lib/rules';
import type { Anim } from '@/lib/cakeSvg';
import { CakeView } from '@/components/CakeView';
import { Ready } from '@/components/ui';
import { Art } from '@/components/Art';
import type { CakeDesign } from '@/lib/types';

// Dev-only page for tuning the cake renderer: sample cakes plus replayable kitchen animations.
const SAMPLES = [
  { name: 'Vanilla · cream · strawberry', batter: 'vanilla', frosting: 'whip', toppings: ['straw', 'straw', 'straw', 'straw', 'mint'] },
  { name: 'Chocolate · ganache · cherry', batter: 'chocolate', frosting: 'ganache', toppings: ['cherry', 'cherry', 'cherry', 'choc'] },
  { name: 'Red velvet · cream cheese · berries', batter: 'redvelvet', frosting: 'cheese', toppings: ['straw', 'blue', 'blue', 'straw'] },
  { name: 'Matcha · no cream', batter: 'matcha', frosting: null, toppings: [] },
];

const tier = (batter: string, frosting: string | null, toppings: string[]) =>
  ({ ...presetCake({ batter, frosting: frosting ?? 'whip', toppings }).layers[0]!, frosting });
const EXTRA: { name: string; cake: CakeDesign }[] = [
  { name: 'Two tiers · lettering', cake: { shape: 'round', size: 'l', lettering: 'Happy Birthday!', layers: [tier('chocolate', 'ganache', ['cherry', 'cherry', 'cherry']), tier('vanilla', 'berry', ['straw', 'straw', 'kiwi'])] } },
  { name: 'Square', cake: { shape: 'square', size: 'm', lettering: '', layers: [tier('matcha', 'whip', ['straw', 'straw', 'mint', 'blue'])] } },
  { name: 'Heart', cake: { shape: 'heart', size: 'm', lettering: '', layers: [tier('redvelvet', 'cheese', ['straw', 'straw', 'straw'])] } },
  { name: 'Every topping', cake: { shape: 'round', size: 'l', lettering: '', layers: [{ ...tier('vanilla', 'whip', []), toppings: [
    ['peach', -0.55, -0.35], ['yuja', -0.15, -0.5], ['cookie', 0.3, -0.45], ['peanut', 0.62, -0.2], ['star', -0.62, 0.05], ['gummy', -0.25, 0.1],
    ['candle', 0.05, -0.05], ['kiwi', 0.35, 0.1], ['choc', 0.6, 0.35], ['cherry', -0.45, 0.45], ['blue', -0.05, 0.5], ['straw', 0.25, 0.55], ['mint', 0.02, 0.25],
  ].map(([id, fx, fy]) => ({ id: id as string, fx: fx as number, fy: fy as number })) }] } },
  { name: 'Three tiers', cake: { shape: 'round', size: 'l', lettering: '', layers: [tier('goguma', 'whip', ['peanut', 'star']), tier('rice', 'yogurt', ['yuja', 'blue']), tier('oat', 'coconut', ['kiwi', 'mint'])] } },
];

export default function LabPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <Ready>{(ix) => <Lab ix={ix} />}</Ready>;
}

function Lab({ ix }: { ix: CatalogIndex }) {
  const [anim, setAnim] = useState<{ a: Anim | null; n: number; stage: number }>({ a: null, n: 0, stage: 3 });
  const base = presetCake({ batter: 'vanilla', frosting: 'whip', toppings: ['straw', 'straw', 'straw', 'blue', 'mint'] });
  // stage 0 = batter in the pan, 1 = baked sponge, 2 = + cream, 3 = + toppings
  const L = base.layers[0]!;
  const staged: CakeDesign = { ...base, layers: [{ ...L, baked: anim.stage >= 1, frosting: anim.stage >= 2 ? L.frosting : null, toppings: anim.stage >= 3 ? L.toppings : [] }] };
  const play = (a: Anim, stage: number) => setAnim((s) => ({ a, stage, n: s.n + 1 }));

  // ?play=bake|cream|top&at=0.6 starts an animation and freezes it at that second (for screenshots).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const which = q.get('play');
    const steps: Record<string, [Anim, number]> = {
      pour: [{ type: 'pour', layer: 0 }, 0], bake: [{ type: 'rise', layer: 0 }, 1], cream: [{ type: 'frost', layer: 0 }, 2], top: [{ type: 'top', layer: 0, k: 4 }, 3],
    };
    const step = which ? steps[which] : undefined;
    if (!step) return;
    setAnim((s) => ({ a: step[0], stage: step[1], n: s.n + 1 }));
    const at = Number(q.get('at'));
    if (!Number.isFinite(at)) return;
    const id = setTimeout(() => document.getAnimations().forEach((x) => { x.pause(); x.currentTime = at * 1000; }), 60);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="pad stack">
      <h1 className="title">Cake lab</h1>
      <div className="result-stage" style={{ height: 300, borderRadius: 28 }}>
        <div className="cake-wrap" key={anim.n}><CakeView ix={ix} cake={staged} anim={anim.a} label="Animation test" /></div>
      </div>
      <div className="chips">
        <button className="chip" onClick={() => play({ type: 'pour', layer: 0 }, 0)}>Pour</button>
        <button className="chip" onClick={() => play({ type: 'rise', layer: 0 }, 1)}>Bake</button>
        <button className="chip" onClick={() => play({ type: 'frost', layer: 0 }, 2)}>Cream</button>
        <button className="chip" onClick={() => play({ type: 'top', layer: 0, k: 4 }, 3)}>Topping</button>
      </div>
      <div className="result-stage" style={{ height: 230, borderRadius: 28 }}>
        <div className="overlay" style={{ gridTemplateColumns: '1fr 1fr', placeItems: 'end center', paddingBottom: 10 }}>
          <div style={{ transform: 'scale(.7)', transformOrigin: 'center bottom' }}><div className="oven"><div className="knobs"><i /><i /></div><div className="timer">0:03</div><div className="door" /></div></div>
          <div style={{ position: 'relative', width: 240, height: 230, transform: 'scale(.62)', transformOrigin: 'center bottom' }}>
            <div className="cake-wrap" style={{ bottom: 14 }}><CakeView ix={ix} cake={presetCake({ ...SAMPLES[0]!, frosting: 'whip' })} label="Cake in the box" /></div>
            <div className="box-front" /><div className="box-lid" /><div className="box-bow"><Art src="misc/ribbon-bow" size={70} /></div>
          </div>
        </div>
      </div>
      {EXTRA.map((e) => (
        <figure key={e.name} style={{ margin: 0 }}>
          <div className="result-stage" style={{ height: 250, borderRadius: 28 }}>
            <div className="cake-wrap"><CakeView ix={ix} cake={e.cake} label={e.name} /></div>
          </div>
          <figcaption className="muted it small" style={{ textAlign: 'center', marginTop: 6 }}>{e.name}</figcaption>
        </figure>
      ))}
      {SAMPLES.map((s) => (
        <figure key={s.name} style={{ margin: 0 }}>
          <div className="result-stage" style={{ height: 250, borderRadius: 28 }}>
            <div className="cake-wrap"><CakeView ix={ix} cake={{ ...presetCake({ ...s, frosting: s.frosting ?? 'whip' }), layers: [{ ...presetCake({ ...s, frosting: s.frosting ?? 'whip' }).layers[0]!, frosting: s.frosting }] }} label={s.name} /></div>
          </div>
          <figcaption className="muted it small" style={{ textAlign: 'center', marginTop: 6 }}>{s.name}</figcaption>
        </figure>
      ))}
    </div>
  );
}
