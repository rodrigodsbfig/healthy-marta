import { query, mutation } from '../_generated/server'
import { v } from 'convex/values'

const ingredientValidator = v.object({
  name: v.string(),
  quantity: v.number(),
  unit: v.string(),
})

const nutritionValidator = v.object({
  calories: v.number(),
  protein: v.number(),
  carbs: v.number(),
  fat: v.number(),
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('recipes').order('desc').collect()
  },
})

export const get = query({
  args: { id: v.id('recipes') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    servings: v.number(),
    prepTime: v.number(),
    cookTime: v.number(),
    ingredients: v.array(ingredientValidator),
    steps: v.array(v.string()),
    tags: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    nutrition: v.optional(nutritionValidator),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('recipes', args)
  },
})

export const update = mutation({
  args: {
    id: v.id('recipes'),
    title: v.string(),
    description: v.optional(v.string()),
    servings: v.number(),
    prepTime: v.number(),
    cookTime: v.number(),
    ingredients: v.array(ingredientValidator),
    steps: v.array(v.string()),
    tags: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    nutrition: v.optional(nutritionValidator),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields)
  },
})

export const remove = mutation({
  args: { id: v.id('recipes') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
