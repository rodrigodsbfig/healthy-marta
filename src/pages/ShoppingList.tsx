import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { Plus, RefreshCw, Trash2, ShoppingCart, Package, X } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'
import { getWeekStart, formatShort, weekDays } from '@/lib/dates'

type View = 'list' | 'pantry'

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

const CATEGORY_COLORS: Record<string, string> = {
  'Protein':        'bg-[#FFF3E8] text-[#E89B6C]',
  'Dairy':          'bg-[#E8F5EE] text-[#2D9B5C]',
  'Dairy & Eggs':   'bg-[#E8F5EE] text-[#2D9B5C]',
  'Produce':        'bg-[#E8F5EE] text-[#2D9B5C]',
  'Grains':         'bg-[#F5EDE0] text-[#9B7060]',
  'Grains & Legumes': 'bg-[#F5EDE0] text-[#9B7060]',
  'Pantry':         'bg-[#EEE0FF] text-[#7B5EA7]',
  'Other':          'bg-[#F5EDE0] text-[#7A6775]',
}

export function ShoppingList() {
  const { t, lang } = useLanguage()
  const [view, setView] = useState<View>('list')

  const weekStart = getWeekStart()
  const days = weekDays(weekStart)
  const weekLabel = `${formatShort(days[0])} – ${formatShort(days[6])}`

  // Shopping list
  const list = useQuery(api.functions.shoppingLists.getByWeek, { weekStart })
  const generateFromPlan = useMutation(api.functions.shoppingLists.generateFromPlan)
  const toggleItem = useMutation(api.functions.shoppingLists.toggleItem)
  const addManualItem = useMutation(api.functions.shoppingLists.addManualItem)
  const removeItem = useMutation(api.functions.shoppingLists.removeItem)

  // Pantry
  const pantryItems = useQuery(api.functions.pantry.list)
  const addPantryItem = useMutation(api.functions.pantry.addItem)
  const removePantryItem = useMutation(api.functions.pantry.removeItem)

  const [addingItem, setAddingItem] = useState(false)
  const [newName, setNewName] = useState('')
  const [newQty, setNewQty] = useState('')
  const [newUnit, setNewUnit] = useState('g')
  const [generating, setGenerating] = useState(false)

  const [addingPantry, setAddingPantry] = useState(false)
  const [pantryName, setPantryName] = useState('')
  const [pantryQty, setPantryQty] = useState('')
  const [pantryUnit, setPantryUnit] = useState('g')

  const items = list?.items ?? []
  const checked = items.filter(i => i.checked).length

  // Build a Set of pantry item names for quick lookup
  const pantryNameSet = new Set((pantryItems ?? []).map(p => p.name.toLowerCase()))

  const categories = Array.from(
    items.reduce((map, item, idx) => {
      const cat = item.category ?? 'Other'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push({ ...item, idx })
      return map
    }, new Map<string, (typeof items[number] & { idx: number })[]>())
  )

  const pantryByCategory = Array.from(
    (pantryItems ?? []).reduce((map, item) => {
      const cat = item.category ?? 'Other'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(item)
      return map
    }, new Map<string, typeof pantryItems>())
  )

  async function handleGenerate() {
    setGenerating(true)
    try { await generateFromPlan({ weekStart }) }
    finally { setGenerating(false) }
  }

  async function handleAddManual() {
    if (!newName.trim()) return
    await addManualItem({ weekStart, name: newName.trim(), quantity: Number(newQty) || 1, unit: newUnit || 'piece' })
    setNewName(''); setNewQty(''); setNewUnit('g'); setAddingItem(false)
  }

  async function handleAddPantry() {
    if (!pantryName.trim()) return
    await addPantryItem({ name: pantryName.trim(), quantity: Number(pantryQty) || 1, unit: pantryUnit || 'g' })
    setPantryName(''); setPantryQty(''); setPantryUnit('g'); setAddingPantry(false)
  }

  const inputCls = 'w-full bg-[#FDF8F2] border border-[#E8D9C8] rounded-xl px-3 py-2.5 text-sm text-[#2D1F3D] placeholder:text-[#7A6775] outline-none focus:border-[#7B5EA7] transition-colors'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#2D1F3D]">{t('shopping_list')}</h1>
          <p className="text-sm text-[#7A6775] mt-0.5">{weekLabel} · {t('from_meal_plan')}</p>
        </div>
        <div className="flex items-center gap-3">
          {view === 'list' && items.length > 0 && (
            <span className="text-sm text-[#7A6775]">
              <span className="font-semibold text-[#7B5EA7]">{checked}</span> {t('of_items')} {items.length} {t('items')}
            </span>
          )}
          {view === 'list' && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 border border-[#E8D9C8] text-[#7A6775] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#F5EDE0] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
              {generating ? t('generating') : t('gen_from_plan')}
            </button>
          )}
          {view === 'pantry' && (
            <button
              onClick={() => setAddingPantry(true)}
              className="flex items-center gap-2 bg-[#7B5EA7] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#6a4e94] transition-colors"
            >
              <Plus size={14} /> {t('add_to_pantry')}
            </button>
          )}
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 p-1 bg-[#F5EDE0] rounded-full w-fit">
        {(['list', 'pantry'] as View[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors',
              view === v
                ? 'bg-white text-[#2D1F3D] shadow-sm'
                : 'text-[#7A6775] hover:text-[#2D1F3D]',
            )}
          >
            {v === 'list'
              ? <><ShoppingCart size={13} /> {t('to_buy')}</>
              : <><Package size={13} /> {t('in_pantry')} {pantryItems && pantryItems.length > 0 && <span className="ml-0.5 bg-[#7B5EA7] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{pantryItems.length}</span>}</>
            }
          </button>
        ))}
      </div>

      {/* ── SHOPPING LIST VIEW ── */}
      {view === 'list' && (
        <>
          {/* Progress bar */}
          {items.length > 0 && (
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-[#EEE0FF] rounded-full overflow-hidden">
                <div
                  className="h-3 bg-[#7B5EA7] rounded-full transition-all duration-500"
                  style={{ width: `${items.length ? (checked / items.length) * 100 : 0}%` }}
                />
              </div>
              {checked === items.length && items.length > 0 && (
                <p className="text-[12px] font-semibold text-[#7B5EA7] text-center">
                  ✓ {lang === 'pt' ? 'Lista completa!' : 'All done!'}
                </p>
              )}
            </div>
          )}

          {/* Empty state */}
          {list !== undefined && items.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-[#EEE0FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={28} className="text-[#7B5EA7]" />
              </div>
              <h3 className="font-display font-bold text-base text-[#2D1F3D] mb-1">{t('no_items_yet')}</h3>
              <p className="text-sm text-[#7A6775] mb-5">{t('shopping_hint')}</p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-[#7B5EA7] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors disabled:opacity-50"
              >
                {generating ? t('generating') : t('gen_from_ml')}
              </button>
            </div>
          )}

          {/* Category groups */}
          {categories.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {categories.map(([category, catItems]) => (
                <div key={category} className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', CATEGORY_COLORS[category] ?? 'bg-[#F5EDE0] text-[#7A6775]')}>
                      {category}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {catItems.map(item => {
                      const inPantry = pantryNameSet.has(item.name.toLowerCase())
                      return (
                        <li key={item.idx} className="flex items-center gap-3 group">
                          <button onClick={() => toggleItem({ weekStart, index: item.idx })} className="shrink-0">
                            <CheckIcon checked={item.checked} />
                          </button>
                          <span className={cn(
                            'flex-1 text-sm transition-colors',
                            item.checked ? 'text-[#7A6775] line-through' : 'text-[#2D1F3D]',
                          )}>
                            {item.name}
                          </span>
                          {inPantry && !item.checked && (
                            <span className="text-[10px] font-semibold text-[#2D9B5C] bg-[#E8F5EE] px-1.5 py-0.5 rounded-full shrink-0">
                              {t('have_it')}
                            </span>
                          )}
                          <span className={cn(
                            'text-[12px] shrink-0',
                            item.checked ? 'text-[#E8D9C8]' : 'text-[#7A6775]',
                          )}>
                            {item.quantity} {item.unit}
                          </span>
                          {item.manual && (
                            <button
                              onClick={() => removeItem({ weekStart, index: item.idx })}
                              className="opacity-0 group-hover:opacity-100 text-[#E8D9C8] hover:text-red-400 transition-all shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Add manual item */}
          <div className="flex justify-center">
            {!addingItem ? (
              <button
                onClick={() => setAddingItem(true)}
                className="flex items-center gap-2 bg-[#F5EDE0] text-[#7B5EA7] font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#EEE0FF] transition-colors"
              >
                <Plus size={16} /> {t('add_to_my_list')}
              </button>
            ) : (
              <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714] w-full max-w-md space-y-3">
                <h3 className="font-display font-bold text-sm text-[#2D1F3D]">{t('add_item')}</h3>
                <input
                  autoFocus className={inputCls} placeholder={t('item_name')}
                  value={newName} onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddManual()}
                />
                <div className="flex gap-2">
                  <input type="number" min="0" className={cn(inputCls, 'w-24')} placeholder={t('qty')}
                    value={newQty} onChange={e => setNewQty(e.target.value)} />
                  <input className={cn(inputCls, 'flex-1')} placeholder={t('unit_hint')}
                    value={newUnit} onChange={e => setNewUnit(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAddingItem(false)}
                    className="flex-1 border border-[#E8D9C8] text-[#7A6775] text-sm font-semibold py-2 rounded-full hover:bg-[#FDF8F2] transition-colors">
                    {t('cancel')}
                  </button>
                  <button onClick={handleAddManual} disabled={!newName.trim()}
                    className="flex-1 bg-[#7B5EA7] text-white text-sm font-semibold py-2 rounded-full hover:bg-[#6a4e94] transition-colors disabled:opacity-50">
                    {t('add')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── PANTRY VIEW ── */}
      {view === 'pantry' && (
        <>
          {/* Add pantry item form */}
          {addingPantry && (
            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#2D1F3D]">{t('add_to_pantry')}</h3>
                <button onClick={() => setAddingPantry(false)} className="text-[#7A6775] hover:text-[#2D1F3D]"><X size={16} /></button>
              </div>
              <input
                autoFocus className={inputCls} placeholder={t('item_name')}
                value={pantryName} onChange={e => setPantryName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPantry()}
              />
              <div className="flex gap-2">
                <input type="number" min="0" className={cn(inputCls, 'w-24')} placeholder={t('qty')}
                  value={pantryQty} onChange={e => setPantryQty(e.target.value)} />
                <input className={cn(inputCls, 'flex-1')} placeholder={t('unit_hint')}
                  value={pantryUnit} onChange={e => setPantryUnit(e.target.value)} />
              </div>
              <button onClick={handleAddPantry} disabled={!pantryName.trim()}
                className="w-full bg-[#7B5EA7] text-white text-sm font-semibold py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors disabled:opacity-50">
                {t('add')}
              </button>
            </div>
          )}

          {/* Empty pantry */}
          {pantryItems !== undefined && pantryItems.length === 0 && !addingPantry && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-[#EEE0FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package size={28} className="text-[#7B5EA7]" />
              </div>
              <h3 className="font-display font-bold text-base text-[#2D1F3D] mb-1">{t('pantry_empty')}</h3>
              <p className="text-sm text-[#7A6775] mb-5 max-w-xs mx-auto">{t('pantry_hint')}</p>
              <button
                onClick={() => setAddingPantry(true)}
                className="bg-[#7B5EA7] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors"
              >
                {t('add_to_pantry')}
              </button>
            </div>
          )}

          {/* Pantry items by category */}
          {pantryByCategory.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {pantryByCategory.map(([category, catItems]) => (
                <div key={category} className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', CATEGORY_COLORS[category] ?? 'bg-[#F5EDE0] text-[#7A6775]')}>
                      {category}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {(catItems ?? []).map(item => (
                      <li key={item!._id} className="flex items-center gap-3 group">
                        <div className="w-2 h-2 rounded-full bg-[#2D9B5C] shrink-0" />
                        <span className="flex-1 text-sm text-[#2D1F3D]">{item!.name}</span>
                        <span className="text-[12px] text-[#7A6775] shrink-0">{item!.quantity} {item!.unit}</span>
                        <button
                          onClick={() => removePantryItem({ id: item!._id })}
                          className="opacity-0 group-hover:opacity-100 text-[#E8D9C8] hover:text-red-400 transition-all shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
