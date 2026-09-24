'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { TrustBadge } from './ui';
import type { Bakery } from '@/lib/types';

/** Partner bakeries, live from the API. */
export function Shops() {
  const [list, setList] = useState<Bakery[] | null>(null);
  useEffect(() => {
    api.bakeries([], true).then((r) => setList(r.bakeries)).catch(() => setList([]));
  }, []);
  if (!list) return <div className="stack" aria-busy="true" />;
  if (!list.length) return <p className="muted small">Start the backend to see partner bakeries.</p>;
  return (
    <ul className="steps-a" style={{ counterReset: 'none' }}>
      {list.map((b) => (
        <li key={b.id}>
          <b style={{ counterIncrement: 'none' }} className="shop-name">{b.name}</b>
          {b.area}, {b.delivery ? 'delivers and does pickup' : 'pickup only'}
          <div style={{ marginTop: 6 }}><TrustBadge bakery={b} /></div>
        </li>
      ))}
    </ul>
  );
}
