'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCakeStore } from '@/store/useCakeStore';
import { TrustBadge } from '../ui';
import type { Bakery } from '@/lib/types';

/** "Start building" / "Let AI suggest": both clear any earlier suggestion first. */
export function StartButtons({ withAi = true }: { withAi?: boolean }) {
  const router = useRouter();
  const choosePreset = useCakeStore((s) => s.choosePreset);
  return (
    <div className="lp-cta">
      <button className="btn" onClick={() => { choosePreset(null); router.push('/options'); }}>Start building</button>
      {withAi && <button className="btn ghost" onClick={() => router.push('/suggest')}>Let AI suggest a cake</button>}
    </div>
  );
}

const AWNINGS = ['#E0457B', '#7FA85A', '#F3CF74'];

/** Partner bakeries, live from the API. */
export function Shops() {
  const [list, setList] = useState<Bakery[] | null>(null);
  useEffect(() => {
    api.bakeries([], true).then((r) => setList(r.bakeries)).catch(() => setList([]));
  }, []);
  if (!list) return <div className="shops" aria-busy="true" />;
  if (!list.length) return <p className="muted small">Start the backend to see partner bakeries.</p>;
  return (
    <div className="shops">
      {list.map((b, i) => (
        <div key={b.id} className="shop" style={{ '--aw': AWNINGS[i % AWNINGS.length] } as React.CSSProperties}>
          <b>{b.name}</b>
          <div className="meta">{b.area}, {b.delivery ? 'delivers and does pickup' : 'pickup only'}</div>
          <TrustBadge bakery={b} />
        </div>
      ))}
    </div>
  );
}
