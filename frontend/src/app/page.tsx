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
      <img className="bg" src="/hero.jpg" alt="" fetchPriority="high" />
      <p className="home-tag">Build your cake like a game, or pick one ready. A real bakery in Seoul bakes it.</p>
      <div className="home-cta">
        <button className="btn" onClick={game}>Game</button>
        <button className="btn" onClick={() => router.push('/cakes')}>Order</button>
      </div>
    </section>
  );
}
