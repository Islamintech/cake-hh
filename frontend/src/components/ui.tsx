'use client';

import type { ReactNode } from 'react';
import { useCatalog, useHydrated } from './Providers';
import { useCakeStore } from '@/store/useCakeStore';
import type { CatalogIndex } from '@/lib/rules';
import type { Bakery } from '@/lib/types';

/** Render trusted static SVG markup (from lib/art.ts). Never pass user input here. */
export function Svg({ markup, className }: { markup: string; className?: string }) {
  return <span className={className} style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: markup }} />;
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return <div className="center" role="status"><div className="spinner" aria-hidden="true" /><p className="muted">{label}</p></div>;
}

export function ErrorCard({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return (
    <div className="card err-card stack" role="alert">
      <div><b>{title}</b><p className="muted" style={{ margin: '4px 0 0' }}>{message}</p></div>
      {onRetry && <button className="btn sm" onClick={onRetry}>Try again</button>}
    </div>
  );
}

/** Waits for the catalog (from the API) and the saved build (from sessionStorage), then renders. */
export function Ready({ children }: { children: (ix: CatalogIndex) => ReactNode }) {
  const { ix, error, retry } = useCatalog();
  const hydrated = useHydrated();
  if (error) return <div className="pad"><ErrorCard title="The kitchen is closed" message={error} onRetry={retry} /></div>;
  if (!ix || !hydrated) return <Loading label="Warming up the oven…" />;
  return <>{children(ix)}</>;
}

export function OptionChips() {
  const { ix } = useCatalog();
  const opts = useCakeStore((s) => s.opts);
  const toggle = useCakeStore((s) => s.toggleOpt);
  if (!ix) return null;
  return (
    <div className="chips" role="group" aria-label="Dietary options">
      {ix.catalog.options.map((o) => (
        <button key={o.id} className="chip" aria-pressed={opts.includes(o.id)} onClick={() => toggle(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

export function TrustBadge({ bakery }: { bakery: Pick<Bakery, 'trust' | 'halal'> }) {
  if (bakery.trust === 'verified') return <span className="badge ok">✓ Verified{bakery.halal ? ' halal' : ''}</span>;
  if (bakery.trust === 'self') return <span className="badge self">Self-declared{bakery.halal ? ' halal' : ''}</span>;
  return <span className="badge plain">Standard kitchen</span>;
}
