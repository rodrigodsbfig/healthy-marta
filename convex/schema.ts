import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * The eight eating moments prescribed in Marta's plan. Kept in sync with
 * MEAL_MOMENTS in convex/lib/plan.ts, which is the source of truth for the
 * portions each moment allows.
 */
const mealMoment = v.union(
  v.literal('acordar'),
  v.literal('pequenoAlmoco'),
  v.literal('meioDaManha'),
  v.literal('almoco'),
  v.literal('lanche1'),
  v.literal('lanche2'),
  v.literal('jantar'),
  v.literal('ceia'),
)

/**
 * Which plan option a recipe satisfies, e.g. { kind: 'proteina', optionId: 'peixe' }.
 * Stored as plain strings rather than a union so that a revised plan does not
 * force a schema migration — convex/lib/plan.ts validates the ids on write.
 */
const planComponent = v.object({
  kind: v.string(),
  optionId: v.string(),
})

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
  }).index('by_token', ['tokenIdentifier']),

  recipes: defineTable({
    userId: v.optional(v.id('users')),
    title: v.string(),
    description: v.optional(v.string()),
    servings: v.number(),
    prepTime: v.number(), // minutes
    cookTime: v.number(), // minutes
    ingredients: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        unit: v.string(),
        // The plan option this ingredient fills, when it came from the plan.
        // Lets the shopping list re-resolve the portion for the moment the
        // dish is actually served at (90g arroz at almoço, 60g at jantar)
        // instead of trusting the quantity stored at the primary moment.
        optionId: v.optional(v.string()),
      })
    ),
    steps: v.array(v.string()),
    tags: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    nutrition: v.optional(
      v.object({
        calories: v.number(),
        protein: v.number(),
        carbs: v.number(),
        fat: v.number(),
      })
    ),

    // --- Nutrition-plan compliance -----------------------------------------
    // Which meal moments this recipe may be served at. A recipe with no
    // moments is a free-form recipe the generator will never pick.
    mealMoments: v.optional(v.array(mealMoment)),
    // The plan options this recipe's ingredients satisfy. This is what lets
    // the generator prove a week is compliant instead of assuming it.
    planComponents: v.optional(v.array(planComponent)),
    // Whether the recipe includes the 200ml soup starter. Fibre portions are
    // larger without soup, so this changes the prescribed quantities.
    comSopa: v.optional(v.boolean()),
  }).index('by_user', ['userId']),

  mealPlans: defineTable({
    userId: v.optional(v.id('users')),
    weekStart: v.string(), // ISO date string (Monday)
    slots: v.array(
      v.object({
        day: v.number(), // 0=Mon … 6=Sun
        meal: mealMoment,
        recipeId: v.id('recipes'),
        servings: v.number(),
      })
    ),
    /** Set when the week was produced by the Sunday generator. */
    generatedAt: v.optional(v.number()),
    /** 'variada' = cook daily, 'pratica' = batch-cook and repeat meals. */
    generationMode: v.optional(v.union(v.literal('variada'), v.literal('pratica'))),
    /** Day index (0–6) reserved for the plan's one free meal per week. */
    refeicaoLivreDay: v.optional(v.number()),
  }).index('by_user_week', ['userId', 'weekStart']),

  prepSessions: defineTable({
    userId: v.optional(v.id('users')),
    weekStart: v.string(),
    items: v.array(v.object({
      recipeId: v.id('recipes'),
      servings: v.number(),
      completed: v.boolean(),
    })),
  }).index('by_week', ['weekStart']),

  shoppingLists: defineTable({
    userId: v.optional(v.id('users')),
    mealPlanId: v.optional(v.id('mealPlans')),
    weekStart: v.optional(v.string()),
    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        unit: v.string(),
        category: v.optional(v.string()),
        checked: v.boolean(),
        manual: v.boolean(),
      })
    ),
  }).index('by_user', ['userId']),

  pantryItems: defineTable({
    userId: v.optional(v.id('users')),
    name: v.string(),
    quantity: v.number(),
    unit: v.string(),
    category: v.optional(v.string()),
    expiryDate: v.optional(v.string()),
  }).index('by_user', ['userId']),

  /**
   * One document per day trained. Presence means "trained that day" — the
   * calendar and streak are derived from which dates exist, so marking a day
   * is an insert and unmarking is a delete.
   */
  workouts: defineTable({
    userId: v.optional(v.id('users')),
    date: v.string(), // ISO date string, YYYY-MM-DD
    type: v.optional(v.string()),
    note: v.optional(v.string()),
  })
    .index('by_date', ['date'])
    .index('by_user_date', ['userId', 'date']),

  /**
   * Items Marta buys every week regardless of what is planned (azeite, café,
   * ovos…). These are appended to every generated shopping list so she does
   * not have to remember them.
   */
  staples: defineTable({
    userId: v.optional(v.id('users')),
    name: v.string(),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    category: v.optional(v.string()),
    /** Unticked staples stay in the list but are skipped when generating. */
    active: v.boolean(),
  }).index('by_user', ['userId']),

  nutritionLogs: defineTable({
    userId: v.optional(v.id('users')),
    date: v.string(), // ISO date string
    entries: v.array(
      v.object({
        recipeId: v.optional(v.id('recipes')),
        label: v.string(),
        servings: v.number(),
        calories: v.number(),
        protein: v.number(),
        carbs: v.number(),
        fat: v.number(),
      })
    ),
  })
    .index('by_user_date', ['userId', 'date'])
    .index('by_date', ['date']),
})
