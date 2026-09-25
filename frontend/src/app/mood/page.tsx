'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { presetCake, type CatalogIndex } from '@/lib/rules';
import { useCakeStore } from '@/store/useCakeStore';
import { Art } from '@/components/Art';
import { CakePicture } from '@/components/CakePicture';
import { CakeSheet, type SheetCake } from '@/components/CakeSheet';
import { ErrorCard, OptionChips, Ready } from '@/components/ui';
import type { SuggestResponse } from '@/lib/types';

const OCCASION_LETTERING: Record<string, string> = {
  Birthday: 'Happy Birthday!',
  Anniversary: 'Happy anniversary',
  'Office party': 'Congrats team!',
};

export default function MoodPage() {
  return <Ready>{(ix) => <Mood ix={ix} />}</Ready>;
}

function Mood({ ix }: { ix: CatalogIndex }) {
  const router = useRouter();
  const { ai, setAi, opts, choosePreset } = useCakeStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuggestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<SheetCake | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const { occasions, cravings, sweetness } = ix.catalog;

  // Changing any preference makes old suggestions stale.
  const update = (patch: Parameters<typeof setAi>[0]) => { setAi(patch); setResult(null); };

  async function go() {
    setLoading(true);
    setError(null);
    try {
      setResult(await api.suggest({ ...ai, text: ai.text.trim(), options: opts }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Suggestions didn’t load. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function use(i: number) {
    const s = result?.suggestions[i];
    if (!s) return;
    choosePreset(s, (ai.occasion && OCCASION_LETTERING[ai.occasion]) || '');
    router.push('/bakeries');
  }

  return (
    <div className="pad stack">
      <h1 className="title" style={{ margin: '18px 0 4px' }}>Mood</h1>
      <div className="mood-box" aria-live="polite">
        <div className="face"><Art src={loading ? 'misc/grandma-thinking' : result ? 'misc/grandma-surprised' : 'misc/grandma'} size={48} /></div>
        <p>{loading ? 'Let me think, dear…'
          : result ? `Here are ${result.suggestions.length} cakes for your mood. Tap one to order it, or change it in the game.`
          : 'Tell me how you feel today, dear, and I’ll suggest a cake. You can change anything after.'}</p>
      </div>

      <div><h3>What&apos;s the occasion?</h3><div className="chips">
        {occasions.map((o) => <button key={o} className="chip" aria-pressed={ai.occasion === o} onClick={() => update({ occasion: ai.occasion === o ? null : o })}>{o}</button>)}
      </div></div>

      <div><h3>What are you craving?</h3><div className="chips">
        {cravings.map((c) => {
          const on = ai.cravings.includes(c.id);
          return <button key={c.id} className="chip" aria-pressed={on} onClick={() => update({ cravings: on ? ai.cravings.filter((x) => x !== c.id) : [...ai.cravings, c.id] })}>{c.label}</button>;
        })}
      </div></div>

      <div><h3>How sweet?</h3><div className="chips">
        {sweetness.map((s) => <button key={s.value} className="chip" aria-pressed={ai.sweet === s.value} onClick={() => update({ sweet: ai.sweet === s.value ? null : s.value })}>{s.label}</button>)}
      </div></div>

      <div><h3>Anything to avoid?</h3><div onClick={() => setResult(null)}><OptionChips /></div></div>

      <label className="f">Anything else? <span className="muted small">Optional</span>
        <input className="pill-in" maxLength={140} placeholder="Mom loves strawberries, not heavy cream"
          value={ai.text} onChange={(e) => update({ text: e.target.value })} />
      </label>

      <button className="btn" onClick={() => void go()} disabled={loading}>{loading ? 'Halmeoni is thinking…' : 'Suggest cakes'}</button>

      {error && <ErrorCard title="No suggestions" message={error} onRetry={() => void go()} />}

      {result && (
        <>
          <h3>Halmeoni suggests</h3>
          <div className="stack">
            {result.suggestions.map((r, i) => (
              <div key={r.name + i} className="card suggest">
                <div className="mini"><CakePicture ix={ix} cake={presetCake(r)} name={r.name} /></div>
                <div>
                  <b style={{ fontSize: 18 }}>{r.name}</b>
                  <p className="muted small" style={{ margin: '2px 0 8px' }}>{r.reason}</p>
                  <div className="chips">
                    <button className="btn sm" onClick={() => setOpen({ name: r.name, desc: r.reason, batter: r.batter, frosting: r.frosting, toppings: r.toppings })}>Order it</button>
                    <button className="btn sm ghost" onClick={() => use(i)}>Play it</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {result.note && <p className="muted small">{result.note}</p>}
        </>
      )}
      {open && <CakeSheet ix={ix} item={open} onClose={close} />}
    </div>
  );
}
