'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { HERO_STEPS, heroSVG, LOGO } from '@/lib/art';
import { Svg } from '../ui';

const ALL_CLASSES = HERO_STEPS.map((s) => s[1]);

/** The cake that builds itself on the landing page, looping every ~11s. */
export function Hero() {
  const wrap = useRef<HTMLDivElement>(null);
  const [hud, setHud] = useState({ stage: 'STAGE 1/6', label: 'Pick a pan', score: '★ 000', tag: false });
  const markup = useMemo(() => heroSVG(), []);

  useEffect(() => {
    const root = wrap.current;
    const svg = root?.querySelector<SVGSVGElement>('#heroSvg');
    if (!root || !svg) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      svg.classList.add(...ALL_CLASSES);
      setHud({ stage: 'STAGE 6/6', label: 'Perfect cake', score: '★ 100', tag: true });
      return;
    }

    const run = () => {
      svg.classList.remove(...ALL_CLASSES, 's-out');
      root.classList.remove('tagging');
      setHud({ stage: 'STAGE 1/6', label: 'Pick a pan', score: '★ 000', tag: false });
      let stage = 0;
      for (const [t, cls, label, score] of HERO_STEPS) {
        later(() => {
          svg.classList.add(cls);
          if (label) stage = Math.min(6, stage + 1);
          const s = stage;
          setHud((h) => ({
            stage: label ? `STAGE ${s}/6` : h.stage,
            label: label ?? h.label,
            score: '★ ' + String(score).padStart(3, '0'),
            tag: cls === 's-tag' ? true : h.tag,
          }));
          if (cls === 's-tag') root.classList.add('tagging');
        }, t);
      }
      later(() => { svg.classList.add('s-out'); root.classList.remove('tagging'); setHud((h) => ({ ...h, tag: false })); }, 10800);
      later(run, 11300);
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="lp-hero" ref={wrap}>
      <Svg markup={markup} />
      <div className="lp-hud" aria-hidden="true">
        <div className="stage-l"><span>{hud.stage}</span><b>{hud.label}</b></div>
        <div className="score">{hud.score}</div>
      </div>
      <div className={`lp-tag ${hud.tag ? 'on' : ''}`} aria-hidden="true">
        <div className="dot"><Svg markup={LOGO} /></div>
        <div><b>Baking at Seoul Sugar Studio</b><span>At your door tomorrow</span></div>
      </div>
    </div>
  );
}
