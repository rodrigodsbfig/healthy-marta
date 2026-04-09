import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

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
  }).index('by_user', ['userId']),

  mealPlans: defineTable({
    userId: v.optional(v.id('users')),
    weekStart: v.string(), // ISO date string (Monday)
    slots: v.array(
      v.object({
        day: v.number(), // 0=Mon … 6=Sun
        meal: v.union(
          v.literal('breakfast'),
          v.literal('lunch'),
          v.literal('dinner'),
          v.literal('snack')
        ),
        recipeId: v.id('recipes'),
        servings: v.number(),
      })
    ),
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
