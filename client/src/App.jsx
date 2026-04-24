import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import { ConfirmProvider } from './contexts/ConfirmContext';

// Pages
import Dashboard from './pages/Dashboard';
import YeuCauList from './pages/YeuCauList';
import YeuCauCreate from './pages/YeuCauCreate';
import YeuCauDetail from './pages/YeuCauDetail';

function App() {
  return (
    <ConfirmProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<AppLayout />}>
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
  );
}

export default App;
