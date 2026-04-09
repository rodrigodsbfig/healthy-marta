import { action } from '../_generated/server'
import { v } from 'convex/values'
import Anthropic from '@anthropic-ai/sdk'

const BASE_SYSTEM_PROMPT = `You are a recipe extraction assistant. Extract recipe information and return ONLY a valid JSON object with this exact structure — no markdown, no explanation, just raw JSON:

{
  "title": "string",
  "description": "string (one sentence, optional — use null if not applicable)",
  "servings": number,
  "prepTime": number (integer minutes),
  "cookTime": number (integer minutes),
  "ingredients": [
    { "name": "string", "quantity": number, "unit": "string" }
  ],
  "steps": ["string"],
  "tags": ["string"],
  "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number }
}

Rules:
- quantity must be a plain number (e.g. 100, not "100g"). Put the unit separately.
- unit must be one of: g, kg, ml, L, tbsp, tsp, cup, pieces, whole, cloves, slices, to taste
- tags from: Breakfast, Lunch, Dinner, Snack, Vegetarian, Vegan, High Protein, Low Carb, Gluten-Free, Dairy-Free
- tags must always be in English (use the exact values from the list above)
- nutrition is per serving. Estimate if not given — do not leave it out.
- If you cannot extract a field, use a sensible default (e.g. servings: 2, prepTime: 10)`

function buildSystemPrompt(language?: string) {
  const langInstruction = language === 'pt'
    ? '\n- All text fields (title, description, ingredient names, steps) must be in European Portuguese (Portugal). Do not use Brazilian Portuguese.'
    : '\n- All text fields (title, description, ingredient names, steps) must be in English.'
  return BASE_SYSTEM_PROMPT + langInstruction
}

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set in Convex environment variables.')
  return new Anthropic({ apiKey: key })
}

function parseRecipe(text: string) {
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  const data = JSON.parse(cleaned)
  return {
    title:       String(data.title ?? 'Untitled Recipe'),
    description: data.description && data.description !== 'null' ? String(data.description) : undefined,
    servings:    Number(data.servings)  || 2,
    prepTime:    Number(data.prepTime)  || 0,
    cookTime:    Number(data.cookTime)  || 0,
    ingredients: Array.isArray(data.ingredients)
      ? data.ingredients.map((i: { name: string; quantity: number; unit: string }) => ({
          name: String(i.name),
          quantity: Number(i.quantity) || 0,
          unit: String(i.unit),
        }))
      : [],
    steps: Array.isArray(data.steps) ? data.steps.map(String) : [],
    tags:  Array.isArray(data.tags)  ? data.tags.map(String)  : [],
    nutrition: data.nutrition
      ? {
          calories: Number(data.nutrition.calories) || 0,
          protein:  Number(data.nutrition.protein)  || 0,
          carbs:    Number(data.nutrition.carbs)    || 0,
          fat:      Number(data.nutrition.fat)      || 0,
        }
      : undefined,
  }
}

// ─── From photo ───────────────────────────────────────────────────────────────
export const fromPhoto = action({
  args: {
    base64:   v.string(),
    mimeType: v.string(),
    language: v.optional(v.string()),
  },
  handler: async (_ctx, { base64, mimeType, language }) => {
    const client = getClient()
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: buildSystemPrompt(language),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp', data: base64 },
            },
            { type: 'text', text: 'Extract the recipe from this image and return it as JSON.' },
          ],
        },
      ],
    })
    const text = response.content.find(b => b.type === 'text')?.text ?? ''
    return parseRecipe(text)
  },
})

// ─── From URL ────────────────────────────────────────────────────────────────
export const fromUrl = action({
  args: {
    url:      v.string(),
    language: v.optional(v.string()),
  },
  handler: async (_ctx, { url, language }) => {
    let html: string
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; recipe-importer/1.0)' },
      })
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      html = await res.text()
    } catch (e) {
      throw new Error(`Could not load that URL. Make sure it's a public recipe page. (${(e as Error).message})`)
    }

    const jsonLdMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
    let contextText = ''
    if (jsonLdMatch) {
      for (const block of jsonLdMatch) {
        const inner = block.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim()
        if (inner.includes('"Recipe"') || inner.includes('"@type":"Recipe"')) {
          contextText = inner
          break
        }
      }
    }

    if (!contextText) {
      contextText = html
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 6000)
    }

    const client = getClient()
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: buildSystemPrompt(language),
      messages: [
        {
          role: 'user',
          content: `Extract the recipe from this webpage content and return it as JSON.\n\nURL: ${url}\n\nContent:\n${contextText}`,
        },
      ],
    })
    const text = response.content.find(b => b.type === 'text')?.text ?? ''
    return parseRecipe(text)
  },
})

// ─── From description ─────────────────────────────────────────────────────────
export const fromDescription = action({
  args: {
    description: v.string(),
    language:    v.optional(v.string()),
  },
  handler: async (_ctx, { description, language }) => {
    const client = getClient()
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: buildSystemPrompt(language),
      messages: [
        {
          role: 'user',
          content: `Generate a complete recipe based on this description and return it as JSON:\n\n${description}`,
        },
      ],
    })
    const text = response.content.find(b => b.type === 'text')?.text ?? ''
    return parseRecipe(text)
  },
})
