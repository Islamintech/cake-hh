# Cake Kitchen web app

The customer app and bakery dashboard: build a cake like a game, order it from a real Seoul bakery, and follow it live. Next.js 16 (App Router), React 19, TypeScript (strict) and Zustand. It talks to the API in [`../backend`](../backend).

## Run

The backend must be running first (`cd ../backend && npm run dev`, port 4000).

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build && npm start   # production
```

The API address comes from `NEXT_PUBLIC_API_URL`, which defaults to `http://localhost:4000`. Copy `.env.example` to `.env.local` to change it. In production, set the backend's `CORS_ORIGINS` to this app's origin.

## Screens

The look follows the mockups in `images/`: black and white, bold uppercase titles, italic body text, pill buttons, a menu drawer on the left and a profile panel on the right.

| Route | What it does | API |
| --- | --- | --- |
| `/` | Home: photo with **Game** and **Order** | none |
| `/cakes`, `/cakes/popular` | Ready-made cakes. Tap one to pick a bakery and size, then add it to the cart. Popular = classic flavour pairings (no sales data yet) | `GET /api/bakeries`, `/api/bakeries/:id`, `POST /api/quote` |
| `/cart` | Cart (saved in this browser); continue shopping or buy | none |
| `/checkout` | Guest checkout for the whole cart: one order per cake, same contact, date and time | `POST /api/quote`, `POST /api/orders` |
| `/orders` | Orders placed from this browser, with live status | `GET /api/orders/:code` |
| `/mood` | "Halmeoni suggests": occasion, cravings, sweetness → order it or play it (`/suggest` redirects here) | `POST /api/ai/suggest` |
| `/address` | Name, phone and address saved on this device, used at checkout | none |
| `/partnership` | Bakeries apply to join | `POST /api/partners` |
| `/about` | About, how it works, partner bakeries | `GET /api/bakeries?all=true` |
| `/options` → `/bakeries` → `/kitchen` → `/result` | The game: dietary options, bakery, build it, then add to cart | as before |
| `/track/[code]?t=…` | Live order tracking and "virtual vs real" | `GET /api/orders/:code`, SSE `/stream` |
| `/bakery` | Bakery dashboard (menu → For bakeries) | `/api/bakery/*`, SSE `/api/bakery/stream` |

Local demo keys for `/bakery` (printed by the backend at startup): `dev-admin-key` sees every bakery, and `dev-bakery-s1` sees only Seoul Sugar Studio.

## How it's built

```
src/
├── app/            one folder per route (see table above); layout.tsx + globals.css
├── components/     Providers, Header (menu + profile drawers), CakeView, CakeGrid, CakeSheet (add to cart), Shops, icons, ui
├── lib/
│   ├── api.ts      typed API client + SSE helpers (watchOrder, watchBakeryOrders)
│   ├── types.ts    response types, mirroring backend/src/views
│   ├── rules.ts    instant price / combos / stations for the kitchen (the server re-checks everything)
│   ├── cakeSvg.ts  draws a cake as SVG (ported from the demo); all text escaped
│   ├── presets.ts  ready-made cakes: "from" prices and the Popular list
│   ├── myOrders.ts tracking links saved in this browser (no accounts)
│   └── format.ts, sound.ts
└── store/          useCakeStore: the cake being built (sessionStorage) · useCartStore: cart + saved details (localStorage)
```

- **The server decides.** The catalog, bakery menus (stock and lock reasons), prices, AI suggestions and orders all come from the API. `lib/rules.ts` only gives instant feedback while you build. The result page, checkout and order use the server's numbers.
- **The design comes from `images/`.** `globals.css` defines it as CSS variables (with a dark mode); the kitchen game keeps the demo's animations. Inter and Silkscreen are self-hosted through `next/font`. `public/hero.jpg` is cut from the home mockup.
- **Refresh-safe.** The cake in progress survives a reload (sessionStorage). Tracking links are saved in localStorage, so closing the tab doesn't lose an order.

## Cake photos

The seven house cakes use real photos from `public/cakes/` (mapped by name in `src/lib/cakePhotos.ts`). Cakes built in the kitchen have no photo, so cart, order and tracking screens keep the drawing of the exact design. The photos come from [Unsplash](https://unsplash.com) under the [Unsplash License](https://unsplash.com/license) (free to use, no permission needed):

| File | Source |
| --- | --- |
| strawberry-cloud.jpg | https://unsplash.com/photos/cu1-a9LSmqo |
| seoul-matcha-garden.jpg | https://images.unsplash.com/photo-1621423828877-f6afc6fafa90 |
| midnight-chocolate.jpg | https://unsplash.com/photos/6jHpcBPw7i8 |
| goguma-hug.jpg | https://unsplash.com/photos/X59-Zlyivh8 |
| yuja-sunshine.jpg | https://images.unsplash.com/photo-1728911296471-8c57f645a44e |
| velvet-crush.jpg | https://unsplash.com/photos/9g7I6elbAXw |
| berry-garden.jpg | https://images.unsplash.com/photo-1508736375612-66c03035c629 |

For the real product, replace them with photos of the partner bakeries' own cakes.
