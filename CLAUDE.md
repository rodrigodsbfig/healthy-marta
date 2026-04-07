# Meal Prep App — Claude Instructions

## Project Overview
A meal prepping, tracking, and shopping list app built with Vite + React + Convex.

## Tech Stack
- **Frontend**: Vite + React + TypeScript
- **Backend/DB**: Convex (real-time database + serverless functions)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Convex reactive queries (no additional state library needed)
- **Auth**: Convex Auth (or Clerk if more control is needed)

## Project Structure
```
meal-prep-app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities, helpers
├── convex/
│   ├── schema.ts         # Database schema
│   ├── functions/        # Convex queries, mutations, actions
│   └── _generated/       # Auto-generated Convex types (do not edit)
└── public/
```

## Conventions
- Use TypeScript everywhere — no `any` types
- Convex queries/mutations use the generated `api` object from `convex/_generated/api`
- All DB access goes through Convex functions — no direct client-side DB calls
- Components are function components with named exports
- File names: `PascalCase` for components, `camelCase` for hooks and utils
- Prefer `useQuery` and `useMutation` from `convex/react` for data fetching
- Keep Convex functions thin — business logic lives in the function, not the component

## Key Convex Tables (schema)
- `users` — auth profile
- `recipes` — recipe definitions with ingredients and steps
- `mealPlans` — weekly plan linking recipes to days/meals
- `prepSessions` — batch prep planning linked to a meal plan
- `shoppingLists` — auto-generated or manual shopping lists
- `pantryItems` — user's current inventory
- `nutritionLogs` — daily food logs for tracking

## Development Commands
```bash
npm run dev          # Start Vite dev server
npx convex dev       # Start Convex dev backend (run in parallel)
npm run build        # Production build
npm run lint         # ESLint
```

## Do Not
- Do not commit `convex/_generated/` (it's auto-generated)
- Do not use `useEffect` for data fetching — use Convex's `useQuery`
- Do not store sensitive data client-side
- Do not create new files for one-off utilities — prefer co-location

---

## Design Context

### Users
Busy professionals who meal prep to save time during the week, and health-focused individuals tracking nutrition and macros. They open the app with intent — they want to plan quickly, log efficiently, and feel in control of their diet without friction. They value clarity and speed over exploration.

### Brand Personality
Warm, calm, and approachable. The app should feel like a helpful kitchen companion — organized but not sterile, friendly but not cutesy. Think: a well-designed recipe app crossed with a clean health tracker. Three words: **nourishing, grounded, effortless**.

### Aesthetic Direction
- **References**: Mela (iOS recipe app) and Cal AI — warm earthy tones, clean typography, generous whitespace, food-forward visual hierarchy
- **Theme**: Light mode only — bright, airy, with warm neutrals (creamy whites, soft stone/sand backgrounds, not pure white)
- **Typography**: Readable serif or rounded sans for headings; clean sans-serif for body and data
- **Color palette**: Warm greens and earthy ambers/ochres as accent colors; muted neutrals for surfaces; avoid cold blues or clinical grays
- **Imagery tone**: Organic, natural, wholesome — if using icons or illustrations, prefer rounded, slightly organic shapes over sharp geometric ones
- **Anti-references**: Avoid cold SaaS dashboards, aggressive fitness app aesthetics (dark + neon), or overly playful/emoji-heavy interfaces

### Design Principles
1. **Calm over noise** — Reduce visual complexity at every step. Use whitespace generously. Let content breathe.
2. **Warm, not clinical** — Data and nutrition info should feel personal and encouraging, not like a spreadsheet. Use warmth in color and copy.
3. **Speed for returning users** — Common flows (log a meal, check the plan, add to shopping list) must be fast and require minimal taps/clicks.
4. **Food deserves beauty** — Recipe cards, meal slots, and ingredient lists should be visually considered. Great food photography and appealing layouts matter.
5. **Consistent spatial rhythm** — Use an 8px base spacing unit throughout. Components should feel part of the same system, not assembled from different sources.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
