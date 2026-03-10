# Meal Prep App — Roadmap

## Feature List

### Core Features
1. **Recipe Library** — Create, edit, delete recipes with ingredients, steps, servings, prep/cook time, and tags
2. **Weekly Meal Planner** — Drag-and-drop calendar to assign recipes to breakfast/lunch/dinner/snack slots per day
3. **Meal Prep Sessions** — Plan a batch cooking session from a meal plan: see what to cook, in what order, with scaled quantities
4. **Shopping List** — Auto-generate from meal plan (with deduplication + quantity merging); manual items; check off while shopping; organize by store section
5. **Pantry Inventory** — Track what you have; subtract from shopping list generation; expiration date warnings
6. **Nutrition Tracking** — Log what you actually ate; daily calorie/macro summary; weekly charts; goal setting
7. **Recipe Import** — Paste a URL and scrape recipe data (via Convex action + external parser)
8. **User Auth** — Sign up/login; all data is per-user

### Nice to Have
9. **Recipe Scaling** — Adjust servings dynamically; quantities update throughout
10. **Dietary Filters** — Tag recipes (vegan, gluten-free, etc.) and filter throughout the app
11. **Cost Tracking** — Attach prices to pantry/shopping items; estimate weekly grocery cost
12. **Meal Templates** — Save a week plan as a reusable template
13. **Sharing** — Share a recipe or shopping list via link (read-only)
14. **Mobile PWA** — Installable, offline-capable for use while shopping

---

## Phase 1 — Foundation (MVP)
**Goal**: Working app with recipes + meal plan + shopping list

- [ ] Project scaffolding (Vite + React + TS + Tailwind + shadcn/ui)
- [ ] Convex setup: schema, auth
- [ ] Recipe CRUD (create, list, view, edit, delete)
  - Fields: title, description, servings, prep time, cook time, ingredients (name + qty + unit), steps, tags, image
- [ ] Weekly Meal Planner
  - 7-day grid, 4 slots per day
  - Assign/remove recipes per slot
  - Navigate between weeks
- [ ] Shopping List generation
  - Derive from current week's plan
  - Merge duplicate ingredients across recipes
  - Check-off items
  - Manual add/remove
- [ ] Basic UI layout: sidebar nav, responsive grid

**Deliverable**: User can plan a week of meals and get a shopping list

---

## Phase 2 — Prep & Pantry
**Goal**: Batch cooking planning + inventory management

- [ ] Prep Session planner
  - Select a week → see all distinct recipes → order by cook time/oven use
  - Mark steps as done
  - Estimated total prep time
- [ ] Pantry Inventory
  - Add/edit/delete items with quantities and optional expiry date
  - Mark items as "in pantry" to auto-subtract from shopping list
  - Expiry warnings (within 3 days)
- [ ] Shopping list improvements
  - "Already have" items grayed out based on pantry
  - Organize by category (Produce, Dairy, Meat, Dry Goods, etc.)

**Deliverable**: Full prep workflow from plan → cook → track what's in the fridge

---

## Phase 3 — Nutrition & Tracking
**Goal**: Close the loop on what was actually eaten

- [ ] Nutrition data on recipes (manual entry: calories, protein, carbs, fat per serving)
- [ ] Daily food log: log a meal from recipes or free-text
- [ ] Dashboard: today's macros vs. goals, weekly summary chart
- [ ] User goals: set daily calorie + macro targets
- [ ] Nutrition source: optional integration with Open Food Facts API

**Deliverable**: Nutrition awareness without being a dedicated calorie counter

---

## Phase 4 — Polish & Power Features
**Goal**: Make the app delightful and shareable

- [ ] Recipe import from URL (scrape + parse via Convex action)
- [ ] Recipe scaling (adjust servings → scale all ingredients)
- [ ] Meal plan templates (save & reuse a week)
- [ ] Shareable recipe links (public read-only view)
- [ ] PWA manifest + service worker for mobile/offline
- [ ] Cost tracking (price per item, weekly estimate)
- [ ] Dietary tags & filtering across all recipe lists

---

## Tech Decisions Log

| Decision | Choice | Reason |
|---|---|---|
| Frontend | Vite + React + TS | Fast DX, broad ecosystem |
| Backend | Convex | Real-time, schema-typed, no separate API layer needed |
| Styling | Tailwind + shadcn/ui | Rapid UI with accessible components |
| Auth | Convex Auth | Native integration, simplest setup |
| Recipe nutrition | Manual first, API later | Avoids complexity in Phase 1 |
