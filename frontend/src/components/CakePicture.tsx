'use client';

import { cakePhoto } from '@/lib/cakePhotos';
import type { CatalogIndex } from '@/lib/rules';
import type { CakeDesign } from '@/lib/types';
import { CakeView } from './CakeView';

/** A house cake's photo when there is one, otherwise the drawing of this exact design. */
export function CakePicture({ ix, cake, name, crop = true }: { ix: CatalogIndex; cake: CakeDesign; name: string; crop?: boolean }) {
  const photo = cakePhoto(name);
  if (!photo) return <CakeView ix={ix} cake={cake} label={name} crop={crop} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="cake-photo" src={photo.src} alt={name} loading="lazy" decoding="async" style={photo.position ? { objectPosition: photo.position } : undefined} />;
}
