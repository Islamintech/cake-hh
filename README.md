# Cake Kitchen (working name) — Habsida Hackathon 2026

A game-like cake builder (inspired by Purple Place's cake game) where people in Korea build a cake on their phone and a real local bakery bakes and delivers it. AI suggests cakes from what people crave; halal, allergy-free, low-sugar and vegan options are built in.

## What's in this folder

| File | What it is |
| --- | --- |
| `backend/` | The API server (Node + Express + SQLite): catalog, pricing, dietary rules, AI suggestions, orders, live tracking, bakery dashboard. See `backend/README.md`. |
| `demo/cake-kitchen-demo.html` | The working demo. Double-click to open in any browser (works offline; AI suggestions and cross-device orders only work in the online version). |
| `docs/competitor-research.md` | Similar projects in Uzbekistan and abroad, and what they mean for the pitch |
| `docs/hackathon-notes.md` | Event rules, judging criteria, pitch outline and judge Q&A |
| `docs/project-explanation-LINK.md` | Link to the full project explanation (Uzbek) |

## Online links

- Live demo: https://claude.ai/artifact/9yUh3PnK8ag45vF51eps4C
- Full project explanation (Uzbek): https://claude.ai/code/artifact/6847b817-c402-438a-a097-2801f2206836

## Status (Sep 24, 2026)

- Landing page: redesigned (café style, animated hero where the cake builds itself)
- Next: rebuild the kitchen with image layers (sprites) that drop onto the cake
- Then: AI "Help me choose", options and bakery list, result, checkout, tracking, bakery dashboard
