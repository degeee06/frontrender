import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import PublicSchedulePage from './pages/PublicSchedulePage';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { PremiumProvider } from './contexts/PremiumContext';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <PremiumProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/schedule/:userId/:t" element={<PublicSchedulePage />} />
            </Routes>
          </HashRouter>
        </PremiumProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;