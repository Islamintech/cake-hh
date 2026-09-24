'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { myOrders, type MyOrder } from '@/lib/myOrders';
import type { CatalogIndex } from '@/lib/rules';
import { CakeView } from '@/components/CakeView';
import { SadIcon } from '@/components/icons';
import { Loading, Ready } from '@/components/ui';
import type { Order } from '@/lib/types';

export default function OrdersPage() {
  return <Ready>{(ix) => <Orders ix={ix} />}</Ready>;
}

type Row = { mine: MyOrder; order: Order | null };

/** Orders placed from this browser (no accounts), with their live status. */
function Orders({ ix }: { ix: CatalogIndex }) {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let alive = true;
    const mine = myOrders();
    Promise.all(mine.map((m) => api.trackOrder(m.code, m.token).then((r) => r.order).catch(() => null)))
      .then((orders) => { if (alive) setRows(mine.map((m, i) => ({ mine: m, order: orders[i] ?? null }))); });
    return () => { alive = false; };
  }, []);

  if (!rows) return <Loading label="Loading your orders…" />;
  if (!rows.length) {
    return (
      <div className="empty">
        <SadIcon />
        <p>No orders yet!</p>
        <Link className="textlink" href="/cakes">Add item</Link>
      </div>
    );
  }

  return (
    <div className="pad">
      <h1 className="title">Orders</h1>
      <ol className="rows-list">
        {rows.map(({ mine, order }) => {
          const step = order?.steps.find((s) => s.id === order.status)?.label ?? (order?.status === 'declined' ? 'Declined' : '');
          return (
            <li key={mine.code}>
              <Link className="row-pill" href={`/track/${mine.code}?t=${encodeURIComponent(mine.token)}`}>
                <span className="n" aria-hidden="true">#</span>
                <span>
                  <span className="nm">{mine.code}</span>
                  <span className="sub">{order ? `${step} · ${order.bakeryName} · ${order.date} ${order.time}` : 'Could not load this order'}</span>
                </span>
                <span className="th">{order && <CakeView ix={ix} cake={order.cake} label={`Order ${mine.code}`} crop />}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
