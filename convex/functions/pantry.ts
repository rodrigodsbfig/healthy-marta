import { query, mutation } from '../_generated/server'
import { v } from 'convex/values'
import { categorise } from '../lib/aisles'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('pantryItems').order('asc').take(200)
  },
})

export const addItem = mutation({
  args: {
    name: v.string(),
    quantity: v.number(),
    unit: v.string(),
    alwaysBuy: v.optional(v.boolean()),
    inStock: v.optional(v.boolean()),
  },
  handler: async (ctx, { name, quantity, unit, alwaysBuy, inStock }) => {
    await ctx.db.insert('pantryItems', {
      name,
      quantity,
      unit,
      category: categorise(name),
      alwaysBuy: alwaysBuy ?? false,
      inStock: inStock ?? true,
    })
  },
})

/** Toggle either flag on a kept food. */
export const setFlags = mutation({
  args: {
    id: v.id('pantryItems'),
    alwaysBuy: v.optional(v.boolean()),
    inStock: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, alwaysBuy, inStock }) => {
    const patch: { alwaysBuy?: boolean; inStock?: boolean } = {}
    if (alwaysBuy !== undefined) patch.alwaysBuy = alwaysBuy
    if (inStock !== undefined) patch.inStock = inStock
    await ctx.db.patch(id, patch)
  },
})

export const removeItem = mutation({
  args: { id: v.id('pantryItems') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
