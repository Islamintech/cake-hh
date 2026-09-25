'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { won } from '@/lib/format';
import { blip } from '@/lib/sound';
import type { CatalogIndex } from '@/lib/rules';
import { useCakeStore } from '@/store/useCakeStore';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/components/Providers';
import { Art } from '@/components/Art';
import { CakeView } from '@/components/CakeView';
import { ErrorCard, Loading, Ready } from '@/components/ui';
import type { BakeryDetail, Quote } from '@/lib/types';

export default function ResultPage() {
  return <Ready>{(ix) => <Result ix={ix} />}</Ready>;
}

const CONFETTI = ['#FF6FA5', '#FFD45E', '#4FC79C', '#7B45B0', '#6FC3FF'];

function Result({ ix }: { ix: CatalogIndex }) {
  const router = useRouter();
  const toast = useToast();
  const { cake, bakeryId, opts, preset, setStep, startFresh } = useCakeStore();
  const addToCart = useCartStore((s) => s.add);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [bakery, setBakeryInfo] = useState<BakeryDetail | null>(null);
  const [error, setError] = useState<{ message: string; details: string[] } | null>(null);

  useEffect(() => {
    if (!bakeryId) { router.replace('/bakeries'); return; }
    // Cleared after "Add to cart" while we navigate away: nothing to price.
    if (!cake.shape) return;
    // The server re-validates the whole design and prices it: this is the price the order will use.
    Promise.all([api.quote(bakeryId, cake, opts), api.bakery(bakeryId, opts)])
      .then(([q, b]) => {
        setQuote(q);
        setBakeryInfo(b);
        setTimeout(() => { blip(523, 0.1); setTimeout(() => blip(659, 0.1), 110); setTimeout(() => blip(784, 0.2), 220); }, 200);
      })
      .catch((e: unknown) => setError({
        message: e instanceof ApiError ? e.message : 'Could not price your cake.',
        details: e instanceof ApiError && Array.isArray(e.details) ? (e.details as unknown[]).map(String) : [],
      }));
  }, [bakeryId, cake, opts, router]);

  const confetti = useMemo(() => Array.from({ length: 22 }, (_, i) => (
    <i key={i} style={{ left: `${(i * 37) % 100}%`, background: CONFETTI[i % 5], animationDelay: `${(i % 7) * 0.08}s` }} />
  )), []);

  const toCart = () => {
    if (!quote || !bakery) return;
    const name = preset ? preset.name : 'My custom cake';
    addToCart({ name, bakeryId: bakery.id, bakeryName: bakery.name, cake: quote.cake, opts, total: quote.total });
    toast(`Added ${name} to cart`);
    startFresh();
    router.push('/cart');
  };

  const editCake = () => { setStep({ layer: cake.layers.length - 1, i: 0, phase: 'finish' }); router.push('/kitchen'); };

  if (error) {
    return (
      <div className="pad stack">
        <ErrorCard title="This cake can't be ordered yet" message={error.message} />
        {error.details.length > 1 && <ul className="muted small">{error.details.map((d) => <li key={d}>{d}</li>)}</ul>}
        <button className="btn" onClick={editCake}>Change something</button>
      </div>
    );
  }
  if (!quote || !bakery) return <Loading label="Checking your cake with the bakery…" />;

  const s = quote.stats;
  const shape = ix.catalog.shapes.find((x) => x.id === quote.cake.shape)?.name;
  const size = ix.catalog.sizes.find((x) => x.id === quote.cake.size);

  return (
    <>
      <div className="result-stage">
        <div className="tiles" />
        <div className="confetti" aria-hidden="true">{confetti}</div>
        <div className="cake-wrap"><div className="spin" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <CakeView ix={ix} cake={quote.cake} label="Your finished cake" />
        </div></div>
      </div>
      <div className="pad stack">
        <div>
          <h2>Your cake is ready to order</h2>
          <div className="stars">
            <div className="star"><b style={{ animationDelay: '.9s' }}><Art src="misc/star-badge" size={40} /></b>Safe for you</div>
            <div className={`star ${s.taste ? '' : 'off'}`}><b style={{ animationDelay: '1.1s' }}><Art src="misc/star-badge" size={40} /></b>{s.taste ? 'Tasty combo' : 'Odd combo'}</div>
            <div className={`star ${s.goal ? '' : 'off'}`}><b style={{ animationDelay: '1.3s' }}><Art src="misc/star-badge" size={40} /></b>{s.lowSugar ? (s.goal ? 'Low sugar' : 'Too sweet') : 'Looks great'}</div>
          </div>
          <div className="stats">
            <div className="stat"><b>{s.kcal}</b><span>kcal</span></div>
            <div className="stat"><b>{s.sugar}g</b><span>sugar</span></div>
            <div className="stat"><b>{s.protein}g</b><span>protein</span></div>
            <div className="stat"><b>{s.match}%</b><span>match</span></div>
          </div>
          <p className="muted small">Per slice, estimated. Real values depend on the bakery&apos;s recipe.</p>
        </div>
        <div className="card">
          <b>{shape}, for {size?.people}</b>
          <div className="ing">
            {quote.description.map((d) => <div key={d}>{d}</div>)}
            {quote.cake.lettering && <div>Message: “{quote.cake.lettering}”</div>}
          </div>
        </div>
        <div className="rows">
          <div><span>Cake</span><span>{won(quote.subtotal)}</span></div>
          <div className="disc"><span>Guest order, no signup (−{Math.round(ix.catalog.rules.guestDiscount * 100)}%)</span><span>−{won(quote.discount)}</span></div>
          <div className="tot"><span>Total</span><span>{won(quote.total)}</span></div>
        </div>
        <button className="btn" onClick={toCart}>Add to cart</button>
        <button className="btn ghost" onClick={editCake}>Change something</button>
      </div>
    </>
  );
}
