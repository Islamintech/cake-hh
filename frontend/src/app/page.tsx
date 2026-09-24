import { Hero } from '@/components/landing/Hero';
import { Shops, StartButtons } from '@/components/landing/LandingClient';
import { Svg } from '@/components/ui';
import { artBlueberry, artDefs, artStrawberry, LOCK_ICON, STEP_ICONS } from '@/lib/art';

const DIET = ['Halal', 'No milk', 'No egg', 'No nuts', 'No wheat', 'Low sugar', 'Vegan'];

export default function LandingPage() {
  return (
    <section className="lp">
      <Hero />

      <div className="lp-intro">
        <h1 className="lp-h1">Build your cake like a game. A real bakery bakes it.</h1>
        <p className="lp-sub">Stack the layers, spread the cream, drop the strawberries. A bakery in Seoul bakes exactly what you made.</p>
        <StartButtons />
        <p className="lp-fine">No account needed. Guests get 10% off.</p>
      </div>

      <div className="lp-sec">
        <h2>How it works</h2>
        <ol className="lp-steps">
          <li><div className="ic"><Svg markup={STEP_ICONS[0]!} /></div><div><b>Build it in the kitchen</b><span>Pan, batter, oven, cream, toppings. Every choice shows up on your cake right away.</span></div></li>
          <li><div className="ic"><Svg markup={STEP_ICONS[1]!} /></div><div><b>A local bakery bakes it</b><span>Your order goes straight to the bakery with a picture and every ingredient. No DMs.</span></div></li>
          <li><div className="ic"><Svg markup={STEP_ICONS[2]!} /></div><div><b>See yours next to the real one</b><span>The bakery sends a photo when it&apos;s ready. Share the before and after.</span></div></li>
        </ol>
      </div>

      <div className="lp-sec">
        <h2>Eat what&apos;s right for you</h2>
        <p>Tell us what to avoid. Anything unsafe is locked before you ever pick it.</p>
        <div className="diet">{DIET.map((x) => <span key={x}><i />{x}</span>)}</div>
        <div className="lp-lock">
          <div className="lk"><Svg markup={LOCK_ICON} /></div>
          <div><b>Rum buttercream</b> is locked when you choose Halal, and the app tells you why.</div>
        </div>
      </div>

      <div className="lp-sec">
        <h2>Baked by bakeries you can visit</h2>
        <p>Small shops in Seoul, each with their own ingredients.</p>
        <Shops />
      </div>

      <div className="lp-final">
        <svg className="deco" viewBox="0 0 120 120" aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: artDefs() + artStrawberry(70, 60, 2.6, -18) + artBlueberry(34, 88, 1.8) + artBlueberry(100, 98, 1.4) }} />
        <div className="px">LEVEL 1</div>
        <h2>Your first cake is one tap away.</h2>
        <StartButtons withAi={false} />
      </div>

      <p className="lp-foot">Hackathon demo. Bakeries, prices and orders are samples.</p>
    </section>
  );
}
