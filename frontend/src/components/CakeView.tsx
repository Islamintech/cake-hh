'use client';

import { useId, useMemo, type MouseEvent } from 'react';
import { cakeSVG, type Anim } from '@/lib/cakeSvg';
import type { CatalogIndex } from '@/lib/rules';
import type { CakeDesign } from '@/lib/types';

interface Props {
  ix: CatalogIndex;
  cake: CakeDesign;
  anim?: Anim | null;
  letterShown?: number | null;
  label?: string;
  crop?: boolean;
  /** When set, toppings are tappable and this is called with (layer, index). */
  onRemoveTopping?: (layer: number, k: number) => void;
}

/**
 * Draws a cake. The SVG string is memoized, so unrelated re-renders don't touch the DOM
 * and CSS animations (drop, pour, rise…) play once per change, like in the demo.
 */
export function CakeView({ ix, cake, anim, letterShown, label, crop, onRemoveTopping }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const interactive = !!onRemoveTopping;
  const html = useMemo(
    () => cakeSVG(ix, cake, { uid, anim, letterShown, label, crop, interactive }),
    [ix, cake, uid, anim, letterShown, label, crop, interactive],
  );

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onRemoveTopping) return;
    const el = (e.target as Element).closest('[data-act="rmTop"]');
    const v = el?.getAttribute('data-v');
    if (!v) return;
    const [i, k] = v.split(':').map(Number);
    if (Number.isInteger(i) && Number.isInteger(k)) onRemoveTopping(i!, k!);
  };

  return <div style={{ display: 'contents' }} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
