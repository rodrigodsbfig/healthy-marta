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
    <aside className="w-56 shrink-0 bg-white h-screen flex flex-col border-r border-[#E8D9C8] sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7B5EA7] to-[#9B7EC8] flex items-center justify-center shadow-[0_2px_8px_0_#7B5EA740]">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <div>
            <span className="font-display font-bold text-[14px] text-[#2D1F3D] leading-none block">
              healthy
            </span>
            <span className="font-display font-bold text-[14px] text-[#7B5EA7] leading-none block">
              Marta
            </span>
          </div>
        </div>
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
                'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-colors relative',
                isActive
                  ? 'bg-[#EEE0FF] text-[#7B5EA7] font-semibold'
                  : 'text-[#7A6775] hover:bg-[#F5EDE0] hover:text-[#2D1F3D]',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#7B5EA7] rounded-full" />
                )}
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + language */}
      <div className="border-t border-[#E8D9C8] mx-4" />
      <div className="p-4 space-y-3">
        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B5EA7] to-[#9B7EC8] flex items-center justify-center shrink-0 shadow-[0_2px_6px_0_#7B5EA730]">
            <span className="text-white text-xs font-semibold">M</span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#2D1F3D] leading-tight">Marta</p>
            <p className="text-[10px] text-[#7A6775] truncate">marta@email.com</p>
          </div>
        </div>

        {/* Language toggle */}
        <div className="flex gap-1.5">
          {LANGUAGES.map(l => (
            <button
              key={l.value}
              onClick={() => setLang(l.value)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors border',
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
