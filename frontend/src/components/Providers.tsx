'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';
import { indexCatalog, type CatalogIndex } from '@/lib/rules';
import { setSoundEnabled } from '@/lib/sound';
import { useCakeStore } from '@/store/useCakeStore';

// ---- Catalog: fetched once from the API, shared by every page ----

interface CatalogState { ix: CatalogIndex | null; error: string | null; retry: () => void }
const CatalogContext = createContext<CatalogState>({ ix: null, error: null, retry: () => {} });
export const useCatalog = () => useContext(CatalogContext);

// ---- Toast ----

const ToastContext = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

// ---- Store hydration (sessionStorage is only available after mount) ----

const HydratedContext = createContext(false);
export const useHydrated = () => useContext(HydratedContext);

export function Providers({ children }: { children: ReactNode }) {
  const [ix, setIx] = useState<CatalogIndex | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sound = useCakeStore((s) => s.sound);

  useEffect(() => {
    let alive = true;
    setError(null);
    api.catalog()
      .then((c) => { if (alive) setIx(indexCatalog(c)); })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? e.message : 'Could not load the menu.'); });
    return () => { alive = false; };
  }, [attempt]);

  useEffect(() => {
    const unsub = useCakeStore.persist.onFinishHydration(() => setHydrated(true));
    void useCakeStore.persist.rehydrate();
    if (useCakeStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => { setSoundEnabled(sound); }, [sound]);

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const catalog = useMemo(() => ({ ix, error, retry: () => setAttempt((n) => n + 1) }), [ix, error]);

  return (
    <CatalogContext.Provider value={catalog}>
      <ToastContext.Provider value={showToast}>
        <HydratedContext.Provider value={hydrated}>
          {children}
          {toast && <div key={toast.id} className="toast" role="status">{toast.msg}</div>}
        </HydratedContext.Provider>
      </ToastContext.Provider>
    </CatalogContext.Provider>
  );
}
