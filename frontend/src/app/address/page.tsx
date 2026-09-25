'use client';

import { useState, type FormEvent } from 'react';
import { useCakeStore } from '@/store/useCakeStore';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/components/Providers';
import { Ready } from '@/components/ui';

export default function AddressPage() {
  return <Ready>{() => <Address />}</Ready>;
}

/** Saved on this device and used to fill in checkout. */
function Address() {
  const toast = useToast();
  const profile = useCartStore((s) => s.profile);
  const setProfile = useCartStore((s) => s.setProfile);
  const setForm = useCakeStore((s) => s.setForm);
  const [draft, setDraft] = useState(profile);
  const [err, setErr] = useState('');

  function save(e: FormEvent) {
    e.preventDefault();
    const next = { name: draft.name.trim(), phone: draft.phone.trim(), addr: draft.addr.trim() };
    if (next.phone && !/^[0-9+\-\s]{9,15}$/.test(next.phone)) return setErr('Use a phone number like 010-1234-5678.');
    setErr('');
    setProfile(next);
    setForm(next);
    toast('Saved. We’ll use it at checkout.');
  }

  return (
    <form className="pad page-form" onSubmit={save} noValidate>
      <h1 className="title" style={{ marginBottom: 6 }}>Address</h1>
      <p className="muted it" style={{ textAlign: 'center', marginBottom: 20 }}>Saved on this phone only. No account needed.</p>
      <div className="fields">
        <input className="pill-in" placeholder="Name" aria-label="Name" autoComplete="name" maxLength={40}
          value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <input className="pill-in" placeholder="Phone" aria-label="Phone" type="tel" autoComplete="tel"
          value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
        <textarea className="pill-in" placeholder="Delivery address" aria-label="Delivery address" autoComplete="street-address" rows={3} maxLength={200}
          value={draft.addr} onChange={(e) => setDraft({ ...draft, addr: e.target.value })} />
      </div>
      {err && <p className="err" role="alert">{err}</p>}
      <div className="foot"><button type="submit" className="btn">Save address</button></div>
    </form>
  );
}
