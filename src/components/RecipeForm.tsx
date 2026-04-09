import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { X, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Id } from '../../convex/_generated/dataModel'

type Ingredient = { name: string; quantity: string; unit: string }
type Nutrition = { calories: string; protein: string; carbs: string; fat: string }

type RecipeData = {
  _id: Id<'recipes'>
  title: string
  description?: string
  servings: number
  prepTime: number
  cookTime: number
  ingredients: { name: string; quantity: number; unit: string }[]
  steps: string[]
  tags: string[]
  nutrition?: { calories: number; protein: number; carbs: number; fat: number }
}

type RecipePrefill = Omit<RecipeData, '_id'>

interface RecipeFormProps {
  open: boolean
  onClose: () => void
  existing?: RecipeData   // editing a saved recipe
  prefill?: RecipePrefill // pre-filling from AI import
}

const UNITS = ['g', 'kg', 'ml', 'L', 'tbsp', 'tsp', 'cup', 'pieces', 'whole', 'cloves', 'slices', 'to taste']
const TAGS = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Vegetarian', 'Vegan', 'High Protein', 'Low Carb', 'Gluten-Free', 'Dairy-Free']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-[#7A6775] uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const inputClass = 'w-full bg-[#FDF8F2] border border-[#E8D9C8] rounded-xl px-3 py-2.5 text-sm text-[#2D1F3D] placeholder:text-[#7A6775] outline-none focus:border-[#7B5EA7] transition-colors'

export function RecipeForm({ open, onClose, existing, prefill }: RecipeFormProps) {
  const create = useMutation(api.functions.recipes.create)
  const update = useMutation(api.functions.recipes.update)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [servings, setServings] = useState('2')
  const [prepTime, setPrepTime] = useState('10')
  const [cookTime, setCookTime] = useState('20')
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity: '', unit: 'g' }])
  const [steps, setSteps] = useState<string[]>([''])
  const [tags, setTags] = useState<string[]>([])
  const [nutrition, setNutrition] = useState<Nutrition>({ calories: '', protein: '', carbs: '', fat: '' })
  const [saving, setSaving] = useState(false)

  // Pre-fill when editing or importing
  useEffect(() => {
    const source = existing ?? prefill
    if (source) {
      setTitle(source.title)
      setDescription(source.description ?? '')
      setServings(String(source.servings))
      setPrepTime(String(source.prepTime))
      setCookTime(String(source.cookTime))
      setIngredients(source.ingredients.map(i => ({ name: i.name, quantity: String(i.quantity), unit: i.unit })))
      setSteps(source.steps.length ? source.steps : [''])
      setTags(source.tags)
      setNutrition({
        calories: String(source.nutrition?.calories ?? ''),
        protein:  String(source.nutrition?.protein  ?? ''),
        carbs:    String(source.nutrition?.carbs    ?? ''),
        fat:      String(source.nutrition?.fat      ?? ''),
      })
    } else {
      setTitle(''); setDescription(''); setServings('2'); setPrepTime('10'); setCookTime('20')
      setIngredients([{ name: '', quantity: '', unit: 'g' }]); setSteps(['']); setTags([])
      setNutrition({ calories: '', protein: '', carbs: '', fat: '' })
    }
  }, [existing, prefill, open])

  function addIngredient() {
    setIngredients(prev => [...prev, { name: '', quantity: '', unit: 'g' }])
  }
  function removeIngredient(i: number) {
    setIngredients(prev => prev.filter((_, idx) => idx !== i))
  }
  function updateIngredient(i: number, field: keyof Ingredient, value: string) {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))
  }

  function addStep() { setSteps(prev => [...prev, '']) }
  function removeStep(i: number) { setSteps(prev => prev.filter((_, idx) => idx !== i)) }
  function updateStep(i: number, value: string) { setSteps(prev => prev.map((s, idx) => idx === i ? value : s)) }

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        servings: Number(servings) || 1,
        prepTime: Number(prepTime) || 0,
        cookTime: Number(cookTime) || 0,
        ingredients: ingredients
          .filter(i => i.name.trim())
          .map(i => ({ name: i.name.trim(), quantity: Number(i.quantity) || 0, unit: i.unit })),
        steps: steps.filter(s => s.trim()),
        tags,
        nutrition: nutrition.calories
          ? {
              calories: Number(nutrition.calories) || 0,
              protein:  Number(nutrition.protein)  || 0,
              carbs:    Number(nutrition.carbs)    || 0,
              fat:      Number(nutrition.fat)      || 0,
            }
          : undefined,
      }
      if (existing) {
        await update({ id: existing._id, ...payload })
      } else {
        await create(payload)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-[#2D1F3D]/30 z-40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[520px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8D9C8]">
          <h2 className="font-display font-bold text-lg text-[#2D1F3D]">
            {existing ? 'Edit Recipe' : 'New Recipe'}
          </h2>
          <button onClick={onClose} className="text-[#7A6775] hover:text-[#2D1F3D] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <Field label="Title">
            <input
              className={inputClass}
              placeholder="e.g. Salmon & Quinoa"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </Field>

          <Field label="Description (optional)">
            <textarea
              className={cn(inputClass, 'resize-none h-16')}
              placeholder="A short description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </Field>

          {/* Servings + times */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Servings">
              <input type="number" min="1" className={inputClass} value={servings} onChange={e => setServings(e.target.value)} />
            </Field>
            <Field label="Prep (min)">
              <input type="number" min="0" className={inputClass} value={prepTime} onChange={e => setPrepTime(e.target.value)} />
            </Field>
            <Field label="Cook (min)">
              <input type="number" min="0" className={inputClass} value={cookTime} onChange={e => setCookTime(e.target.value)} />
            </Field>
          </div>

          {/* Tags */}
          <Field label="Tags">
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'text-[12px] font-medium px-3 py-1 rounded-full border transition-colors',
                    tags.includes(tag)
                      ? 'bg-[#7B5EA7] text-white border-[#7B5EA7]'
                      : 'bg-[#FDF8F2] text-[#7A6775] border-[#E8D9C8] hover:border-[#7B5EA7]',
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </Field>

          {/* Ingredients */}
          <Field label="Ingredients">
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className={cn(inputClass, 'flex-1')}
                    placeholder="Ingredient"
                    value={ing.name}
                    onChange={e => updateIngredient(i, 'name', e.target.value)}
                  />
                  <input
                    className={cn(inputClass, 'w-16')}
                    placeholder="Qty"
                    type="number"
                    min="0"
                    value={ing.quantity}
                    onChange={e => updateIngredient(i, 'quantity', e.target.value)}
                  />
                  <select
                    className={cn(inputClass, 'w-24')}
                    value={ing.unit}
                    onChange={e => updateIngredient(i, 'unit', e.target.value)}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="text-[#E8D9C8] hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-1.5 text-[#7B5EA7] text-[13px] font-semibold hover:opacity-70 transition-opacity"
              >
                <Plus size={15} /> Add ingredient
              </button>
            </div>
          </Field>

          {/* Steps */}
          <Field label="Instructions">
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-[#7B5EA7] font-bold text-sm w-5 shrink-0 pt-2.5">{i + 1}.</span>
                  <textarea
                    className={cn(inputClass, 'flex-1 resize-none h-16')}
                    placeholder={`Step ${i + 1}...`}
                    value={step}
                    onChange={e => updateStep(i, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="text-[#E8D9C8] hover:text-red-400 transition-colors pt-2.5"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1.5 text-[#7B5EA7] text-[13px] font-semibold hover:opacity-70 transition-opacity"
              >
                <Plus size={15} /> Add step
              </button>
            </div>
          </Field>

          {/* Nutrition (optional) */}
          <Field label="Nutrition per serving (optional)">
            <div className="grid grid-cols-4 gap-2">
              {(['calories', 'protein', 'carbs', 'fat'] as const).map(key => (
                <div key={key}>
                  <p className="text-[11px] text-[#7A6775] mb-1 capitalize">{key === 'calories' ? 'kcal' : key + ' (g)'}</p>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    placeholder="0"
                    value={nutrition[key]}
                    onChange={e => setNutrition(prev => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8D9C8] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-[#E8D9C8] text-[#7A6775] font-semibold py-2.5 rounded-full hover:bg-[#FDF8F2] transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="flex-1 bg-[#7B5EA7] text-white font-semibold py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors text-sm disabled:opacity-50"
          >
            {saving ? 'Saving…' : existing ? 'Save changes' : 'Add recipe'}
          </button>
        </div>
      </div>
    </>
  )
}
