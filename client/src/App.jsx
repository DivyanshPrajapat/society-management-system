import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Directory from './pages/Directory';
import AdminPanel from './pages/AdminPanel';

// Query Client Setup
const queryClient = new QueryClient();

// Placeholder components for future phases to prevent navigation breaks
const VisitorsPlaceholder = () => (
  <div className="glass-panel rounded-2xl p-8 text-center space-y-4">
    <h3 className="text-xl font-bold">Gate Approvals & Visitor Management</h3>
    <p className="text-slate-400 max-w-md mx-auto">This module connects security guard entry logs with real-time resident notifications. Implementation begins in Phase 3.</p>
  </div>
);

const ComplaintsPlaceholder = () => (
  <div className="glass-panel rounded-2xl p-8 text-center space-y-4">
    <h3 className="text-xl font-bold">Maintenance Complaints</h3>
    <p className="text-slate-400 max-w-md mx-auto">Raise and resolve maintenance tickets with category filters and staff assignment tracking. Implementation begins in Phase 4.</p>
  </div>
);

const BillingPlaceholder = () => (
  <div className="glass-panel rounded-2xl p-8 text-center space-y-4">
    <h3 className="text-xl font-bold">Billing & Society Expense Ledger</h3>
    <p className="text-slate-400 max-w-md mx-auto">Auto-generation of monthly flat maintenance dues and digital payment logs. Implementation begins in Phase 5.</p>
  </div>
);

const NoticesPlaceholder = () => (
  <div className="glass-panel rounded-2xl p-8 text-center space-y-4">
    <h3 className="text-xl font-bold">Notices Board & Real-Time Polling</h3>
    <p className="text-slate-400 max-w-md mx-auto">Broadcast critical society updates and organize live-updating community polls. Implementation begins in Phase 6.</p>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<div className="min-h-screen flex items-center justify-center p-4"><div className="glass-panel rounded-2xl p-6 text-center max-w-md"><h3 className="text-lg font-bold">Forgot Password</h3><p className="text-sm text-slate-450 mt-2">Enter your email on the API forgot-password flow or reset. Development mode fallback details are logged in the server console.</p><div className="mt-4"><a href="/login" className="text-xs text-brand-400 hover:underline">Back to Login</a></div></div></div>} />
            <Route path="/reset-password/:token" element={<div className="min-h-screen flex items-center justify-center p-4"><div className="glass-panel rounded-2xl p-6 text-center max-w-md"><h3 className="text-lg font-bold">Reset Password</h3><p className="text-sm text-slate-450 mt-2">Submit password reset configurations via backend API links.</p></div></div>} />

            {/* Protected Routes inside Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/directory"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Directory />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Future Module Placeholders (Protected) */}
            <Route
              path="/visitors"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VisitorsPlaceholder />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ComplaintsPlaceholder />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Layout>
                    <BillingPlaceholder />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notices"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NoticesPlaceholder />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Panel Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin', 'super_admin']}>
                    <Layout>
                      <AdminPanel />
                    </Layout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
