'use client';

import Link from 'next/link';
import { OptionChips, Ready } from '@/components/ui';

export default function OptionsPage() {
  return (
    <Ready>
      {() => (
        <div className="pad stack">
          <div>
            <h2>Anything to avoid?</h2>
            <p className="muted">We&apos;ll only show bakeries and ingredients that fit. Skip if nothing applies.</p>
          </div>
          <OptionChips />
          <p className="muted small">Safety filters are fixed rules on each ingredient, never AI guesses.</p>
          <Link className="btn" href="/bakeries">Show bakeries</Link>
          <Link className="btn ghost" href="/">Back</Link>
        </div>
      )}
    </Ready>
  );
}
