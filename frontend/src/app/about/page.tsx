import Link from 'next/link';
import { Shops } from '@/components/Shops';

export default function AboutPage() {
  return (
    <div className="pad">
      <h1 className="title" style={{ marginBottom: 0 }}>About us</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="about-img" src="/hero-1000.jpg" alt="Red velvet crumbs falling onto cream" />
      <div className="prose">
        <p>Cake Kitchen turns ordering a cake into a game. Stack the layers, spread the cream, drop the strawberries, and a small bakery in Seoul bakes exactly what you made.</p>
        <p>Halal, allergy-free, low-sugar and vegan needs are fixed rules on every ingredient, never AI guesses. Anything unsafe is locked before you can pick it.</p>
      </div>
      <h2 style={{ marginTop: 34 }}>How it works</h2>
      <ol className="steps-a">
        <li><b>Build or pick</b>Play the kitchen game, or choose a ready cake.</li>
        <li><b>A local bakery bakes it</b>Your order goes straight to the bakery with a picture and every ingredient. No DMs.</li>
        <li><b>Virtual vs real</b>The bakery sends a photo when it&apos;s ready. Follow it live.</li>
      </ol>
      <h2 style={{ marginTop: 34 }}>Our bakeries</h2>
      <Shops />
      <div className="stack" style={{ marginTop: 30 }}>
        <Link className="btn" href="/partnership">Become a partner</Link>
      </div>
      <p className="muted small it" style={{ marginTop: 24 }}>Hackathon demo. Bakeries, prices and orders are samples.</p>
    </div>
  );
}
