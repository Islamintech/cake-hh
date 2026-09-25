'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { Anim } from '@/lib/cakeSvg';
import { won } from '@/lib/format';
import {
  ALL_STATIONS, cloneCake, combosOf, curStation, newLayer, priceOf, stationsFor, type CatalogIndex, type Station, type Step,
} from '@/lib/rules';
import { blip } from '@/lib/sound';
import { useCakeStore } from '@/store/useCakeStore';
import { CakeView } from '@/components/CakeView';
import { useToast } from '@/components/Providers';
import { ErrorCard, Loading, Ready } from '@/components/ui';
import { Art } from '@/components/Art';
import { itemArt } from '@/lib/art';
import type { BakeryDetail, CakeDesign, MenuItem, Pair } from '@/lib/types';

// `icon` is the picture in public/art/stations.
const STATION_INFO: Record<Station, { icon: string; label: string; title: string; tip: string }> = {
  pan: { icon: 'pan', label: 'Pan', title: 'Pick a pan', tip: 'Every good cake starts with a good pan, dear.' },
  size: { icon: 'size', label: 'Size', title: 'How many people?', tip: "Don't make it too small. Someone always wants seconds!" },
  batter: { icon: 'batter', label: 'Batter', title: 'Pour the batter', tip: 'Pick your sponge. Matcha is popular this season.' },
  oven: { icon: 'oven', label: 'Oven', title: 'Bake it', tip: "Into the oven! Don't open the door." },
  frosting: { icon: 'cream', label: 'Cream', title: 'Spread the cream', tip: 'Now the cream. Nice and even.' },
  toppings: { icon: 'toppings', label: 'Toppings', title: 'Add toppings', tip: 'Tap to add toppings. Tap one on the cake to take it off.' },
  lettering: { icon: 'letters', label: 'Letters', title: 'Write a message', tip: 'Write something sweet. Short is best.' },
  box: { icon: 'box', label: 'Box', title: 'Box it up', tip: "All done! Let me box it for you." },
};
const LETTER_IDEAS = ['Happy Birthday!', '생일 축하해!', 'Love you', 'Congrats!', 'Thank you'];

export default function KitchenPage() {
  return <Ready>{(ix) => <KitchenLoader ix={ix} />}</Ready>;
}

/** Loads this bakery's menu (stock + lock reasons for the chosen options) from the API. */
function KitchenLoader({ ix }: { ix: CatalogIndex }) {
  const router = useRouter();
  const bakeryId = useCakeStore((s) => s.bakeryId);
  const opts = useCakeStore((s) => s.opts);
  const [bakery, setBakery] = useState<BakeryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!bakeryId) { router.replace('/bakeries'); return; }
    setError(null);
    api.bakery(bakeryId, opts).then(setBakery).catch((e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not open the kitchen.'));
  }, [bakeryId, opts, router, attempt]);

  if (error) return <div className="pad"><ErrorCard title="Kitchen unavailable" message={error} onRetry={() => setAttempt((n) => n + 1)} /></div>;
  if (!bakery) return <Loading label="Opening the kitchen…" />;
  return <Kitchen ix={ix} bakery={bakery} />;
}

