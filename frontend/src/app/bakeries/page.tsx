'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { bakeryArt } from '@/lib/art';
import { won } from '@/lib/format';
import { fitPresetToMenu, presetCake, type CatalogIndex } from '@/lib/rules';
import { useCakeStore } from '@/store/useCakeStore';
import { Art } from '@/components/Art';
import { ErrorCard, Loading, Ready, TrustBadge } from '@/components/ui';
import type { Bakery } from '@/lib/types';

export default function BakeriesPage() {
  return <Ready>{(ix) => <BakeryList ix={ix} />}</Ready>;
}

function BakeryList({ ix }: { ix: CatalogIndex }) {
  const router = useRouter();
  const { opts, preset, pendingLetter, setBakery, setCake, setStep, startFresh, setKitchenTip } = useCakeStore();
  const [list, setList] = useState<Bakery[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setError(null);
    api.bakeries(opts).then((r) => setList(r.bakeries)).catch((e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not load bakeries.'));
  }, [opts, attempt]);

  const optLabels = opts.map((id) => ix.catalog.options.find((o) => o.id === id)?.label ?? id).join(', ');

  async function pick(b: Bakery) {
    setBakery(b.id);
    if (!preset) {
      startFresh();
      router.push('/kitchen');
      return;
    }
    // A suggested cake: swap anything this bakery can't make, then jump to the toppings station.
    setBusy(b.id);
    try {
      const detail = await api.bakery(b.id, opts);
      const cake = fitPresetToMenu(presetCake(preset), detail.menu);
      setCake({ ...cake, lettering: pendingLetter });
      setStep({ layer: 0, i: 5, phase: 'build' });
      setKitchenTip(`Here's “${preset.name}”. Change anything you like, dear.`);
      router.push('/kitchen');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not open that bakery.');
      setBusy(null);
    }
  }

  return (
    <div className="pad stack">
      <div>
        <h2>Pick a bakery</h2>
        <p className="muted">{optLabels ? `Showing bakeries that can do: ${optLabels}.` : 'All bakeries near you.'}</p>
      </div>
      {error && <ErrorCard title="Bakeries didn’t load" message={error} onRetry={() => setAttempt((n) => n + 1)} />}
      {!list && !error && <Loading label="Finding bakeries…" />}
      {list && (list.length ? list.map((b) => (
        <div key={b.id} className="card bk">
          {bakeryArt(b.id)
            ? <div className="pic"><Art src={bakeryArt(b.id)!} size={62} /></div>
            : <div className="pic" style={{ background: b.bg }}>{b.pic}</div>}
          <div>
            <h3>{b.name}</h3>
            <div className="meta">{b.area}. From {won(b.fromPrice)}, ready {b.lead.toLowerCase()}.</div>
            <div style={{ margin: '6px 0' }}>
              <TrustBadge bakery={b} />
              <span className="badge plain">{b.delivery ? 'Delivery + pickup' : 'Pickup only'}</span>
              <span className="badge plain">Up to {b.maxLayers} layers</span>
            </div>
            {b.notice && <div className="notice">{b.notice}</div>}
            <button className="btn sm" style={{ marginTop: 8 }} disabled={busy !== null} onClick={() => void pick(b)}>
              {busy === b.id ? 'Opening…' : 'Build here'}
            </button>
          </div>
        </div>
      )) : (
        <div className="card">
          <b>No bakery can make that combination yet.</b>
          <p className="muted">Try removing one option.</p>
          <Link className="btn sm" href="/options">Change options</Link>
        </div>
      ))}
      <Link className="btn ghost" href={preset ? '/mood' : '/options'}>Back</Link>
    </div>
  );
}
