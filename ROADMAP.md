# Meal Prep App — Roadmap

## The Core Loop

```
Add recipes → Plan the week → Buy ingredients → Cook
```

Everything in this app serves these four steps.

---

## Phase 1 — The Core Loop (MVP)
**Goal**: A working app where you can plan a week and walk out the door with a shopping list.

- [ ] Basic layout: sidebar nav + page shell
- [ ] Recipe Library
  - Add a recipe manually (title, ingredients, servings, prep/cook time, steps)
  - View, edit, delete recipes
  - Recipe cards with warm visual design
- [ ] Recipe import from URL
  - Paste any recipe website URL → app fills in the fields automatically
  - User reviews and saves
- [ ] Weekly Planner
  - 7-day grid with breakfast / lunch / dinner / snack slots
  - Click a slot → pick a recipe → set servings
  - Navigate between weeks
- [ ] Shopping List
  - Auto-generated from the current week's plan
  - Quantities merged across recipes (e.g. 3 recipes needing olive oil → one line item)
  - Check off items while shopping
  - Manually add/remove items

**Deliverable**: Plan a week, get a shopping list, go shopping.

---

## Phase 2 — Your Data
**Goal**: Make the app personal — your recipes, your plan, your macros.

- [ ] Auth (sign up / log in)
  - All data becomes per-user
- [ ] Nutrition data on recipes
  - Add calories, protein, carbs, fat per serving (manual entry)
- [ ] Daily food log
  - "What did I eat today?" — pull from planned meals with one tap
  - See daily calorie/macro totals
- [ ] Macro goals
  - Set daily targets; see progress vs. goal

**Deliverable**: Your own account, your own data, basic nutrition awareness.

---

## Phase 3 — Smarter Shopping
**Goal**: Stop buying things you already have.

- [ ] Pantry inventory
  - Track what's in your kitchen (name, quantity, unit)
  - Optional expiry date with warnings
- [ ] Shopping list improvements
  - Items you have in the pantry are grayed out / skipped
  - Organize by category (Produce, Dairy, Meat, Dry Goods, etc.)
- [ ] Recipe serving scaler
  - Adjust servings on any recipe → all ingredient quantities update throughout the app

**Deliverable**: Smarter, faster shopping.

---

## Phase 4 — Polish & Power
**Goal**: Make the app delightful and shareable.

- [ ] Meal plan templates — save a week and reuse it
- [ ] Dietary tags & filters — vegan, gluten-free, etc.
- [ ] Shareable recipe links — public read-only view
- [ ] Mobile PWA — installable, works offline while shopping

---

## Cut (revisit only if users ask)
- Meal Prep Sessions (cook order planner) — adds complexity, low usage expected
- Cost tracking — nice idea, rarely maintained in practice

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Vite + React + TypeScript | Fast, widely supported |
| Backend & DB | Convex | Real-time, no separate API needed |
| Styling | Tailwind + shadcn/ui | Consistent, accessible components |
| Auth | Convex Auth | Native integration, simplest setup |
| Recipe import | Convex action + recipe parser API | Server-side scraping, clean separation |
| Nutrition (Phase 1) | Manual entry | Simple first, API later if needed |
