import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Item = { name: string; amount: string; checked: boolean }

const initialCategories: { label: string; items: Item[] }[] = [
  {
    label: 'Produce',
    items: [
      { name: 'Cherry tomatoes', amount: '250g',  checked: true },
      { name: 'Onion',           amount: '200g',  checked: false },
      { name: 'Asparagus',       amount: '300g',  checked: false },
      { name: 'Blueberries',     amount: '90g',   checked: false },
    ],
  },
  {
    label: 'Pantry',
    items: [
      { name: 'Butter',          amount: '110g',  checked: true },
      { name: 'Salt',            amount: '5g',    checked: false },
      { name: 'Cooking oil',     amount: '50ml',  checked: false },
    ],
  },
  {
    label: 'Protein',
    items: [
      { name: 'Salmon fillet',   amount: '300g',  checked: true },
      { name: 'Chicken breast',  amount: '400g',  checked: false },
      { name: 'Eggs',            amount: '3',     checked: false },
    ],
  },
  {
    label: 'Dairy & Eggs',
    items: [
      { name: 'Greek yogurt',    amount: '300g',  checked: false },
      { name: 'Feta cheese',     amount: '100g',  checked: false },
    ],
  },
]

function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <div className={cn(
      'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
      checked ? 'bg-[#7B5EA7] border-[#7B5EA7]' : 'border-[#E8D9C8]',
    )}>
      {checked && (
        <svg viewBox="0 0 10 8" fill="none" className="w-3 h-3">
          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}

export function ShoppingList() {
  const [categories, setCategories] = useState(initialCategories)

  const totalItems   = categories.flatMap(c => c.items).length
  const checkedItems = categories.flatMap(c => c.items).filter(i => i.checked).length

  function toggle(catIdx: number, itemIdx: number) {
    setCategories(prev =>
      prev.map((cat, ci) =>
        ci !== catIdx ? cat : {
          ...cat,
          items: cat.items.map((item, ii) =>
            ii !== itemIdx ? item : { ...item, checked: !item.checked }
          ),
        }
      )
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#2D1F3D]">Shopping List</h1>
          <p className="text-sm text-[#7A6775] mt-0.5">Apr 7 – 13 · from meal plan</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#7A6775]">
            <span className="font-semibold text-[#7B5EA7]">{checkedItems}</span> of {totalItems} items
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#EEE0FF] rounded-full">
        <div
          className="h-2 bg-[#7B5EA7] rounded-full transition-all"
          style={{ width: `${(checkedItems / totalItems) * 100}%` }}
        />
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat, ci) => (
          <div key={cat.label} className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714]">
            <h3 className="text-[12px] font-semibold text-[#7A6775] uppercase tracking-wider mb-3">
              {cat.label}
            </h3>
            <ul className="space-y-3">
              {cat.items.map((item, ii) => (
                <li
                  key={item.name}
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => toggle(ci, ii)}
                >
                  <CheckIcon checked={item.checked} />
                  <span className={cn(
                    'flex-1 text-sm transition-colors',
                    item.checked ? 'text-[#7A6775] line-through' : 'text-[#2D1F3D]',
                  )}>
                    {item.name}
                  </span>
                  <span className={cn(
                    'text-[12px]',
                    item.checked ? 'text-[#E8D9C8]' : 'text-[#7A6775]',
                  )}>
                    {item.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Add item */}
      <div className="flex justify-center">
        <button className="flex items-center gap-2 bg-[#F5EDE0] text-[#7B5EA7] font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#EEE0FF] transition-colors">
          <Plus size={16} />
          Add to my own list
        </button>
      </div>
    </div>
  )
}
