import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, PackageOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/yeu-cau', label: 'Yêu cầu Xuất lẻ', icon: FileText },
  { path: '/bao-cao', label: 'Báo cáo', icon: BarChart3 },
];

export function AppLayout() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/yeu-cau')) return 'Quản lý Yêu cầu Xuất lẻ';
    if (location.pathname.startsWith('/bao-cao')) return 'Báo cáo Thống kê';
    return 'Xuất lẻ ngoài';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900 antialiased">
      <aside
        className={clsx(
          'z-20 flex shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 shadow-[8px_0_24px_rgba(15,23,42,0.16)] transition-all duration-300',
          isSidebarCollapsed ? 'w-20' : 'w-[280px]'
        )}
      >
        <div className={clsx('flex h-[72px] items-center border-b border-white/10 bg-slate-950 px-4', isSidebarCollapsed ? 'justify-center' : 'justify-start')}>
          <div className="flex min-w-0 items-center gap-3 text-xl font-bold text-white">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400 ring-1 ring-blue-400/20">
              <PackageOpen size={22} />
            </div>
            {!isSidebarCollapsed && <span className="truncate">XuatLe App</span>}
          </div>
        </div>

        <nav className={clsx('flex flex-1 flex-col gap-2 overflow-y-auto py-6', isSidebarCollapsed ? 'px-3' : 'px-4')}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isSidebarCollapsed ? item.label : undefined}
                className={clsx(
                  'relative flex items-center overflow-hidden rounded-xl py-3 font-medium text-slate-400 transition hover:bg-white/5 hover:text-white',
                  isSidebarCollapsed ? 'justify-center px-3' : 'gap-3 px-4',
                  isActive && 'font-semibold text-white'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 -z-10 rounded-xl bg-blue-600 shadow-[0_10px_24px_rgba(37,99,235,0.28)]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={20} className="relative z-10 shrink-0" />
                {!isSidebarCollapsed && <span className="relative z-10 truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className={clsx('border-t border-white/10 p-4', isSidebarCollapsed ? 'px-3' : 'px-6')}>
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-white/10 text-slate-300 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-white"
            title={isSidebarCollapsed ? 'Mở sidebar' : 'Thu sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-slate-200/70 bg-white/85 px-8 shadow-sm shadow-slate-200/40 backdrop-blur-xl">
          <div>
            <h1 className="text-xl font-semibold text-slate-950">{getPageTitle()}</h1>
            <div className="mt-0.5 h-1 w-12 rounded-full bg-blue-600" />
          </div>
          <div className="flex cursor-pointer items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pr-3 pl-1.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-blue-200 hover:shadow-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500 font-semibold text-white shadow-sm">U</div>
            <span>TaiKhoan: {import.meta.env.VITE_DEFAULT_TAI_KHOAN || 1}</span>
          </div>
        </header>

        <div className="relative flex-1 overflow-y-auto p-8">
          <div className="h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
