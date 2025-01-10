import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './components/auth/LoginPage';
import HomePage from './pages/HomePage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import PlansPage from './pages/PlansPage';
import CheckoutPage from './pages/CheckoutPage';
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import DashboardOverview from './components/dashboard/DashboardOverview';
import UserList from './components/users/UserList';
import CreateUser from './components/users/CreateUser';
import CustomerList from './components/customers/CustomerList';
import CreateCustomer from './components/customers/CreateCustomer';
import PlanList from './components/plans/PlanList';
import CreatePlan from './components/plans/CreatePlan';
import CreateSubscription from './components/subscriptions/CreateSubscription';
import PaymentList from './components/payments/PaymentList';
import PaymentMethods from './components/payments/PaymentMethods';
import PaymentLogs from './components/payments/PaymentLogs';
import WebhookList from './components/webhooks/WebhookList';
import ReportsPage from './components/reports/ReportsPage';
import SettingsPage from './components/settings/SettingsPage';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/admin' }} />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}

function CustomerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/dashboard' }} />;
  }
  
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/checkout/:planId" element={<CheckoutPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Customer Dashboard */}
      <Route
        path="/dashboard"
        element={
          <CustomerRoute>
            <CustomerDashboard />
          </CustomerRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <MainLayout />
          </AdminRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="users">
          <Route path="list" element={<UserList />} />
          <Route path="create" element={<CreateUser />} />
        </Route>
        <Route path="customers">
          <Route path="list" element={<CustomerList />} />
          <Route path="create" element={<CreateCustomer />} />
        </Route>
        <Route path="subscriptions">
          <Route path="list" element={<div>Subscriptions List</div>} />
          <Route path="create" element={<CreateSubscription />} />
        </Route>
        <Route path="plans">
          <Route path="list" element={<PlanList />} />
          <Route path="create" element={<CreatePlan />} />
        </Route>
        <Route path="payments">
          <Route path="list" element={<PaymentList />} />
          <Route path="methods" element={<PaymentMethods />} />
          <Route path="logs" element={<PaymentLogs />} />
        </Route>
        <Route path="webhooks">
          <Route path="list" element={<WebhookList />} />
        </Route>
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}