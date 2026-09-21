import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import avatar from '@/assets/avatar.png'
import { useLanguage } from '@/lib/language'

/**
 * The sidebar is a fixed 224px column, which left roughly 166px of usable
 * width on a phone and crushed every page. From `md` up it stays a column;
 * below that it becomes a drawer behind a header bar, so the shopping list
 * and workout calendar are usable in a shop and at the gym.
 */
export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { lang } = useLanguage()
  const location = useLocation()

  return (
    <div className="flex h-screen bg-[#FDF8F2] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="h-full shadow-2xl">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
          <button
            aria-label={lang === 'pt' ? 'Fechar menu' : 'Close menu'}
            onClick={() => setDrawerOpen(false)}
            className="flex-1 bg-[#2D1F3D]/40"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E8D9C8] shrink-0">
          <button
            aria-label={lang === 'pt' ? 'Abrir menu' : 'Open menu'}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(o => !o)}
            className="text-[#2D1F3D] p-1 -ml-1"
          >
            {drawerOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-2">
            <img src={avatar} alt="" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-display font-bold text-[14px] text-[#2D1F3D]">
              healthy <span className="text-[#7B5EA7]">Marta</span>
            </span>
          </div>
        </header>

        <main key={location.pathname} className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
