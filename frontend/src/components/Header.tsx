'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ICON_SOUND_OFF, ICON_SOUND_ON, LOGO } from '@/lib/art';
import { blip, setSoundEnabled } from '@/lib/sound';
import { useCakeStore } from '@/store/useCakeStore';
import { Svg } from './ui';

export function Header() {
  const inBakery = usePathname().startsWith('/bakery');
  const sound = useCakeStore((s) => s.sound);
  const setSound = useCakeStore((s) => s.setSound);

  const toggleSound = () => {
    setSound(!sound);
    setSoundEnabled(!sound);
    if (!sound) blip(660, 0.08);
  };

  return (
    <header className="top">
      <Link className="brand" href="/" aria-label="Go to start">
        <Svg markup={LOGO} />Cake Kitchen <small>working name</small>
      </Link>
      <div className="top-actions">
        <button className="icon-btn" onClick={toggleSound} aria-label={sound ? 'Mute sounds' : 'Turn sounds on'} title="Sounds">
          <Svg markup={sound ? ICON_SOUND_ON : ICON_SOUND_OFF} />
        </button>
        <Link className="link" href={inBakery ? '/' : '/bakery'}>{inBakery ? 'Customer view' : 'For bakeries'}</Link>
      </div>
    </header>
  );
}
