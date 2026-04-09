import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'
import type { Lang } from '@/lib/translations'
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  ShoppingCart,
  UtensilsCrossed,
} from 'lucide-react'

const LANGUAGES: { value: Lang; label: string }[] = [
  { value: 'en', label: '🇬🇧 EN' },
  { value: 'pt', label: '🇵🇹 PT' },
]

export function Sidebar() {
  const { t, lang, setLang } = useLanguage()

  const navItems = [
    { to: '/',              label: t('nav_today'),    icon: LayoutDashboard },
    { to: '/meal-plan',     label: t('nav_meal_plan'), icon: CalendarDays },
    { to: '/recipes',       label: t('nav_recipes'),  icon: BookOpen },
    { to: '/shopping-list', label: t('nav_shopping'), icon: ShoppingCart },
    { to: '/prep',          label: t('nav_prep'),     icon: UtensilsCrossed },
  ]

  return (
    <aside className="w-60 shrink-0 bg-white h-screen flex flex-col border-r border-[#E8D9C8] sticky top-0">
      {/* Logo */}
      <div className="px-6 pt-7 pb-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#EEE0FF] flex items-center justify-center">
          <span className="text-[#7B5EA7] text-sm font-bold">M</span>
        </div>
        <span className="font-display font-bold text-[15px] text-[#2D1F3D]">
          healthy Marta
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-colors',
                isActive
                  ? 'bg-[#EEE0FF] text-[#7B5EA7] font-semibold'
                  : 'text-[#7A6775] hover:bg-[#F5EDE0]',
              )
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + language */}
      <div className="border-t border-[#E8D9C8] mx-4" />
      <div className="p-4 space-y-3">
        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EEE0FF] flex items-center justify-center shrink-0">
            <span className="text-[#7B5EA7] text-sm font-semibold">M</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#2D1F3D]">Marta</p>
            <p className="text-[11px] text-[#7A6775]">marta@email.com</p>
          </div>
        </div>

        {/* Language toggle */}
        <div className="flex gap-1.5">
          {LANGUAGES.map(l => (
            <button
              key={l.value}
              onClick={() => setLang(l.value)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border',
                lang === l.value
                  ? 'bg-[#7B5EA7] text-white border-[#7B5EA7]'
                  : 'text-[#7A6775] border-[#E8D9C8] hover:bg-[#F5EDE0]',
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
