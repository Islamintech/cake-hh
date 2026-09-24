'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, ApiError, watchBakeryOrders } from '@/lib/api';
import { won } from '@/lib/format';
import { blip } from '@/lib/sound';
import type { CatalogIndex } from '@/lib/rules';
import { CakeView } from '@/components/CakeView';
import { useToast } from '@/components/Providers';
import { Ready } from '@/components/ui';
import type { Order, OrderStatus, Staff } from '@/lib/types';

const KEY_STORAGE = 'ck-bakery-key';

const STATUS_LABEL: Record<OrderStatus, string> = {
  received: 'New', accepted: 'Accepted', baking: 'Baking', ready: 'Ready', delivering: 'On the way', delivered: 'Delivered', pickedup: 'Picked up', declined: 'Declined',
};
const ACTION_LABEL: Record<OrderStatus, string> = {
  accepted: 'Accept', declined: 'Decline', baking: 'Start baking', ready: 'Mark ready + send photo',
  delivering: 'Out for delivery', delivered: 'Delivered', pickedup: 'Picked up', received: 'Reopen',
};

export default function BakeryPage() {
  return <Ready>{(ix) => <Dashboard ix={ix} />}</Ready>;
}

function Dashboard({ ix }: { ix: CatalogIndex }) {
  const [key, setKey] = useState<string | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [checked, setChecked] = useState(false);

  // Restore a saved key (and check it's still valid).
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(KEY_STORAGE); } catch { /* ignore */ }
    if (!saved) { setChecked(true); return; }
    api.staff(saved)
      .then((s) => { setKey(saved); setStaff(s); })
      .catch(() => { try { localStorage.removeItem(KEY_STORAGE); } catch { /* ignore */ } })
      .finally(() => setChecked(true));
  }, []);

  const signOut = () => { try { localStorage.removeItem(KEY_STORAGE); } catch { /* ignore */ } setKey(null); setStaff(null); };

  if (!checked) return null;
  if (!key || !staff) return <SignIn onSignedIn={(k, s) => { setKey(k); setStaff(s); }} />;
  return <Orders ix={ix} bakeryKey={key} staff={staff} onSignOut={signOut} />;
}

function SignIn({ onSignedIn }: { onSignedIn: (key: string, staff: Staff) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const k = value.trim();
    if (!k) return;
    setBusy(true);
    setError('');
    try {
      const s = await api.staff(k);
      try { localStorage.setItem(KEY_STORAGE, k); } catch { /* ignore */ }
      onSignedIn(k, s);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? "That key didn't work." : err instanceof ApiError ? err.message : 'Could not sign in.');
      setBusy(false);
    }
  }

  return (
    <form className="pad stack" onSubmit={(e) => void submit(e)}>
      <div><h2>Bakery sign-in</h2><p className="muted">Enter your bakery key to see and update your orders.</p></div>
      <label className="f">Bakery key
        <input className="textin" type="password" autoComplete="current-password" value={value} onChange={(e) => setValue(e.target.value)} />
      </label>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={busy || !value.trim()}>{busy ? 'Checking…' : 'Open dashboard'}</button>
      <p className="muted small">
        Local demo keys (printed by the backend at startup): <span className="kbd">dev-admin-key</span> sees every bakery;{' '}
        <span className="kbd">dev-bakery-s1</span> sees only Seoul Sugar Studio.
      </p>
    </form>
  );
}

function Orders({ ix, bakeryKey, staff, onSignOut }: { ix: CatalogIndex; bakeryKey: string; staff: Staff; onSignOut: () => void }) {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [live, setLive] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const upsert = useCallback((o: Order) => {
    setOrders((list) => {
      const rest = (list ?? []).filter((x) => x.code !== o.code);
      return [o, ...rest].sort((a, b) => b.createdAt - a.createdAt);
    });
  }, []);

  useEffect(() => {
    const stop = watchBakeryOrders(bakeryKey, {
      snapshot: (list) => { setOrders(list); setLive(true); },
      order: (o) => { upsert(o); setLive(true); },
      error: () => setLive(false),
    });
    return stop;
  }, [bakeryKey, upsert]);

  async function setStatus(o: Order, status: OrderStatus) {
    setPending(o.code);
    try {
      const r = await api.setStatus(bakeryKey, o.code, status);
      upsert(r.order);
      blip(784, 0.08);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not update the order.');
    } finally {
      setPending(null);
    }
  }

  const who = staff.role === 'admin' ? 'All bakeries (admin)' : staff.bakery.name;
  const optionLabel = (id: string) => ix.catalog.options.find((x) => x.id === id)?.label ?? id;

  return (
    <div className="pad stack">
      <div>
        <h2>Bakery orders</h2>
        <p className="muted">{who}. Orders arrive here the moment a customer pays.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={`live ${live ? '' : 'off'}`}><i />{live ? 'Live' : 'Connecting…'}</span>
          <button className="btn sm ghost" onClick={onSignOut}>Sign out</button>
        </div>
      </div>

      {orders === null && <p className="muted">Connecting to the order feed… If this doesn't go away, check that the backend is running.</p>}
      {orders?.length === 0 && (
        <div className="card"><b>No orders yet.</b><p className="muted">Open the app in another tab, order a cake, and it shows up here right away.</p></div>
      )}
      {orders?.map((o) => (
        <div key={o.code} className="card ord">
          <div className="ord-top"><b>{o.code}</b><span className={`status ${o.status}`}>{STATUS_LABEL[o.status]}</span></div>
          <div className="meta">{o.bakeryName} · {o.customer.mode === 'delivery' ? 'Delivery' : 'Pickup'} {o.date} {o.time}</div>
          <div className="ord-body">
            <div className="mini"><CakeView ix={ix} cake={o.cake} label="Ordered cake" crop /></div>
            <div className="ing">
              {o.description.map((d) => <div key={d}>{d}</div>)}
              {o.cake.lettering && <div>Message: “{o.cake.lettering}”</div>}
              {o.options.length > 0 && <div><b>Needs: {o.options.map(optionLabel).join(', ')}</b></div>}
              <div>{o.customer.name} · {o.customer.phone}</div>
              {o.customer.mode === 'delivery' && <div>{o.customer.addr}</div>}
              <b>{won(o.total)}</b>
            </div>
          </div>
          {!!o.nextStatuses?.length && (
            <div className="act">
              {o.nextStatuses.map((s) => (
                <button key={s} className={`btn sm ${s === 'declined' ? 'ghost' : ''}`} disabled={pending === o.code} onClick={() => void setStatus(o, s)}>
                  {ACTION_LABEL[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
