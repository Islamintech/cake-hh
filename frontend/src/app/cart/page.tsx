'use client';

import Link from 'next/link';
import { won } from '@/lib/format';
import type { CatalogIndex } from '@/lib/rules';
import { useCartStore } from '@/store/useCartStore';
import { CakeView } from '@/components/CakeView';
import { SadIcon } from '@/components/icons';
import { Ready } from '@/components/ui';

export default function CartPage() {
  return <Ready>{(ix) => <Cart ix={ix} />}</Ready>;
}

function Cart({ ix }: { ix: CatalogIndex }) {
  const items = useCartStore((s) => s.items);
  const remove = useCartStore((s) => s.remove);

  if (!items.length) {
    return (
      <div className="empty">
        <SadIcon />
        <p>Sorry, cart is empty!</p>
        <Link className="textlink" href="/cakes">Add item</Link>
      </div>
    );
  }

  const total = items.reduce((n, x) => n + x.total, 0);
  return (
    <div className="pad" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 36 }}>
      <h1 className="sr-only">Cart</h1>
      <ol className="rows-list">
        {items.map((x, i) => (
          <li key={x.key} className="row-pill">
            <span className="n">{i + 1}</span>
            <span>
              <span className="nm">{x.name}</span>
              <span className="sub">{x.bakeryName} · {won(x.total)}</span>
              <button className="rm" onClick={() => remove(x.key)} aria-label={`Remove ${x.name}`}>Remove</button>
            </span>
            <span className="th"><CakeView ix={ix} cake={x.cake} label={x.name} crop /></span>
          </li>
        ))}
      </ol>
      <div className="cart-foot">
        <div className="cart-total"><span>Total</span><b>{won(total)}</b></div>
        <div className="pair">
          <Link className="btn" href="/cakes">Continue shopping</Link>
          <Link className="btn" href="/checkout">Buy</Link>
        </div>
      </div>
    </div>
  );
}
