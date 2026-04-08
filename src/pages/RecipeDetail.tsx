import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { ArrowLeft, Clock, Users, Pencil, Trash2, ChefHat } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { RecipeForm } from '@/components/RecipeForm'

const nutritionConfig = [
  { key: 'calories' as const, label: 'Calories', unit: 'kcal', bg: 'bg-[#EEE0FF]',  text: 'text-[#7B5EA7]' },
  { key: 'protein'  as const, label: 'Protein',  unit: 'g',    bg: 'bg-[#E8F5EE]',  text: 'text-[#2D9B5C]' },
  { key: 'carbs'   as const, label: 'Carbs',    unit: 'g',    bg: 'bg-[#FFF3E8]',  text: 'text-[#E89B6C]' },
  { key: 'fat'     as const, label: 'Fat',       unit: 'g',    bg: 'bg-[#F5EDE0]',  text: 'text-[#7A6775]' },
]

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const recipe = useQuery(api.functions.recipes.get, { id: id as Id<'recipes'> })
  const remove = useMutation(api.functions.recipes.remove)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    if (!recipe) return
    await remove({ id: recipe._id })
    navigate('/recipes')
  }

  // Loading
  if (recipe === undefined) {
    return (
      <div className="max-w-5xl mx-auto pt-20 text-center text-[#7A6775] text-sm">
        Loading recipe…
      </div>
    )
  }

  // Not found
  if (recipe === null) {
    return (
      <div className="max-w-5xl mx-auto pt-20 text-center">
        <p className="text-[#7A6775] text-sm mb-4">Recipe not found.</p>
        <button onClick={() => navigate('/recipes')} className="text-[#7B5EA7] font-semibold text-sm">
          ← Back to Recipes
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/recipes')}
            className="flex items-center gap-1.5 text-[#7B5EA7] text-[13px] hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={15} />
            Back to Recipes
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 border border-[#E8D9C8] text-[#7A6775] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#FDF8F2] transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 border border-red-200 text-red-400 text-sm font-semibold px-4 py-2 rounded-full hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-8">
          {/* Left — image + nutrition */}
          <div className="w-64 shrink-0 space-y-4">
            <div className="w-full aspect-square rounded-2xl bg-[#EEE0FF] flex items-center justify-center shadow-[0_4px_24px_0_#7B5EA71A]">
              <ChefHat size={56} className="text-[#7B5EA7] opacity-30" />
            </div>

            {recipe.nutrition && (
              <div className="grid grid-cols-2 gap-2">
                {nutritionConfig.map(n => (
                  <div key={n.key} className={`${n.bg} rounded-xl p-3`}>
                    <p className={`text-[11px] font-medium ${n.text} opacity-70`}>{n.label}</p>
                    <p className={`text-sm font-bold ${n.text}`}>
                      {recipe.nutrition![n.key]} {n.unit}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4 text-[12px] text-[#7A6775]">
              <span className="flex items-center gap-1">
                <Clock size={13} /> {recipe.prepTime + recipe.cookTime} min
              </span>
              <span className="flex items-center gap-1">
                <Users size={13} /> {recipe.servings} servings
              </span>
            </div>

            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {recipe.tags.map(tag => (
                  <span key={tag} className="text-[11px] font-medium bg-[#F5EDE0] text-[#7A6775] px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right — details */}
          <div className="flex-1 min-w-0 space-y-6">
            <div>
              <h1 className="font-display font-bold text-3xl text-[#2D1F3D]">{recipe.title}</h1>
              {recipe.description && (
                <p className="text-sm text-[#7A6775] mt-2">{recipe.description}</p>
              )}
              <p className="text-sm text-[#7A6775] mt-1">
                Prep {recipe.prepTime} min · Cook {recipe.cookTime} min · {recipe.servings} servings
              </p>
            </div>

            {/* Ingredients */}
            {recipe.ingredients.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-base text-[#2D1F3D] mb-3">Ingredients</h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span className="text-[#2D1F3D]">{ing.name}</span>
                      <span className="text-[#7A6775]">{ing.quantity} {ing.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recipe.ingredients.length > 0 && recipe.steps.length > 0 && (
              <div className="border-t border-[#E8D9C8]" />
            )}

            {/* Steps */}
            {recipe.steps.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-base text-[#2D1F3D] mb-3">Instructions</h2>
                <ol className="space-y-3">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#7A6775]">
                      <span className="font-bold text-[#7B5EA7] shrink-0 w-5">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <RecipeForm open={editOpen} onClose={() => setEditOpen(false)} existing={recipe} />

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-[#2D1F3D]/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-[#2D1F3D]">Delete recipe?</h3>
            <p className="text-sm text-[#7A6775]">
              "{recipe.title}" will be permanently removed. This can't be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-[#E8D9C8] text-[#7A6775] font-semibold py-2.5 rounded-full hover:bg-[#FDF8F2] transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-full hover:bg-red-600 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
