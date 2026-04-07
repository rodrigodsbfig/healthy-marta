import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Users } from 'lucide-react'

const recipe = {
  title: 'Salmon & Quinoa',
  servings: 4,
  prepTime: 15,
  cookTime: 25,
  imageUrl: null,
  nutrition: { calories: 463, protein: 33, carbs: 67, fat: 18 },
  ingredients: [
    { name: 'Salmon fillet',    quantity: '2 pieces', unit: '(300g)' },
    { name: 'Quinoa, dry',      quantity: '100g',     unit: '' },
    { name: 'Asparagus',        quantity: '300g',     unit: '' },
    { name: 'Olive oil',        quantity: '2 tbsp',   unit: '' },
    { name: 'Lemon',            quantity: '1',        unit: 'whole' },
    { name: 'Garlic',           quantity: '2 cloves', unit: '' },
    { name: 'Salt & pepper',    quantity: 'to taste', unit: '' },
  ],
  steps: [
    'Rinse quinoa under cold water, then cook in 200ml salted water for 15 minutes until fluffy.',
    'While quinoa cooks, trim asparagus and toss with olive oil, salt and pepper.',
    'Roast asparagus at 200°C for 12–15 minutes until tender and slightly charred.',
    'Season salmon fillets with salt, pepper, and minced garlic. Pan-fry skin-side down on medium-high heat for 4 minutes, then flip for 2 minutes.',
    'Plate quinoa, top with asparagus and salmon. Finish with a squeeze of lemon.',
  ],
}

const nutritionBadges = [
  { label: 'Calories', value: `${recipe.nutrition.calories} kcal`, bg: 'bg-[#EEE0FF]', text: 'text-[#7B5EA7]' },
  { label: 'Protein',  value: `${recipe.nutrition.protein}g`,      bg: 'bg-[#E8F5EE]', text: 'text-[#2D9B5C]' },
  { label: 'Carbs',    value: `${recipe.nutrition.carbs}g`,        bg: 'bg-[#F5EDE0]', text: 'text-[#E89B6C]' },
  { label: 'Fat',      value: `${recipe.nutrition.fat}g`,          bg: 'bg-[#FDF8F2]', text: 'text-[#7A6775]' },
]

export function RecipeDetail() {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back nav */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[#7B5EA7] text-[13px] hover:opacity-70 transition-opacity"
      >
        <ArrowLeft size={15} />
        Back to Meal Plan
      </button>

      {/* Two-column layout */}
      <div className="flex gap-8">
        {/* Left — image + nutrition */}
        <div className="w-64 shrink-0 space-y-4">
          {/* Image placeholder */}
          <div className="w-full aspect-square rounded-2xl bg-[#EEE0FF] flex items-center justify-center shadow-[0_4px_24px_0_#7B5EA71A]">
            <span className="text-5xl">🍣</span>
          </div>

          {/* Nutrition badges */}
          <div className="grid grid-cols-2 gap-2">
            {nutritionBadges.map(b => (
              <div key={b.label} className={`${b.bg} rounded-xl p-3`}>
                <p className={`text-[11px] font-medium ${b.text} opacity-70`}>{b.label}</p>
                <p className={`text-sm font-bold ${b.text}`}>{b.value}</p>
              </div>
            ))}
          </div>

          {/* Quick meta */}
          <div className="flex gap-4 text-[12px] text-[#7A6775]">
            <span className="flex items-center gap-1">
              <Clock size={13} /> {recipe.prepTime + recipe.cookTime} min
            </span>
            <span className="flex items-center gap-1">
              <Users size={13} /> {recipe.servings} servings
            </span>
          </div>
        </div>

        {/* Right — details */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Title */}
          <div>
            <h1 className="font-display font-bold text-3xl text-[#2D1F3D]">{recipe.title}</h1>
            <p className="text-sm text-[#7A6775] mt-1">
              1 serving · {recipe.servings} servings total · prep {recipe.prepTime}min · cook {recipe.cookTime}min
            </p>
          </div>

          {/* Add to plan */}
          <button className="w-full bg-[#7B5EA7] text-white font-semibold py-3 rounded-full hover:bg-[#6a4e94] transition-colors">
            Add to Meal Plan
          </button>

          {/* Ingredients */}
          <div>
            <h2 className="font-display font-bold text-base text-[#2D1F3D] mb-3">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map(ing => (
                <li key={ing.name} className="flex justify-between text-sm">
                  <span className="text-[#2D1F3D]">{ing.name}</span>
                  <span className="text-[#7A6775]">{ing.quantity} {ing.unit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div className="border-t border-[#E8D9C8]" />

          {/* Instructions */}
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
        </div>
      </div>
    </div>
  )
}
