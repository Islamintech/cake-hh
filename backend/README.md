# Cake Kitchen API

Backend for the Cake Kitchen demo: catalog, bakery filtering, server-side pricing and dietary rules, AI cake suggestions, guest orders, live tracking and the bakery dashboard.

TypeScript (strict) on Node 20+, Express 5, SQLite. No external services are required. The AI is optional: set GROQ_API_KEY (free tier) or ANTHROPIC_API_KEY. Without either, suggestions come from the house recipes.

## Run

```bash
cd backend
npm install
npm run dev        # run the TypeScript directly (tsx), restarts on file changes → http://localhost:4000
npm test           # 19 tests: rules + every endpoint over HTTP
npm run typecheck  # tsc --noEmit over src and tests
npm run build      # compile src/ → dist/
npm start          # run the compiled server (production)
```

In development the dashboard keys are printed at startup: `dev-admin-key`, `dev-bakery-s1`, `dev-bakery-s2` and `dev-bakery-s3`. Copy `.env.example` to `.env` to change settings. With `NODE_ENV=production` the server refuses to start without real keys and an explicit `CORS_ORIGINS`.

## Architecture (MVC)

```
src/
├── models/        M: data and business rules, no HTTP
│   ├── catalog.ts          static data: ingredients, bakeries, prices, presets
│   ├── DietaryOptions.ts   halal/allergen/vegan lock rules
│   ├── Bakery.ts           lookup, "can this bakery serve these options", menu, lead time
│   ├── Cake.ts             design validation, pricing, combos, nutrition stats
│   ├── Order.ts            placing rules, status machine, SQLite repository
│   └── database.ts         connection + schema
├── views/         V: the only place response JSON is shaped
│   ├── orderView.ts, bakeryView.ts, catalogView.ts, miscViews.ts (quote, suggestions, health, errors)
├── controllers/   C: thin; read the request, call models, render a view
│   ├── catalogController.ts     catalog, bakeries, quote
│   ├── suggestionController.ts  AI suggestions
│   ├── orderController.ts       checkout, tracking, tracking stream
│   ├── dashboardController.ts   bakery staff: list, show, status, live feed
│   └── healthController.ts
├── routes/        URL → middleware → controller action
├── middleware/    auth, body validation, rate limiting, request log, error handler
├── validators/    zod request schemas (shape only; business rules stay in models)
├── services/      suggestionService (Groq or Claude + house recipes), orderEvents (live-update hub)
├── utils/         HttpError, Korea-time dates, text cleaning, secure compare/codes, SSE
├── config/        env loading + production checks
├── types.ts       shared domain types (Cake, Order, Bakery, Actor, …) + Express Request.actor
├── app.ts         composition root: builds models, services and controllers, mounts routes
└── server.ts      starts the HTTP server
```

Import paths use `.js` extensions (standard for TypeScript ESM on Node); they resolve to the `.ts` files.

Request body types come from the zod schemas (`z.infer`), so they can't drift from what validation accepts. Each route runs `validateBody(schema)` before its controller reads `req.body` as that type.

A request flows **route → middleware (auth, validate) → controller → model(s) → view → JSON**. Models throw `HttpError` for rule violations, and the error handler renders them with `errorView`. Controllers that need state (the order repository, the AI service, the event hub) are factories that receive it from `app.ts`. This keeps them easy to test and to swap: for example, SQLite for Postgres only touches `models/Order.ts` and `models/database.ts`.

## Principles

- **The server is the source of truth.** Prices, discounts and stats are recomputed on every quote and order. Any price the client sends is ignored.
- **Safety filters are fixed rules, never AI.** Every ingredient is checked against the customer's options (halal, allergens, vegan) and the bakery's stock and layer limit.
- **AI is boxed in.** The model (Groq or Claude) only sees ingredients that already passed the rules, and its output schema restricts it to those ids. Every id is then checked again. The customer's note is treated as data. On a refusal, error, timeout or missing key, the house recipes are used.
- **Guest orders stay private.** Tracking needs the secret `trackingToken` returned at checkout (the SMS link). A wrong token gets the same 404 as a missing order.

## Endpoints

All responses are JSON. Errors look like `{ "error": { "code", "message", "details?" } }`.

