'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { api, ApiError, watchOrder } from '@/lib/api';
import { won } from '@/lib/format';
import { tokenFor } from '@/lib/myOrders';
import type { CatalogIndex } from '@/lib/rules';
import { useCakeStore } from '@/store/useCakeStore';
import { Art } from '@/components/Art';
import { CakeView } from '@/components/CakeView';
import { useToast } from '@/components/Providers';
import { ErrorCard, Loading, Ready } from '@/components/ui';
import type { Order } from '@/lib/types';

export default function TrackPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return <Suspense fallback={<Loading />}><Ready>{(ix) => <Track ix={ix} />}</Ready></Suspense>;
}

function Track({ ix }: { ix: CatalogIndex }) {
  const router = useRouter();
  const toast = useToast();
  const code = String(useParams<{ code: string }>().code).toUpperCase();
  const token = useSearchParams().get('t') ?? tokenFor(code) ?? '';
  const startFresh = useCakeStore((s) => s.startFresh);
  const setStep = useCakeStore((s) => s.setStep);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!token) { setError('This tracking link is missing its secret part. Use the link from your text message.'); return; }
    let alive = true;
    api.trackOrder(code, token)
      .then((r) => { if (alive) setOrder(r.order); })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? e.message : 'Could not load your order.'); });
    // Live updates; EventSource reconnects on its own after a drop.
    const stop = watchOrder(code, token, (o) => { if (alive) { setOrder(o); setLive(true); } }, () => { if (alive) setLive(false); });
    return () => { alive = false; stop(); };
  }, [code, token]);

  if (error) return <div className="pad"><ErrorCard title="Order not found" message={error} /></div>;
  if (!order) return <Loading label="Loading your order…" />;

  const idx = order.steps.findIndex((s) => s.id === order.status);

  const share = () => {
    const text = 'I built this cake in a game and a real bakery baked it! 🎂';
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else toast('Sharing works from the phone app (demo).');
  };
  const anotherBakery = () => { setStep({ layer: order.cake.layers.length - 1, i: 0, phase: 'finish' }); router.push('/bakeries'); };

  return (
    <div className="pad stack">
      <div>
        <h2>Order {order.code}</h2>
        <p className="muted">{order.customer.mode === 'delivery' ? `Delivery from ${order.bakeryName}` : `Pickup at ${order.bakeryName}`} on {order.date} at {order.time}.</p>
        <span className={`live ${live ? '' : 'off'}`}><i />{live ? 'Live' : 'Reconnecting…'}</span>
      </div>

      {order.status === 'declined' ? (
        <div className="card">
          <b>The bakery couldn&apos;t take this order.</b>
          <p className="muted">You haven&apos;t been charged. Try another bakery with the same design.</p>
          <button className="btn sm" onClick={anotherBakery}>Choose another bakery</button>
        </div>
      ) : (
        <ol className="steps">
          {order.steps.map((s, j) => (
            <li key={s.id} className={j < idx ? 'done' : j === idx ? 'now' : ''}>
              <span className="dot">{j < idx ? '✓' : <Art src={`status/${s.id}`} size={28} />}</span>{s.label}
            </li>
          ))}
        </ol>
      )}

      {order.photo ? (
        <>
          <h3>Virtual vs real</h3>
          <div className="vs">
            <figure><div className="pixel"><CakeView ix={ix} cake={order.cake} label="Your design" /></div><figcaption>You built this</figcaption></figure>
            <figure>
              <div className="photo">
                {order.photoUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={order.photoUrl} alt={`Photo from ${order.bakeryName}`} style={{ width: '100%', borderRadius: 10 }} />
                  : <CakeView ix={ix} cake={order.cake} label={`Photo from ${order.bakeryName}`} />}
              </div>
              <figcaption>Photo from {order.bakeryName}</figcaption>
            </figure>
          </div>
          <button className="btn sm ghost" onClick={share}>Share this</button>
        </>
      ) : (
        <>
          <div className="card suggest">
            <div className="mini"><CakeView ix={ix} cake={order.cake} label="Your design" crop /></div>
            <div className="ing">{order.description.map((d) => <div key={d}>{d}</div>)}<b>Total {won(order.total)}</b></div>
          </div>
          <p className="muted small">The bakery sends a real photo when your cake is ready.</p>
        </>
      )}

      <p className="muted small">Demo: open the menu, then <b>For bakeries</b>, in another tab to accept and update this order. This page updates live.</p>
      <button className="btn ghost" onClick={() => { startFresh(); router.push('/'); }}>Build another cake</button>
    </div>
  );
}
