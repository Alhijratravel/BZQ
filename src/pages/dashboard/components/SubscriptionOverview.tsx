import React from 'react';
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SubscriptionOverviewProps {
  subscription: any;
  onUpdate: () => void;
}

export default function SubscriptionOverview({ subscription, onUpdate }: SubscriptionOverviewProps) {
  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Subscription</h2>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">You don't have an active subscription</p>
          <Link
            to="/plans"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">Plan:</span>
            </div>
            <span className="font-medium">{subscription.plans?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">Billing Cycle:</span>
            </div>
            <span className="font-medium capitalize">{subscription.billing_cycle}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">Status:</span>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              subscription.status === 'active' ? 'bg-green-100 text-green-800' :
              subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {subscription.status}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Next Payment</p>
            <p className="text-lg font-medium text-gray-900">
              ${subscription.plans?.price}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Due Date</p>
            <p className="text-lg font-medium text-gray-900">
              {subscription.next_payment_date
                ? new Date(subscription.next_payment_date).toLocaleDateString()
                : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}