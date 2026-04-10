import { action } from '../_generated/server'
import { v } from 'convex/values'
import Anthropic from '@anthropic-ai/sdk'

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set in Convex environment variables.')
  return new Anthropic({ apiKey: key })
}

// ─── Parse voice transcript into pantry items ─────────────────────────────────
export const parseTranscript = action({
  args: {
    transcript: v.string(),
    language:   v.optional(v.string()),
  },
  handler: async (_ctx, { transcript, language }) => {
    const client = getClient()
    const langHint = language === 'pt'
      ? 'The user spoke in European Portuguese. Ingredient names in the output should remain in Portuguese.'
      : 'The user spoke in English.'

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `You are a pantry assistant. The user will give you a voice transcript listing pantry items.
Extract each item and return ONLY a valid JSON array — no markdown, no explanation.
Each element: { "name": string, "quantity": number, "unit": string }
Unit must be one of: g, kg, ml, L, tbsp, tsp, cup, pieces, whole, cloves, slices.
If no quantity is mentioned, use 1. If no unit is clear, use "pieces".
${langHint}`,
      messages: [
        { role: 'user', content: `Transcript: "${transcript}"` },
      ],
    })

    const text = response.content.find(b => b.type === 'text')?.text ?? '[]'
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    try {
      const items = JSON.parse(cleaned)
      if (!Array.isArray(items)) return []
      return items.map((i: { name: unknown; quantity: unknown; unit: unknown }) => ({
        name:     String(i.name ?? '').trim(),
        quantity: Number(i.quantity) || 1,
        unit:     String(i.unit ?? 'pieces').trim(),
      })).filter(i => i.name.length > 0)
    } catch {
      return []
    }
  },
})

// ─── Estimate macros from a meal name ────────────────────────────────────────
export const estimateMacros = action({
  args: {
    label:    v.string(),
    servings: v.optional(v.number()),
    language: v.optional(v.string()),
  },
  handler: async (_ctx, { label, servings = 1, language }) => {
    const client = getClient()
    const langHint = language === 'pt'
      ? 'The meal name may be in Portuguese. Understand it and estimate accordingly.'
      : ''

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: `You are a nutrition expert. Given a meal name and serving count, estimate the macros.
Return ONLY a valid JSON object — no markdown, no explanation:
{ "calories": number, "protein": number, "carbs": number, "fat": number }
All values are integers for the total amount (all servings combined).
Be realistic — use typical restaurant/home-cooked portion sizes.
${langHint}`,
      messages: [
        {
          role: 'user',
          content: `Meal: "${label}", servings: ${servings}. Estimate the macros.`,
        },
      ],
    })

    const text = response.content.find(b => b.type === 'text')?.text ?? '{}'
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    try {
      const data = JSON.parse(cleaned)
      return {
        calories: Math.round(Number(data.calories) || 0),
        protein:  Math.round(Number(data.protein)  || 0),
        carbs:    Math.round(Number(data.carbs)     || 0),
        fat:      Math.round(Number(data.fat)       || 0),
      }
    } catch {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }
  },
})
