'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { won } from '@/lib/format';
import { fromPrice, popular } from '@/lib/presets';
import { presetCake, type CatalogIndex } from '@/lib/rules';
import { useCakeStore } from '@/store/useCakeStore';
import { CakeSheet, type SheetCake } from './CakeSheet';
import { CakeView } from './CakeView';
import { OptionChips, Ready } from './ui';
import type { Bakery } from '@/lib/types';

export function CakeGrid({ mode }: { mode: 'all' | 'popular' }) {
  return <Ready>{(ix) => <Grid ix={ix} mode={mode} />}</Ready>;
}

function Grid({ ix, mode }: { ix: CatalogIndex; mode: 'all' | 'popular' }) {
  const opts = useCakeStore((s) => s.opts);
  const [bakeries, setBakeries] = useState<Bakery[]>([]);
  const [open, setOpen] = useState<SheetCake | null>(null);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    let alive = true;
    api.bakeries(opts, true).then((r) => { if (alive) setBakeries(r.bakeries); }).catch(() => { if (alive) setBakeries([]); });
    return () => { alive = false; };
  }, [opts]);

  const list = mode === 'popular' ? popular(ix) : ix.catalog.presets;

  return (
    <div className="pad">
      <h1 className="title">{mode === 'popular' ? 'Popular cakes' : 'All cakes'}</h1>
      {mode === 'popular' && <p className="muted it" style={{ textAlign: 'center', marginTop: -14 }}>Classic flavour pairings, strongest first.</p>}
      <div className="filters"><OptionChips /></div>
      <div className="cakes">
        {list.map((p) => {
          const price = fromPrice(ix, p, bakeries);
          return (
            <button key={p.name} className="cake-card" onClick={() => setOpen({ name: p.name, desc: p.desc, batter: p.batter, frosting: p.frosting, toppings: p.toppings })}
              aria-label={`${p.name}${price ? `, from ${won(price)}` : ''}`}>
              <span className="pic"><CakeView ix={ix} cake={presetCake(p)} label={p.name} crop /></span>
              <b>{p.name}</b>
              <span className="d">{p.desc}</span>
              <span className="price-pill">{price ? <><small>from</small>{won(price)}</> : '—'}</span>
            </button>
          );
        })}
      </div>
      {open && <CakeSheet ix={ix} item={open} onClose={close} />}
    </div>
  );
}
