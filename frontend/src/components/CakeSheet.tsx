'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { won } from '@/lib/format';
import { fitPresetToMenu, presetCake, type CatalogIndex } from '@/lib/rules';
import { useCakeStore } from '@/store/useCakeStore';
import { useCartStore } from '@/store/useCartStore';
import { CakeView } from './CakeView';
import { useToast } from './Providers';
import { OptionChips } from './ui';
import type { Bakery, CakeDesign, Quote } from '@/lib/types';

export interface SheetCake { name: string; desc: string; batter: string; frosting: string; toppings: string[] }

/** Bottom sheet for a ready-made cake: pick a bakery and size, see the server's price, add to cart. */
export function CakeSheet({ ix, item, onClose }: { ix: CatalogIndex; item: SheetCake; onClose: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const opts = useCakeStore((s) => s.opts);
  const { setBakery, setCake, setStep, setKitchenTip, choosePreset } = useCakeStore();
  const add = useCartStore((s) => s.add);
  const [bakeries, setBakeries] = useState<Bakery[] | null>(null);
  const [bakeryId, setBakeryId] = useState<string | null>(null);
  const [size, setSize] = useState('m');
  const [cake, setFitted] = useState<CakeDesign | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    document.body.classList.add('locked');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('locked'); window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  // Bakeries that can make a cake for the chosen dietary options.
  useEffect(() => {
    let alive = true;
    setBakeries(null);
    api.bakeries(opts)
      .then((r) => {
        if (!alive) return;
        setBakeries(r.bakeries);
        setBakeryId((cur) => (cur && r.bakeries.some((b) => b.id === cur) ? cur : r.bakeries[0]?.id ?? null));
      })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? e.message : 'Could not load bakeries.'); });
    return () => { alive = false; };
  }, [opts]);

  // Fit the recipe to that bakery's menu, then let the server price it.
  useEffect(() => {
    if (!bakeryId) return;
    let alive = true;
    setQuote(null);
    setError(null);
    api.bakery(bakeryId, opts)
      .then((b) => {
        const fitted = { ...fitPresetToMenu(presetCake(item), b.menu), size };
        if (alive) setFitted(fitted);
        return api.quote(bakeryId, fitted, opts);
      })
      .then((q) => { if (alive) setQuote(q); })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? e.message : 'Could not price this cake.'); });
    return () => { alive = false; };
  }, [bakeryId, size, opts, item]);

  const bakery = bakeries?.find((b) => b.id === bakeryId);
  const changed = !!cake && (cake.layers[0]?.batter !== item.batter || cake.layers[0]?.frosting !== item.frosting
    || cake.layers[0]?.toppings.length !== item.toppings.length);

  function addToCart() {
    if (!quote || !bakery) return;
    add({ name: item.name, bakeryId: bakery.id, bakeryName: bakery.name, cake: quote.cake, opts, total: quote.total });
    toast(`${item.name} is in your cart.`);
    onClose();
  }

  function playIt() {
    if (!cake || !bakery) return;
    choosePreset({ name: item.name, reason: item.desc, batter: item.batter, frosting: item.frosting, toppings: item.toppings });
    setBakery(bakery.id);
    setCake({ ...cake, lettering: '' });
    setStep({ layer: 0, i: 5, phase: 'build' });
    setKitchenTip(`Here's “${item.name}”. Change anything you like, dear.`);
    router.push('/kitchen');
  }

  return (
    <div className="sheet-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet stack" role="dialog" aria-modal="true" aria-label={item.name}>
        <div className="grab" aria-hidden="true" />
        <button ref={closeRef} className="sr-only" onClick={onClose}>Close</button>
        <div className="pic"><CakeView ix={ix} cake={cake ?? presetCake(item)} label={item.name} crop /></div>
        <div>
          <h2>{item.name}</h2>
          <p className="muted it" style={{ margin: 0 }}>{item.desc}</p>
        </div>

        <div><h3 style={{ marginTop: 4 }}>Anything to avoid?</h3><OptionChips /></div>

        <div>
          <h3 style={{ marginTop: 4 }}>Size</h3>
          <div className="chips" role="group" aria-label="Size">
            {ix.catalog.sizes.map((s) => (
              <button key={s.id} className="chip" aria-pressed={size === s.id} onClick={() => setSize(s.id)}>{s.name} · {s.people}</button>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginTop: 4 }}>Bakery</h3>
          {!bakeries && !error && <p className="muted it">Finding bakeries…</p>}
          {bakeries && !bakeries.length && <p className="err">No bakery can make a cake for these options yet. Try removing one.</p>}
          <div className="pick" role="group" aria-label="Bakery">
            {bakeries?.map((b) => (
              <button key={b.id} aria-pressed={bakeryId === b.id} onClick={() => setBakeryId(b.id)}>
                <b>{b.name}</b><span>{b.area} · ready {b.lead.toLowerCase()} · {b.delivery ? 'delivery or pickup' : 'pickup only'}</span>
              </button>
            ))}
          </div>
        </div>

        {changed && bakery && <p className="muted it small" style={{ margin: 0 }}>Adjusted to what {bakery.name} can make for your options.</p>}
        {error && <p className="err" role="alert">{error}</p>}

        <div className="cart-total" style={{ margin: '4px 6px 0' }}>
          <span>Total <small className="muted">(guest −{Math.round(ix.catalog.rules.guestDiscount * 100)}%)</small></span>
          <b>{quote ? won(quote.total) : '…'}</b>
        </div>
        <button className="btn" onClick={addToCart} disabled={!quote || !bakery}>Add to cart</button>
        <button className="btn ghost" onClick={playIt} disabled={!cake || !bakery}>Change it in the game</button>
      </div>
    </div>
  );
}