function Kitchen({ ix, bakery }: { ix: CatalogIndex; bakery: BakeryDetail }) {
  const router = useRouter();
  const toast = useToast();
  const { cake, step, pendingLetter, kitchenTip, setCake, setStep, setKitchenTip } = useCakeStore();

  const [anim, setAnim] = useState<Anim | null>(null);
  const [tip, setTip] = useState<string | null>(kitchenTip);
  const [busy, setBusy] = useState<false | 'oven' | 'box'>(false);
  const [modal, setModal] = useState(false);
  const [letterShown, setLetterShown] = useState<number | null>(null);
  const [ovenLeft, setOvenLeft] = useState(3);
  const [beltKey, setBeltKey] = useState(0);
  const [comboKey, setComboKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { if (kitchenTip) setKitchenTip(null); }, [kitchenTip, setKitchenTip]);
  useEffect(() => () => timers.current.forEach((t) => { clearTimeout(t); clearInterval(t); }), []);
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };
  const every = (fn: () => void, ms: number) => { const t = setInterval(fn, ms); timers.current.push(t); return t; };

  const st = curStation(step);
  const L = cake.layers[step.layer] ?? cake.layers[0]!;
  const info = STATION_INFO[st];
  const price = priceOf(ix, cake, bakery.mult);

  // ---- helpers ----
  // Always start from the latest stored cake: some updates run from timers (oven) after other changes.
  const update = useCallback((mutate: (c: CakeDesign) => void) => {
    const next = cloneCake(useCakeStore.getState().cake);
    mutate(next);
    setCake(next);
    return next;
  }, [setCake]);

  /** Show the newest pairing message; returns true for a good combo (plays COMBO!). */
  const checkCombos = (before: Pair[], after: CakeDesign) => {
    const fresh = combosOf(ix, after).find((p) => !before.some((q) => q.a === p.a && q.b === p.b));
    if (!fresh) return false;
    setTip(fresh.message);
    if (fresh.score > 0) {
      setComboKey((k) => k + 1);
      blip(988, 0.08); later(() => blip(1318, 0.12), 90);
    }
    return fresh.score > 0;
  };

  const moveBelt = () => { setBeltKey((k) => k + 1); blip(330, 0.06, 'triangle'); };
  const go = (next: Step, t: string | null = null) => { setStep(next); setTip(t); setAnim(null); };

  // ---- station actions ----
  function pick(id: string) {
    const before = combosOf(ix, cake);
    const layerI = step.layer;
    const next = update((c) => {
      const layer = c.layers[layerI]!;
      if (st === 'pan') c.shape = id;
      if (st === 'size') c.size = id;
      if (st === 'batter' && layer.batter !== id) { layer.batter = id; layer.baked = false; }
      if (st === 'frosting') layer.frosting = id;
    });
    if (st === 'pan') { setAnim({ type: 'pan' }); blip(300, 0.08); setTip(`A ${id} pan. Lovely.`); }
    if (st === 'size') { setAnim({ type: 'size' }); blip(500, 0.06); }
    if (st === 'batter' && L.batter !== id) { setAnim({ type: 'pour', layer: layerI }); blip(392, 0.12, 'triangle'); setTip(`${ix.byId[id]?.name ?? id} batter, poured in.`); }
    if (st === 'frosting') { setAnim({ type: 'frost', layer: layerI }); blip(587, 0.1, 'triangle'); }
    checkCombos(before, next);
  }

  function addTopping(id: string) {
    if (L.toppings.length >= ix.catalog.rules.maxToppingsPerLayer) { toast('That layer is full. Tap a topping on the cake to remove one.'); return; }
    const before = combosOf(ix, cake);
    const k = L.toppings.length;
    const ang = Math.random() * Math.PI * 2, r = 0.25 + Math.random() * 0.7;
    const next = update((c) => { c.layers[step.layer]!.toppings.push({ id, fx: +(Math.cos(ang) * r).toFixed(2), fy: +(Math.sin(ang) * r * 0.8).toFixed(2) }); });
    setAnim({ type: 'top', layer: step.layer, k });
    blip(660 + k * 20, 0.05);
    checkCombos(before, next);
  }

  function removeTopping(i: number, k: number) {
    if (busy) return;
    update((c) => { c.layers[i]?.toppings.splice(k, 1); });
    setAnim(null);
    blip(300, 0.05);
    setTip('Took that one off.');
  }

  function bake() {
    if (busy) return;
    setBusy('oven'); setOvenLeft(3); blip(220, 0.15, 'sawtooth');
    const layerI = step.layer;
    const iv = every(() => { setOvenLeft((t) => Math.max(0, t - 1)); blip(440, 0.05); }, 420);
    later(() => {
      clearInterval(iv);
      setBusy(false);
      update((c) => { c.layers[layerI]!.baked = true; });
      setAnim({ type: 'rise', layer: layerI });
      setTip('Ding! Perfectly golden.');
      blip(1046, 0.25, 'sine');
    }, 1350);
  }

  function boxIt() {
    if (busy) return;
    setBusy('box'); blip(523, 0.1);
    later(() => blip(784, 0.12), 500);
    later(() => { setBusy(false); router.push('/result'); }, 1500);
  }

  function typeLetters(text: string) {
    update((c) => { c.lettering = text; });
    let n = 0;
    setLetterShown(0);
    const iv = every(() => {
      n++;
      setLetterShown(n);
      blip(700 + n * 10, 0.03);
      if (n >= text.length) { clearInterval(iv); setLetterShown(null); }
    }, 50);
  }

  // ---- navigation ----
  function canNext(): boolean {
    if (busy) return false;
    if (st === 'pan') return !!cake.shape;
    if (st === 'size') return !!cake.size;
    if (st === 'batter') return !!L.batter;
    if (st === 'oven') return L.baked;
    if (st === 'frosting') return !!L.frosting;
    return st !== 'box';
  }

  function advance() {
    if (!canNext()) return;
    const list: Station[] = step.phase === 'finish' ? ['lettering', 'box'] : stationsFor(step.layer);
    if (step.phase === 'build' && list[step.i] === 'toppings') { setModal(true); return; }
    if (step.i < list.length - 1) { go({ ...step, i: step.i + 1 }); moveBelt(); }
  }

  function goBack() {
    if (step.i > 0) { go({ ...step, i: step.i - 1 }); return; }
    if (step.phase === 'finish') {
      const last = cake.layers.length - 1;
      go({ layer: last, i: stationsFor(last).length - 1, phase: 'build' });
      return;
    }
    if (step.layer > 0) {
      const below = step.layer - 1;
      update((c) => { c.layers.pop(); });
      go({ layer: below, i: stationsFor(below).length - 1, phase: 'build' }, 'Took that layer off. Back to the one below.');
      return;
    }
    router.push('/bakeries');
  }

  function addLayer() {
    setModal(false);
    const next = update((c) => { c.layers.push(newLayer()); });
    const layerI = next.layers.length - 1;
    setStep({ layer: layerI, i: 0, phase: 'build' });
    setAnim({ type: 'tier', layer: layerI });
    setTip('A new tier! Pick its batter.');
    moveBelt();
  }

  function finish() {
    setModal(false);
    if (!cake.lettering && pendingLetter) update((c) => { c.lettering = pendingLetter; });
    go({ layer: step.layer, i: 0, phase: 'finish' });
    moveBelt();
  }

  // ---- panel ----
  function tile(item: MenuItem, selected: boolean, onPick: () => void, extra?: React.ReactNode) {
    const pic = itemArt(item.id);
    const visual = pic ? <span className="em"><Art src={pic} size={44} /></span>
      : item.e ? <span className="em">{item.e}</span> : <span className="sw" style={{ background: item.color }} />;
    if (item.locked) {
      return (
        <button key={item.id} className="tile locked" aria-label={`${item.name}, locked. ${item.locked}`}
          onClick={() => { toast(`${item.name}: ${item.locked}`); blip(180, 0.1); }}>
          <span className="lk" aria-hidden="true">🔒</span>{visual}{item.name}<span className="why">Why?</span>
        </button>
      );
    }
    return (
      <button key={item.id} className="tile" aria-pressed={selected} onClick={onPick}>
        {extra}{visual}{item.name}{item.ko && <span className="ko">{item.ko}</span>}
        <span className="pr">{item.price ? '+' + won(item.price) : 'Included'}</span>
      </button>
    );
  }

  function panel() {
    const { shapes, sizes, rules } = ix.catalog;
    if (st === 'pan') return <div className="grid">{shapes.map((s) => (
      <button key={s.id} className="tile" aria-pressed={cake.shape === s.id} onClick={() => pick(s.id)}><span className="em"><Art src={`shapes/${s.id}`} size={44} /></span>{s.name}</button>
    ))}</div>;
    if (st === 'size') return <div className="grid">{sizes.map((s) => (
      <button key={s.id} className="tile" aria-pressed={cake.size === s.id} onClick={() => pick(s.id)}>
        <span className="em"><Art src={`sizes/${s.id}`} size={44} /></span>{s.name}<span className="ko">{s.people}</span><span className="pr">{won(s.price * bakery.mult)}</span>
      </button>
    ))}</div>;
    if (st === 'batter') return <div className="grid">{bakery.menu.batters.map((x) => tile(x, L.batter === x.id, () => pick(x.id)))}</div>;
    if (st === 'oven') return (
      <>
        <p className="muted" style={{ marginTop: 8 }}>{L.baked ? 'Baked and golden. Move on to the cream.' : `Your ${(L.batter && ix.byId[L.batter]?.name.toLowerCase()) || ''} batter is ready.`}</p>
        {!L.baked && <div className="bigaction"><button className="btn pink" onClick={bake} disabled={!!busy}>🔥 Bake it</button></div>}
      </>
    );
    if (st === 'frosting') return <div className="grid">{bakery.menu.frostings.map((x) => tile(x, L.frosting === x.id, () => pick(x.id)))}</div>;
    if (st === 'toppings') {
      const counts: Record<string, number> = {};
      L.toppings.forEach((t) => { counts[t.id] = (counts[t.id] ?? 0) + 1; });
      return (
        <>
          <p className="muted small" style={{ margin: '4px 0 0' }}>{L.toppings.length} of {rules.maxToppingsPerLayer} on this layer. Tap a topping on the cake to remove it</p>
          <div className="grid">{bakery.menu.toppings.map((x) => tile(x, !!counts[x.id], () => addTopping(x.id), counts[x.id] ? <span className="cnt">{counts[x.id]}</span> : undefined))}</div>
        </>
      );
    }
    if (st === 'lettering') return (
      <div className="stack" style={{ marginTop: 10 }}>
        <input className="textin" maxLength={rules.maxLettering} placeholder="Happy Birthday!" aria-label="Message on the cake"
          value={cake.lettering} onChange={(e) => { setLetterShown(null); update((c) => { c.lettering = e.target.value.slice(0, rules.maxLettering); }); }} />
        <div className="chips">{LETTER_IDEAS.map((t) => <button key={t} className="chip" onClick={() => typeLetters(t)}>{t}</button>)}</div>
        <p className="muted small">+{won(rules.letteringPrice)} for lettering. Leave empty for none.</p>
      </div>
    );
    return <div className="bigaction"><button className="btn pink" onClick={boxIt} disabled={!!busy}>🎁 Box it up</button></div>;
  }

  const ci = ALL_STATIONS.indexOf(st);
  const bubble = tip ?? info.tip;

  return (
    <>
      <div className="kit-top">
        <nav className="stations" aria-label="Kitchen stations">
          {ALL_STATIONS.map((k, j) => (
            <div key={k} className={`st ${k === st ? 'on' : ''} ${j < ci ? 'done' : ''}`} aria-current={k === st ? 'step' : undefined}>
              <b><Art src={`stations/${STATION_INFO[k].icon}`} size={26} /></b>{STATION_INFO[k].label}
            </div>
          ))}
        </nav>
        <div className="stage">
          <div className="tiles" /><div className="window" />
          <div className="shelf"><span style={{ left: 6 }}>🫙</span><span style={{ left: 38 }}>🥄</span><span style={{ left: 66 }}>🧂</span></div>
          <div className="halmeoni"><div className="face"><Art src={st === 'box' ? 'misc/grandma-proud' : 'misc/grandma'} size={40} /></div><div key={bubble} className="bubble" aria-live="polite">{bubble}</div></div>
          <div key={`belt${beltKey}`} className={`belt ${beltKey ? 'moving' : ''}`} />
          <div key={`wrap${beltKey}`} className={`cake-wrap ${beltKey ? 'slide' : ''}`}>
            <CakeView ix={ix} cake={cake} anim={anim} letterShown={letterShown} onRemoveTopping={removeTopping} />
          </div>
          {comboKey > 0 && <div key={comboKey} className="combo">COMBO!</div>}
          {busy === 'oven' && (
            <div className="overlay"><div className="oven"><div className="knobs"><i /><i /></div><div className="timer">0:0{ovenLeft}</div><div className="door" /></div></div>
          )}
          {busy === 'box' && <div className="overlay"><div className="box-front" /><div className="box-lid" /><div className="box-bow"><Art src="misc/ribbon-bow" size={70} /></div></div>}
        </div>
      </div>

      <section className="panel">
        <h2>{info.title}{step.phase === 'build' && cake.layers.length > 1 && <span className="muted small"> (layer {step.layer + 1})</span>}</h2>
        {panel()}
      </section>

      <div className="bar"><div className="bar-in">
        <button className="btn ghost sm" onClick={goBack} aria-label="Back">←</button>
        <div className="price"><span>{bakery.name}</span><b>{won(price)}</b></div>
        <button className="btn" onClick={advance} disabled={!canNext()}>{st === 'toppings' ? 'Done' : 'Next'}</button>
      </div></div>

      {modal && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }} onKeyDown={(e) => { if (e.key === 'Escape') setModal(false); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Add another layer">
            <h2>Add another layer?</h2>
            <p className="muted">{cake.layers.length < bakery.maxLayers
              ? `A smaller tier goes on top (+${won(ix.catalog.rules.extraLayerPrice)}). ${bakery.name} makes up to ${bakery.maxLayers} layers.`
              : `${bakery.name} makes up to ${bakery.maxLayers} layers, so this is the top.`}</p>
            <div className="stack">
              {cake.layers.length < bakery.maxLayers && <button className="btn" onClick={addLayer}>Add a layer</button>}
              <button className="btn pink" onClick={finish} autoFocus>Finish and write a message</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
