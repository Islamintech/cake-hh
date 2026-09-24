# Cake Kitchen (working name) — Habsida Hackathon 2026

A game-like cake builder (inspired by Purple Place's cake game) where people in Korea build a cake on their phone and a real local bakery bakes and delivers it. AI suggests cakes from what people crave; halal, allergy-free, low-sugar and vegan options are built in.

## What's in this folder

| File | What it is |
| --- | --- |
| `frontend/` | The web app (Next.js + TypeScript): landing, kitchen game, AI suggestions, checkout, live tracking and the bakery dashboard. See `frontend/README.md`. |
| `backend/` | The API (TypeScript, Express, SQLite): catalog, pricing, dietary rules, AI suggestions, orders, live updates. See `backend/README.md`. |
| `demo/cake-kitchen-demo.html` | The working demo. Double-click to open in any browser (works offline; AI suggestions and cross-device orders only work in the online version). |
| `docs/competitor-research.md` | Similar projects in Uzbekistan and abroad, and what they mean for the pitch |
| `docs/hackathon-notes.md` | Event rules, judging criteria, pitch outline and judge Q&A |
| `docs/project-explanation-LINK.md` | Link to the full project explanation (Uzbek) |

## Run it locally

Needs Node 20.9+. Use two terminals:

```bash
cd backend && npm install && npm run dev     # API on http://localhost:4000
```

```bash
cd frontend && npm install && npm run dev    # app on http://localhost:3000
```

Open http://localhost:3000 and build a cake. To play the bakery, open **For bakeries** in a second tab and sign in with `dev-admin-key`. Orders appear there live, and the customer's tracking page updates as you move them along.

## Online links

- Live demo: https://claude.ai/artifact/9yUh3PnK8ag45vF51eps4C
- Full project explanation (Uzbek): https://claude.ai/code/artifact/6847b817-c402-438a-a097-2801f2206836

## Status (Sep 24, 2026)

- Web app (`frontend/`): every demo screen is ported to Next.js and wired to the API. That covers landing, dietary options, bakeries, AI suggestions, the kitchen game, result, checkout, live tracking and the bakery dashboard.
- API (`backend/`): TypeScript, MVC, 20 tests. Server-side pricing and safety rules, AI suggestions (Groq or Claude) with a house-recipe fallback, and live updates.
- Next: image-layer sprites for the kitchen, SMS for tracking links, real payments, photo upload for bakeries, and hosting (frontend on Vercel, API on a Node host).
