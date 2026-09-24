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

| Route | What it does | API |
| --- | --- | --- |
| `/` | Landing page with the self-building hero cake | `GET /api/bakeries?all=true` (partner list) |
| `/options` | Dietary options (halal, allergens, vegan, low sugar) | none |
| `/suggest` | "Halmeoni suggests": occasion, cravings, sweetness | `POST /api/ai/suggest` |
| `/bakeries` | Bakeries that can make a cake for your options | `GET /api/bakeries?options=…` |
| `/kitchen` | The game: pan → size → batter → oven → cream → toppings → layers → lettering → box | `GET /api/bakeries/:id?options=…` (menu with lock reasons) |
| `/result` | Stars, nutrition and the price, confirmed by the server | `POST /api/quote` |
| `/checkout` | Guest checkout: name, phone, pickup/delivery, date, time | `POST /api/orders` |
| `/track/[code]?t=…` | Live order tracking and "virtual vs real" | `GET /api/orders/:code`, SSE `/stream` |
| `/bakery` | Bakery dashboard: sign in with a bakery key, see orders live, move them along | `/api/bakery/*`, SSE `/api/bakery/stream` |

Local demo keys for `/bakery` (printed by the backend at startup): `dev-admin-key` sees every bakery, and `dev-bakery-s1` sees only Seoul Sugar Studio.

## How it's built

```
src/
├── app/            one folder per route (see table above); layout.tsx + globals.css
├── components/     Providers (catalog, toast, store hydration), Header, CakeView, ui (Ready, chips, badges), landing/
├── lib/
│   ├── api.ts      typed API client + SSE helpers (watchOrder, watchBakeryOrders)
│   ├── types.ts    response types, mirroring backend/src/views
│   ├── rules.ts    instant price / combos / stations for the kitchen (the server re-checks everything)
│   ├── cakeSvg.ts  draws a cake as SVG (ported from the demo); all text escaped
│   ├── art.ts      static illustrations (hero, icons, logo)
│   ├── myOrders.ts tracking links saved in this browser (no accounts)
│   └── format.ts, sound.ts
└── store/useCakeStore.ts   the cake being built (Zustand, saved to sessionStorage)
```

- **The server decides.** The catalog, bakery menus (stock and lock reasons), prices, AI suggestions and orders all come from the API. `lib/rules.ts` only gives instant feedback while you build. The result page, checkout and order use the server's numbers.
- **The design is the demo's.** `globals.css` is the demo's stylesheet (CSS variables, dark mode, animations), and the cake SVG and hero are ported from it. Fonts are self-hosted through `next/font`.
- **Refresh-safe.** The cake in progress survives a reload (sessionStorage). Tracking links are saved in localStorage, so closing the tab doesn't lose an order.
