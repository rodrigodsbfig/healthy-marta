import { Plus, Search } from 'lucide-react'

const recipes = [
  { title: 'Overnight Oats & Berries', time: 10,  calories: 283, tags: ['Breakfast', 'Vegetarian'], emoji: '🫐' },
  { title: 'Grilled Chicken Bowl',     time: 30,  calories: 587, tags: ['Lunch', 'High Protein'],  emoji: '🥗' },
  { title: 'Salmon & Quinoa',          time: 40,  calories: 451, tags: ['Dinner', 'Omega-3'],      emoji: '🍣' },
  { title: 'Greek Yogurt & Granola',   time: 5,   calories: 320, tags: ['Breakfast'],              emoji: '🥣' },
  { title: 'Lentil Soup',              time: 45,  calories: 380, tags: ['Lunch', 'Vegan'],         emoji: '🍲' },
  { title: 'Chicken Stir Fry',         time: 25,  calories: 510, tags: ['Dinner', 'High Protein'], emoji: '🥘' },
]

export function Recipes() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#2D1F3D]">Recipes</h1>
          <p className="text-sm text-[#7A6775] mt-0.5">{recipes.length} recipes saved</p>
        </div>
        <button className="bg-[#7B5EA7] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add recipe
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6775]" />
        <input
          type="text"
          placeholder="Search recipes..."
          className="w-full bg-white border border-[#E8D9C8] rounded-full pl-10 pr-4 py-2.5 text-sm text-[#2D1F3D] placeholder:text-[#7A6775] outline-none focus:border-[#7B5EA7] transition-colors shadow-[0_4px_20px_0_#7B5EA714]"
        />
      </div>

      {/* Recipe grid */}
      <div className="grid grid-cols-3 gap-4">
        {recipes.map(r => (
          <div
            key={r.title}
            className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_0_#7B5EA71A] cursor-pointer hover:shadow-[0_4px_32px_0_#7B5EA730] transition-shadow"
          >
            {/* Image area */}
            <div className="h-36 bg-[#EEE0FF] flex items-center justify-center text-5xl">
              {r.emoji}
            </div>
            {/* Info */}
            <div className="p-4 space-y-2">
              <h3 className="font-display font-bold text-sm text-[#2D1F3D] leading-snug">{r.title}</h3>
              <div className="flex gap-2 flex-wrap">
                {r.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-medium bg-[#F5EDE0] text-[#7A6775] px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between text-[12px] text-[#7A6775] pt-1 border-t border-[#E8D9C8]">
                <span>{r.time} min</span>
                <span>{r.calories} kcal</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
