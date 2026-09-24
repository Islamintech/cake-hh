'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { won } from '@/lib/format';
import { rememberOrder } from '@/lib/myOrders';
import type { CatalogIndex } from '@/lib/rules';
import { useCakeStore } from '@/store/useCakeStore';
import { useCartStore, type CartItem } from '@/store/useCartStore';
import { useToast } from '@/components/Providers';
import { ErrorCard, Loading, Ready } from '@/components/ui';
import type { BakeryDetail, Quote } from '@/lib/types';

export default function CheckoutPage() {
  return <Ready>{(ix) => <Checkout ix={ix} />}</Ready>;
}

interface Line { item: CartItem; bakery: BakeryDetail; quote: Quote }

/** Guest checkout for the whole cart: one order per cake, same contact details and time. */
function Checkout({ ix }: { ix: CatalogIndex }) {
  const router = useRouter();
  const toast = useToast();
  const items = useCartStore((s) => s.items);
  const remove = useCartStore((s) => s.remove);
  const setProfile = useCartStore((s) => s.setProfile);
  const { form, setForm, ai } = useCakeStore();
  const [lines, setLines] = useState<Line[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formErr, setFormErr] = useState('');
  const [busy, setBusy] = useState(false);

  // Fill the form from saved details the first time.
  useEffect(() => {
    const f = useCakeStore.getState().form;
    const p = useCartStore.getState().profile;
    setForm({ name: f.name || p.name, phone: f.phone || p.phone, addr: f.addr || p.addr });
  }, [setForm]);

  // Re-check every cake with the server: it may have changed since it went in the cart.
  const keys = items.map((x) => x.key).join(',');
  useEffect(() => {
    if (busy) return;
    const current = useCartStore.getState().items;
    if (!current.length) { router.replace('/cart'); return; }
    let alive = true;
    Promise.all(current.map(async (item) => {
      const [bakery, quote] = await Promise.all([api.bakery(item.bakeryId, item.opts), api.quote(item.bakeryId, item.cake, item.opts)]);
      return { item, bakery, quote };
    }))
      .then((l) => {
        if (!alive) return;
        setLines(l);
        const earliest = l.reduce((d, x) => (x.bakery.earliestDate > d ? x.bakery.earliestDate : d), '');
        const f = useCakeStore.getState().form;
        if (!f.date || f.date < earliest) setForm({ date: earliest });
        if (l.some((x) => !x.bakery.delivery) && f.mode === 'delivery') setForm({ mode: 'pickup' });
      })
      .catch((e: unknown) => { if (alive) setLoadError(e instanceof ApiError ? e.message : 'Could not load checkout.'); });
    return () => { alive = false; };
  }, [keys, router, setForm]);

  if (loadError) return <div className="pad stack"><ErrorCard title="Checkout unavailable" message={loadError} /><Link className="btn ghost" href="/cart">Back to cart</Link></div>;
  if (!lines) return <Loading label="Preparing checkout…" />;

  const earliest = lines.reduce((d, x) => (x.bakery.earliestDate > d ? x.bakery.earliestDate : d), '');
  const canDeliver = lines.every((x) => x.bakery.delivery);
  const total = lines.reduce((n, x) => n + x.quote.total, 0);
  const pickups = [...new Set(lines.map((x) => `${x.bakery.name}, ${x.bakery.area}`))];

  async function pay(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setFormErr('Add your name so the bakery knows whose cake it is.');
    if (!/^[0-9+\-\s]{9,15}$/.test(form.phone.trim())) return setFormErr('Add a phone number like 010-1234-5678. We text your tracking link there.');
    if (form.mode === 'delivery' && !form.addr.trim()) return setFormErr('Add a delivery address, or switch to pickup.');
    setFormErr('');
    setBusy(true);
    setProfile({ name: form.name.trim(), phone: form.phone.trim(), ...(form.addr.trim() ? { addr: form.addr.trim() } : {}) });
    const placed: { code: string; token: string }[] = [];
    try {
      // One at a time, so a failure leaves the unplaced cakes in the cart.
      for (const { item } of lines!) {
        const { order, trackingToken } = await api.placeOrder({
          bakeryId: item.bakeryId,
          cake: item.cake,
          options: item.opts,
          customer: { name: form.name.trim(), phone: form.phone.trim(), mode: form.mode, addr: form.mode === 'delivery' ? form.addr.trim() : '' },
          date: form.date,
          time: form.time,
          ...(ai.cravings.length || ai.occasion ? { tasteProfile: { occasion: ai.occasion, cravings: ai.cravings, sweet: ai.sweet } } : {}),
        });
        rememberOrder(order.code, trackingToken);
        remove(item.key);
        placed.push({ code: order.code, token: trackingToken });
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not place the order. Try again.';
      // Drop the placed cakes so trying again can't order them twice.
      if (placed.length) setLines((l) => l && l.filter((x) => useCartStore.getState().items.some((i) => i.key === x.item.key)));
      setFormErr(placed.length ? `${placed.length} order(s) placed. The next one failed: ${msg}` : msg);
      setBusy(false);
      return;
    }
    toast(placed.length > 1 ? `${placed.length} orders placed. Tracking links sent by text (demo).` : 'Order placed. Tracking link sent by text (demo).');
    const only = placed.length === 1 ? placed[0] : null;
    router.push(only ? `/track/${only.code}?t=${encodeURIComponent(only.token)}` : '/orders');
  }

  return (
    <form className="pad stack" onSubmit={(e) => void pay(e)} noValidate>
      <h1 className="title" style={{ marginBottom: 6 }}>Checkout</h1>
      <p className="muted it" style={{ textAlign: 'center' }}>No account needed. We&apos;ll text you a link to follow your cake.</p>

      <ul className="rows" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {lines.map((x) => <li key={x.item.key}><span>{x.item.name} · {x.bakery.name}</span><span>{won(x.quote.total)}</span></li>)}
        <li className="tot"><span>Total</span><span>{won(total)}</span></li>
      </ul>

      <div className="fields" style={{ gap: 16 }}>
        <label className="f">Your name
          <input className="pill-in" autoComplete="name" value={form.name} onChange={(e) => setForm({ name: e.target.value })} maxLength={40} />
        </label>
        <label className="f">Phone number
          <input className="pill-in" type="tel" autoComplete="tel" placeholder="010-1234-5678" value={form.phone} onChange={(e) => setForm({ phone: e.target.value })} />
        </label>
        <div className="seg" role="group" aria-label="Pickup or delivery">
          <button type="button" className="chip" aria-pressed={form.mode === 'pickup'} onClick={() => setForm({ mode: 'pickup' })}>Pickup</button>
          <button type="button" className="chip" aria-pressed={form.mode === 'delivery'} disabled={!canDeliver} onClick={() => setForm({ mode: 'delivery' })}>
            {canDeliver ? 'Delivery' : 'No delivery'}
          </button>
        </div>
        {form.mode === 'delivery'
          ? <label className="f">Delivery address<input className="pill-in" autoComplete="street-address" value={form.addr} onChange={(e) => setForm({ addr: e.target.value })} maxLength={200} /></label>
          : <p className="muted it small" style={{ margin: 0 }}>Pick up at {pickups.join(' and ')}.{!canDeliver && ' Delivery isn’t offered by every bakery in your cart.'}</p>}
        <div className="seg">
          <label className="f">Date<input className="pill-in" type="date" min={earliest} value={form.date} onChange={(e) => setForm({ date: e.target.value })} /></label>
          <label className="f">Time
            <select className="pill-in" value={form.time} onChange={(e) => setForm({ time: e.target.value })}>
              {ix.catalog.timeSlots.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
      </div>
      <p className="muted small it">Kitchens may handle other ingredients, so cross-contact is possible.</p>
      {formErr && <p className="err" role="alert">{formErr}</p>}
      <button type="submit" className="btn" disabled={busy}>{busy ? 'Placing order…' : `Pay ${won(total)} (demo)`}</button>
      <Link className="btn ghost" href="/cart">Back to cart</Link>
    </form>
  );
}
