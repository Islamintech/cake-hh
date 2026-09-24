// The cake being built and the choices around it. Persisted to sessionStorage so a refresh
// mid-build keeps your cake; closing the tab starts fresh.
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { freshCake, type Step } from '@/lib/rules';
import type { CakeDesign, FulfilmentMode, Suggestion } from '@/lib/types';

export interface AiPrefs { occasion: string | null; cravings: string[]; sweet: number | null; text: string }
export interface CheckoutForm { name: string; phone: string; mode: FulfilmentMode; addr: string; date: string; time: string }

interface CakeState {
  opts: string[];
  bakeryId: string | null;
  cake: CakeDesign;
  step: Step;
  /** An AI/house suggestion chosen before picking a bakery. */
  preset: Suggestion | null;
  /** Lettering suggested by the occasion, applied at the lettering station. */
  pendingLetter: string;
  ai: AiPrefs;
  form: CheckoutForm;
  sound: boolean;
  /** One-off tip Halmeoni says when the kitchen opens (not persisted). */
  kitchenTip: string | null;

  toggleOpt(id: string): void;
  setBakery(id: string | null): void;
  setCake(cake: CakeDesign): void;
  setStep(step: Step): void;
  startFresh(): void;
  choosePreset(preset: Suggestion | null, pendingLetter?: string): void;
  setAi(patch: Partial<AiPrefs>): void;
  setForm(patch: Partial<CheckoutForm>): void;
  setSound(on: boolean): void;
  setKitchenTip(tip: string | null): void;
}

const initialStep: Step = { layer: 0, i: 0, phase: 'build' };

export const useCakeStore = create<CakeState>()(
  persist(
    (set) => ({
      opts: [],
      bakeryId: null,
      cake: freshCake(),
      step: initialStep,
      preset: null,
      pendingLetter: '',
      ai: { occasion: null, cravings: [], sweet: null, text: '' },
      form: { name: '', phone: '', mode: 'pickup', addr: '', date: '', time: '11:00' },
      sound: false,
      kitchenTip: null,

      toggleOpt: (id) => set((s) => {
        const next = new Set(s.opts);
        if (next.has(id)) next.delete(id);
        else {
          next.add(id);
          if (id === 'vegan') { next.add('no_milk'); next.add('no_egg'); }
        }
        return { opts: [...next] };
      }),
      setBakery: (bakeryId) => set({ bakeryId }),
      setCake: (cake) => set({ cake }),
      setStep: (step) => set({ step }),
      startFresh: () => set({ cake: freshCake(), step: initialStep, preset: null, pendingLetter: '' }),
      choosePreset: (preset, pendingLetter = '') => set({ preset, pendingLetter }),
      setAi: (patch) => set((s) => ({ ai: { ...s.ai, ...patch } })),
      setForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
      setSound: (sound) => set({ sound }),
      setKitchenTip: (kitchenTip) => set({ kitchenTip }),
    }),
    {
      name: 'ck-build',
      storage: createJSONStorage(() => sessionStorage),
      // Rehydrated in <Providers> after mount, so server and first client render match.
      skipHydration: true,
      partialize: ({ opts, bakeryId, cake, step, preset, pendingLetter, ai, form, sound }) =>
        ({ opts, bakeryId, cake, step, preset, pendingLetter, ai, form, sound }),
    },
  ),
);