### Public

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/api/health` | DB and AI status |
| GET | `/api/catalog` | Shapes, sizes, batters, frostings, toppings, options, pairings, presets, occasions, cravings, time slots, pricing rules |
| GET | `/api/bakeries?options=halal,no_milk` | Bakeries that can make a cake for these options (`&all=true` lists all, with a `fits` flag) |
| GET | `/api/bakeries/:id?options=vegan` | One bakery plus its menu; each ingredient has `locked: null` or a reason |
| POST | `/api/quote` | `{ bakeryId, cake, options }` → validated cake, `subtotal/discount/total`, `stats`, `combos`, `description` |
| POST | `/api/ai/suggest` | `{ occasion?, cravings[], sweet?, text?, options[] }` → `{ source: "ai" \| "local", suggestions[3] }` |
| POST | `/api/orders` | Place a guest order (below) → `201 { order, trackingToken }` |
| GET | `/api/orders/:code?token=…` | Track an order (or send the `X-Tracking-Token` header) |
| GET | `/api/orders/:code/stream?token=…` | SSE: an `order` event now and on every status change |

### Bakery dashboard (`Authorization: Bearer <key>`)

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/api/bakery/me` | Who the key belongs to (a bakery, or admin) |
| GET | `/api/bakery/orders?status=received,accepted&limit=40&before=<ts>` | The bakery's orders, newest first, paginated with `nextBefore`; admin can add `&bakeryId=` |
| GET | `/api/bakery/orders/:code` | One order, including `nextStatuses` |
| POST | `/api/bakery/orders/:code/status` | `{ status, photoUrl? }`: moves the order forward |
| GET | `/api/bakery/stream?key=…` | SSE: a `snapshot` event, then an `order` event for each new or changed order |

A bakery key only sees that bakery's orders. The admin key sees all of them, which is what the demo's single dashboard needs.

### Order status flow

```
received → accepted → baking → ready → pickedup                 (pickup)
                                 ready → delivering → delivered (delivery)
received → declined
```

Invalid moves return `409 invalid_transition` with the allowed next statuses. Two staff clicking at once cannot double-apply, because updates are compare-and-set; the loser gets `409 conflict`. A `photoUrl` (https only) can be attached when marking an order `ready`. Every change is stored in `history` with who made it and when.

### Placing an order

```json
POST /api/orders
{
  "bakeryId": "s1",
  "options": ["halal"],
  "cake": {
    "shape": "round", "size": "m", "lettering": "Happy Birthday!",
    "layers": [{ "batter": "vanilla", "frosting": "whip",
                 "toppings": [{ "id": "straw", "fx": 0.2, "fy": -0.1 }] }]
  },
  "customer": { "name": "Jiwoo", "phone": "010-1234-5678", "mode": "pickup", "addr": "" },
  "date": "2026-09-26",
  "time": "13:00",
  "tasteProfile": { "occasion": "Birthday", "cravings": ["fruity"], "sweet": 2 }
}
```

The server checks all of the following:

- shape and size
- the bakery's layer limit and stock
- dietary locks
- at most 12 toppings per layer, and lettering of 18 characters or fewer
- phone format
- delivery available at that bakery, and an address when delivery is chosen
- a real date, no earlier than the bakery's lead time and no more than 60 days ahead (Korea time)
- a valid time slot

Order codes look like `CK-7QK4MZ`.

## Frontend

The web app in [`../frontend`](../frontend) uses every endpoint above: the catalog and bakery menus for the kitchen, `/api/quote` for the result page, `/api/orders` for checkout, and the SSE streams for tracking and the dashboard. The response shapes still match what `demo/cake-kitchen-demo.html` reads (`id` = `code`, `bakeryName`, `customer.mode`, `photo`, …).

## Not built yet

- **SMS:** the tracking link is returned in the response. Plug an SMS provider in at the marked spot in `src/controllers/orderController.ts`.
- **Payments:** checkout is still "(demo)".
- **Photo upload storage:** only an https `photoUrl` is accepted.
- **Bakery self-onboarding:** bakeries, keys and menus are configured in `src/models/catalog.ts` and `.env`.
- **Multiple servers:** live updates use an in-process event hub, which is right for a single server. Running several servers would need Redis or Postgres LISTEN/NOTIFY.
