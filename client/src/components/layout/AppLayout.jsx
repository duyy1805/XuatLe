import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, PackageOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import styles from './AppLayout.module.css';

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
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <PackageOpen size={24} />
            <span>XuatLe App</span>
          </div>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={clsx(styles.navItem, isActive && styles.navItemActive)}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className={styles.activeBackground}
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
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>{getPageTitle()}</h1>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>U</div>
            <span>TaiKhoan: {import.meta.env.VITE_DEFAULT_TAI_KHOAN || 1}</span>
          </div>
        </header>
        
        <div className={styles.content}>
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
