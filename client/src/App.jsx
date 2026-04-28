import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import Dashboard from './pages/Dashboard';
import YeuCauList from './pages/YeuCauList';
import YeuCauCreate from './pages/YeuCauCreate';
import YeuCauDetail from './pages/YeuCauDetail';
import Login from './pages/Login';

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <AppLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="yeu-cau" element={<YeuCauList />} />
                <Route path="yeu-cau/tao-moi" element={<YeuCauCreate />} />
                <Route path="yeu-cau/:id" element={<YeuCauDetail />} />
                <Route path="bao-cao" element={<div>Báo cáo đang phát triển...</div>} />
              </Route>
            </Routes>
            <Toaster position="top-right" richColors />
          </BrowserRouter>
        </ConfirmProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
