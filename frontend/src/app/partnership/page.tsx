'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';

const FIELDS = [
  { id: 'company', label: 'Company name', max: 80, area: false },
  { id: 'location', label: 'Location', max: 120, area: false },
  { id: 'reason', label: 'Why you choose us', max: 600, area: true },
  { id: 'products', label: 'Your products', max: 600, area: true },
  { id: 'contact', label: 'Contacts', max: 160, area: false },
] as const;

type Form = Record<(typeof FIELDS)[number]['id'], string>;

/** Bakeries apply to join. Stored by the API for the team to review. */
export default function PartnershipPage() {
  const [form, setForm] = useState<Form>({ company: '', location: '', reason: '', products: '', contact: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const missing = FIELDS.find((f) => !form[f.id].trim());
    if (missing) return setErr(`Please fill in “${missing.label}”.`);
    setErr('');
    setBusy(true);
    try {
      const r = await api.partner(form);
      setSent(r.application.company);
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : 'Could not send the form. Try again.');
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="pad stack">
        <h1 className="title">Partnership</h1>
        <div className="ok-note"><b>Thank you, {sent}!</b>We got your form and will contact you within 2 working days.</div>
        <Link className="btn" href="/">Back to home</Link>
      </div>
    );
  }

  return (
    <form className="pad page-form" onSubmit={(e) => void submit(e)} noValidate>
      <h1 className="title" style={{ marginBottom: 30 }}>Partnership</h1>
      <div className="fields">
        {FIELDS.map((f) => f.area ? (
          <textarea key={f.id} className="pill-in" placeholder={f.label} aria-label={f.label} rows={1} maxLength={f.max}
            value={form[f.id]} onChange={(e) => setForm({ ...form, [f.id]: e.target.value })} />
        ) : (
          <input key={f.id} className="pill-in" placeholder={f.label} aria-label={f.label} maxLength={f.max}
            autoComplete={f.id === 'company' ? 'organization' : undefined}
            value={form[f.id]} onChange={(e) => setForm({ ...form, [f.id]: e.target.value })} />
        ))}
      </div>
      {err && <p className="err" role="alert">{err}</p>}
      <div className="foot">
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Sending…' : 'Submit your form'}</button>
      </div>
    </form>
  );
}
