'use client';

import { useRouter } from 'next/navigation';
import { useCakeStore } from '@/store/useCakeStore';

export default function HomePage() {
  const router = useRouter();
  const choosePreset = useCakeStore((s) => s.choosePreset);
  // GAME starts a fresh build; ORDER goes to ready-made cakes.
  const game = () => { choosePreset(null); router.push('/options'); };

  return (
    <section className="home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="bg" src="/hero-slice-1672.jpg" srcSet="/hero-slice-1000.jpg 1000w, /hero-slice-1672.jpg 1672w" sizes="(min-width: 768px) 100vw, 300vw" alt="" fetchPriority="high" />
      <p className="home-tag">Build your cake like a game, or pick one ready. A real bakery in Seoul bakes it.</p>
      <div className="home-cta">
        <button className="btn" onClick={game}>Game</button>
        <button className="btn" onClick={() => router.push('/cakes')}>Order</button>
      </div>
    </section>
  );
}
