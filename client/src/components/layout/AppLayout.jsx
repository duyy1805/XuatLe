import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, PackageOpen, ChevronLeft, ChevronRight, LogOut, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/yeu-cau', label: 'Yêu cầu Xuất lẻ', icon: FileText },
  { path: '/bao-cao', label: 'Báo cáo', icon: BarChart3 },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/yeu-cau')) return 'Quản lý Yêu cầu Xuất lẻ';
    if (location.pathname.startsWith('/bao-cao')) return 'Báo cáo Thống kê';
    return 'Xuất lẻ ngoài';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
      <aside
        className={clsx(
          'z-20 flex shrink-0 flex-col border-r border-slate-200 bg-white text-slate-600 transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300',
          isSidebarCollapsed ? 'w-20' : 'w-[280px]'
        )}
      >
        <div className={clsx('flex h-[72px] items-center border-b border-slate-100 bg-white px-4 dark:border-white/10 dark:bg-slate-950', isSidebarCollapsed ? 'justify-center' : 'justify-start')}>
          <div className="flex min-w-0 items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:ring-blue-400/20">
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
                  'relative flex items-center overflow-hidden rounded-xl py-3 font-medium transition duration-200',
                  isSidebarCollapsed ? 'justify-center px-3' : 'gap-3 px-4',
                  isActive 
                    ? 'text-white' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 -z-10 rounded-xl bg-blue-600 shadow-[0_10px_24px_rgba(37,99,235,0.25)] dark:shadow-[0_10px_24px_rgba(37,99,235,0.28)]"
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

        <div className={clsx('border-t border-slate-100 p-4 dark:border-white/10', isSidebarCollapsed ? 'px-3' : 'px-6')}>
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white"
            title={isSidebarCollapsed ? 'Mở sidebar' : 'Thu sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-slate-200/70 bg-white/85 px-8 shadow-sm shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none">
          <div>
            <h1 className="text-xl font-semibold text-slate-950 dark:text-white">{getPageTitle()}</h1>
            <div className="mt-0.5 h-1 w-12 rounded-full bg-blue-600" />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pr-3 pl-1.5 text-sm font-medium text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 font-semibold text-white shadow-sm">
                {(user?.tenDayDu || user?.tenDangNhap || 'U').charAt(0).toUpperCase()}
              </div>
              <span>{user?.tenDayDu || user?.tenDangNhap || 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-red-500/50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <LogOut size={16} />
            </button>
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
