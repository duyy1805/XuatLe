import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, PackageOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
      <aside
        className={clsx(
          'z-20 flex shrink-0 flex-col border-r border-slate-100 bg-white shadow-[1px_0_10px_rgba(0,0,0,0.02)] transition-all duration-300',
          isSidebarCollapsed ? 'w-20' : 'w-[280px]'
        )}
      >
        <div className={clsx('flex h-[72px] items-center border-b border-slate-100 px-4', isSidebarCollapsed ? 'justify-center' : 'justify-start')}>
          <div className="flex min-w-0 items-center gap-3 text-xl font-bold text-blue-600">
            <PackageOpen size={24} className="shrink-0" />
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
                  'relative flex items-center overflow-hidden rounded-lg py-3 font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900',
                  isSidebarCollapsed ? 'justify-center px-3' : 'gap-3 px-4',
                  isActive && 'font-semibold text-blue-600'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 -z-10 rounded-lg bg-blue-50"
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

        <div className={clsx('border-t border-slate-100 p-4', isSidebarCollapsed ? 'px-3' : 'px-6')}>
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            title={isSidebarCollapsed ? 'Mở sidebar' : 'Thu sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-slate-100 bg-white/80 px-8 backdrop-blur-md">
          <h1 className="text-xl font-semibold text-slate-900">{getPageTitle()}</h1>
          <div className="flex cursor-pointer items-center gap-3 rounded-full border border-slate-100 bg-slate-50 py-1.5 pr-3 pl-1.5 text-sm font-medium text-slate-900 transition hover:border-slate-200 hover:shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-blue-700 font-semibold text-white shadow-sm">U</div>
            <span>TaiKhoan: {import.meta.env.VITE_DEFAULT_TAI_KHOAN || 1}</span>
          </div>
        </header>

        <div className="relative flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
