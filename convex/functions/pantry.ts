import { query, mutation } from '../_generated/server'
import { v } from 'convex/values'

/** Portuguese-first aisles, matching the shopping list's categoriser. */
function categorise(name: string): string {
  const n = name.toLowerCase()
  if (/salm[ãa]o|pescada|dourada|atum|bacalhau|peixe|marisco|fish|salmon|tuna/.test(n)) return 'Peixe'
  if (/frango|peru|vaca|bife|porco|carne|presunto|fiambre|chicken|beef|turkey/.test(n)) return 'Carne'
  if (/ovo|clara|queijo|iogurte|babybel|philadelphia|manteiga|leite|natas|egg|cheese|yogurt/.test(n)) return 'Frescos'
  if (/legume|salada|br[óo]colo|couve|cenoura|tomate|alface|pepino|courgette|pimento|ab[óo]bora|espinafre|cebola|alho|fruta|banana|ma[çc][ãa]|laranja|lim[ãa]o|morango|abacate|fruit|vegetable/.test(n)) return 'Frutas e Legumes'
  if (/p[ãa]o|tosta|marinheira|tortilha|tortita|bread/.test(n)) return 'Padaria'
  if (/arroz|massa|quinoa|bulgur|amaranto|trigo|aveia|granola|tapioca|batata|inhame|lentilha|gr[ãa]o|tremo[çc]o|azeite|[óo]leo|vinagre|molho|sal|especiaria|canela|caf[ée]|ch[áa]|chocolate|frutos secos|semente|rice|pasta|oat|oil/.test(n)) return 'Mercearia'
  return 'Outros'
}

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

/**
 * Fold the old `staples` table into pantryItems as alwaysBuy entries.
 * Idempotent: a staple whose name is already kept is skipped, and the source
 * row is deleted either way so re-running cannot duplicate.
 */
export const mergeStaplesIntoPantry = mutation({
  args: {},
  handler: async (ctx) => {
    const staples = await ctx.db.query('staples').collect()
    const pantry = await ctx.db.query('pantryItems').collect()
    const known = new Map(pantry.map((p) => [p.name.toLowerCase(), p]))

    let moved = 0
    for (const s of staples) {
      const existing = known.get(s.name.toLowerCase())
      if (existing) {
        await ctx.db.patch(existing._id, { alwaysBuy: s.active })
      } else {
        await ctx.db.insert('pantryItems', {
          name: s.name,
          quantity: s.quantity ?? 1,
          unit: s.unit ?? '',
          category: s.category ?? categorise(s.name),
          alwaysBuy: s.active,
          // A staple says what she buys, not what she currently has.
          inStock: false,
        })
        moved++
      }
      await ctx.db.delete(s._id)
    }
    return { moved, removedStaples: staples.length }
  },
})

export const removeItem = mutation({
  args: { id: v.id('pantryItems') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
