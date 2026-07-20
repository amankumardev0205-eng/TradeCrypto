import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import UserDashboard from './pages/UserDashboard';
import TradingPage from './pages/TradingPage';
import WalletPage from './pages/WalletPage';
import MarketsPage from './pages/MarketsPage';
import PortfolioPage from './pages/PortfolioPage';
import OrdersPage from './pages/OrdersPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/terminal" replace />;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MarketProvider>
          <Router>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/markets" element={<MarketsPage />} />

              {/* Trading & Application Terminal Pages */}
              <Route path="/trading" element={<TradingPage />} />
              <Route path="/terminal" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
              <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Admin Dashboard */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

              {/* Fallback to Landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </MarketProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;