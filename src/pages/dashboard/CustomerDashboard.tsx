import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CreditCard, Users, Clock, AlertCircle } from 'lucide-react';
import { subscriptionAPI } from '../../lib/api';
import CustomerSidebar from '../../components/layout/CustomerSidebar';
import SubscriptionOverview from './components/SubscriptionOverview';
import FamilyMembersList from './components/FamilyMembersList';
import PaymentHistory from './components/PaymentHistory';
import BillingSettings from './components/BillingSettings';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const subscriptions = await subscriptionAPI.getAll();
      const active = subscriptions.find(sub => sub.status === 'active');
      setActiveSubscription(active);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900">
      <CustomerSidebar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {user?.email}</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your subscription and family members</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Plan</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {activeSubscription?.plans?.name || 'No active plan'}
                  </p>
                </div>
              </div>
            </div>

            {/* ... other stats with dark mode classes ... */}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <SubscriptionOverview subscription={activeSubscription} onUpdate={loadDashboardData} />
              <FamilyMembersList subscription={activeSubscription} onUpdate={loadDashboardData} />
              <PaymentHistory subscription={activeSubscription} />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <BillingSettings subscription={activeSubscription} onUpdate={loadDashboardData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}