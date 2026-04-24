import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, PackageOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/yeu-cau', label: 'Yêu cầu Xuất lẻ', icon: FileText },
  { path: '/bao-cao', label: 'Báo cáo', icon: BarChart3 },
];

export function AppLayout() {
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/yeu-cau')) return 'Quản lý Yêu cầu Xuất lẻ';
    if (location.pathname.startsWith('/bao-cao')) return 'Báo cáo Thống kê';
    return 'Xuất lẻ ngoài';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
      {/* Sidebar */}
      <aside className="z-20 flex w-[280px] flex-col border-r border-slate-100 bg-white shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
        <div className="flex h-[72px] items-center border-b border-slate-100 px-6">
          <div className="flex items-center gap-3 text-xl font-bold text-blue-600">
            <PackageOpen size={24} />
            <span>XuatLe App</span>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={clsx(
                  'relative flex items-center gap-3 overflow-hidden rounded-lg px-4 py-3 font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900',
                  isActive && 'font-semibold text-blue-600'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 -z-10 rounded-lg bg-blue-50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={20} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
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
              transition={{ duration: 0.2, ease: "easeOut" }}
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
