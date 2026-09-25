'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { blip, setSoundEnabled } from '@/lib/sound';
import { useCakeStore } from '@/store/useCakeStore';
import { useCartStore } from '@/store/useCartStore';
import { useHydrated } from './Providers';
import { CartIcon, CloseIcon, MenuIcon, PictureIcon, UserIcon } from './icons';

const MENU: { href: string; label: string }[] = [
  { href: '/cakes', label: 'All cakes' },
  { href: '/cakes/popular', label: 'Popular cakes' },
  { href: '/options', label: 'Custom cakes' },
  { href: '/orders', label: 'Orders' },
  { href: '/mood', label: 'Mood' },
  { href: '/kitchen', label: 'Game mode' },
  { href: '/address', label: 'Address' },
  { href: '/partnership', label: 'Partnership' },
  { href: '/about', label: 'About us' },
];

type Panel = 'menu' | 'profile' | null;

export function Header() {
  const path = usePathname();
  const [panel, setPanel] = useState<Panel>(null);
  const close = useCallback(() => setPanel(null), []);
  const hydrated = useHydrated();
  const count = useCartStore((s) => s.items.length);
  // The badge bumps when something is added, so the change is visible where it happened.
  const [bump, setBump] = useState(0);
  const prevCount = useRef<number | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (prevCount.current !== null && count > prevCount.current) setBump((n) => n + 1);
    prevCount.current = count;
  }, [count, hydrated]);
  const bakeryId = useCakeStore((s) => s.bakeryId);

  // Close on navigation.
  useEffect(() => { close(); }, [path, close]);

  // Game mode resumes a build in progress; with no bakery picked yet, it starts one.
  const hrefFor = (href: string) => (href === '/kitchen' && !bakeryId ? '/options' : href);

  return (
    <>
      <header className={`top ${path === '/' ? 'on-photo' : ''}`}>
        <button className="ico" onClick={() => setPanel('menu')} aria-label="Open menu" aria-expanded={panel === 'menu'}><MenuIcon /></button>
        <div className="top-actions">
          <Link className="ico" href="/cart" aria-label={`Cart${hydrated && count ? `, ${count} item${count > 1 ? 's' : ''}` : ''}`}>
            <CartIcon />
            {hydrated && count > 0 && <i key={bump} className={`cart-n ${bump ? 'bump' : ''}`}>{count}</i>}
          </Link>
          <button className="avatar" onClick={() => setPanel('profile')} aria-label="Your profile" aria-expanded={panel === 'profile'}><UserIcon /></button>
        </div>
      </header>

      {panel && (
        <Drawer side={panel === 'menu' ? 'left' : 'right'} label={panel === 'menu' ? 'Menu' : 'Profile'} onClose={close}>
          {panel === 'menu' ? (
            <>
              <nav aria-label="Main">
                <ul className="menu">
                  {MENU.map((m) => (
                    <li key={m.href}><Link href={hrefFor(m.href)} aria-current={path === m.href ? 'page' : undefined} onClick={close}>{m.label}</Link></li>
                  ))}
                </ul>
              </nav>
              <div className="drawer-foot">
                <Link href="/bakery" onClick={close}>For bakeries: order dashboard</Link>
                <SoundToggle />
              </div>
            </>
          ) : <Profile close={close} />}
        </Drawer>
      )}
    </>
  );
}

function Drawer({ side, label, onClose, children }: { side: 'left' | 'right'; label: string; onClose: () => void; children: React.ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.classList.add('locked');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('locked'); window.removeEventListener('keydown', onKey); prev?.focus(); };
  }, [onClose]);
  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <div className={`drawer ${side === 'right' ? 'right' : ''}`} role="dialog" aria-modal="true" aria-label={label}>
        <button ref={closeRef} className="x" onClick={onClose} aria-label="Close"><CloseIcon /></button>
        {children}
      </div>
    </>
  );
}

function Profile({ close }: { close: () => void }) {
  const profile = useCartStore((s) => s.profile);
  return (
    <>
      <div className="profile-pic"><PictureIcon /></div>
      <p className="profile-name">{profile.name || 'Guest'}</p>
      <p className="profile-meta">{profile.phone || 'No account needed'}</p>
      <ul className="menu">
        <li><Link href="/orders" onClick={close}>My orders</Link></li>
        <li><Link href="/cart" onClick={close}>Cart</Link></li>
        <li><Link href="/address" onClick={close}>Address</Link></li>
      </ul>
      <div className="drawer-foot" style={{ justifyItems: 'center', paddingLeft: 0 }}><SoundToggle /></div>
    </>
  );
}

function SoundToggle() {
  const sound = useCakeStore((s) => s.sound);
  const setSound = useCakeStore((s) => s.setSound);
  const toggle = () => {
    setSound(!sound);
    setSoundEnabled(!sound);
    if (!sound) blip(660, 0.08);
  };
  return <button onClick={toggle} aria-pressed={sound}>Game sounds: {sound ? 'on' : 'off'}</button>;
}
