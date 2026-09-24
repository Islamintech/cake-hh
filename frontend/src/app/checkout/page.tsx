'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { won } from '@/lib/format';
import { rememberOrder } from '@/lib/myOrders';
import type { CatalogIndex } from '@/lib/rules';
import { useCakeStore } from '@/store/useCakeStore';
import { useToast } from '@/components/Providers';
import { ErrorCard, Loading, Ready } from '@/components/ui';
import type { BakeryDetail, Quote } from '@/lib/types';

export default function CheckoutPage() {
  return <Ready>{(ix) => <Checkout ix={ix} />}</Ready>;
}

function Checkout({ ix }: { ix: CatalogIndex }) {
  const router = useRouter();
  const toast = useToast();
  const { cake, bakeryId, opts, ai, preset, form, setForm } = useCakeStore();
  const [bakery, setBakery] = useState<BakeryDetail | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formErr, setFormErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!bakeryId) { router.replace('/bakeries'); return; }
    Promise.all([api.bakery(bakeryId, opts), api.quote(bakeryId, cake, opts)])
      .then(([b, q]) => {
        setBakery(b);
        setQuote(q);
        // Default to the earliest possible day; fix a stale date from an earlier visit.
        const f = useCakeStore.getState().form;
        if (!f.date || f.date < b.earliestDate) setForm({ date: b.earliestDate });
        if (!b.delivery && f.mode === 'delivery') setForm({ mode: 'pickup' });
      })
      .catch((e: unknown) => setLoadError(e instanceof ApiError ? e.message : 'Could not load checkout.'));
  }, [bakeryId, cake, opts, router, setForm]);

  if (loadError) return <div className="pad stack"><ErrorCard title="Checkout unavailable" message={loadError} /><Link className="btn ghost" href="/result">Back</Link></div>;
  if (!bakery || !quote) return <Loading label="Preparing checkout…" />;

  async function pay(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setFormErr('Add your name so the bakery knows whose cake it is.');
    if (!/^[0-9+\-\s]{9,15}$/.test(form.phone.trim())) return setFormErr('Add a phone number like 010-1234-5678. We text your tracking link there.');
    if (form.mode === 'delivery' && !form.addr.trim()) return setFormErr('Add a delivery address, or switch to pickup.');
    setFormErr('');
    setBusy(true);
    try {
      const { order, trackingToken } = await api.placeOrder({
        bakeryId: bakery!.id,
        cake,
        options: opts,
        customer: { name: form.name.trim(), phone: form.phone.trim(), mode: form.mode, addr: form.mode === 'delivery' ? form.addr.trim() : '' },
        date: form.date,
        time: form.time,
        ...(preset || ai.cravings.length || ai.occasion ? { tasteProfile: { occasion: ai.occasion, cravings: ai.cravings, sweet: ai.sweet } } : {}),
      });
      rememberOrder(order.code, trackingToken);
      toast('Order placed. Tracking link sent by text (demo).');
      router.push(`/track/${order.code}?t=${encodeURIComponent(trackingToken)}`);
    } catch (err) {
      setFormErr(err instanceof ApiError ? err.message : 'Could not place the order. Try again.');
      setBusy(false);
    }
  }

  return (
    <form className="pad stack" onSubmit={(e) => void pay(e)} noValidate>
      <div><h2>Checkout</h2><p className="muted">No account needed. We&apos;ll text you a link to follow your cake.</p></div>
      <label className="f">Your name
        <input className="textin" autoComplete="name" value={form.name} onChange={(e) => setForm({ name: e.target.value })} maxLength={40} />
      </label>
      <label className="f">Phone number
        <input className="textin" type="tel" autoComplete="tel" placeholder="010-1234-5678" value={form.phone} onChange={(e) => setForm({ phone: e.target.value })} />
      </label>
      <div className="seg" role="group" aria-label="Pickup or delivery">
        <button type="button" className="chip" aria-pressed={form.mode === 'pickup'} onClick={() => setForm({ mode: 'pickup' })}>Pickup</button>
        <button type="button" className="chip" aria-pressed={form.mode === 'delivery'} disabled={!bakery.delivery} onClick={() => setForm({ mode: 'delivery' })}>
          {bakery.delivery ? 'Delivery' : 'Delivery (not offered)'}
        </button>
      </div>
      {form.mode === 'delivery'
        ? <label className="f">Delivery address<input className="textin" autoComplete="street-address" value={form.addr} onChange={(e) => setForm({ addr: e.target.value })} maxLength={200} /></label>
        : <p className="muted small">Pick up at {bakery.name}, {bakery.area}.</p>}
      <div className="seg">
        <label className="f">Date<input className="textin" type="date" min={bakery.earliestDate} value={form.date} onChange={(e) => setForm({ date: e.target.value })} /></label>
        <label className="f">Time
          <select className="textin" value={form.time} onChange={(e) => setForm({ time: e.target.value })}>
            {ix.catalog.timeSlots.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <p className="muted small">Kitchens may handle other ingredients, so cross-contact is possible.</p>
      {formErr && <p className="err" role="alert">{formErr}</p>}
      <button type="submit" className="btn pink" disabled={busy}>{busy ? 'Placing order…' : `Pay ${won(quote.total)} (demo)`}</button>
      <Link className="btn ghost" href="/result">Back</Link>
    </form>
  );
}
