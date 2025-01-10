import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { paymentAPI } from '../../../lib/api';

interface BillingSettingsProps {
  subscription: any;
  onUpdate: () => void;
}

export default function BillingSettings({ subscription, onUpdate }: BillingSettingsProps) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState({
    payment_method: 'sepa',
    iban: '',
    bank_name: '',
    holder_name: ''
  });
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<any>(null);

  useEffect(() => {
    if (subscription?.id) {
      loadPaymentMethod();
    }
  }, [subscription?.id]);

  const loadPaymentMethod = async () => {
    try {
      const method = await paymentAPI.getPaymentMethod(subscription.id);
      setCurrentPaymentMethod(method);
    } catch (error) {
      console.error('Failed to load payment method:', error);
    }
  };

  const handleUpdatePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentAPI.updatePaymentMethod(subscription.id, formData);
      await loadPaymentMethod();
      await onUpdate();
      setShowUpdateModal(false);
      toast.success('Payment method updated successfully');
    } catch (error) {
      console.error('Failed to update payment method:', error);
      toast.error('Failed to update payment method');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Billing Settings</h2>
        
        {/* Current Payment Method */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Current Payment Method</h3>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium">
                {currentPaymentMethod?.type === 'sepa' ? 'SEPA Direct Debit' : 'iDEAL'}
              </p>
              {currentPaymentMethod?.type === 'sepa' && currentPaymentMethod?.last_four && (
                <p className="text-sm text-gray-500">
                  IBAN ending in ****{currentPaymentMethod.last_four}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Auto-Renewal Setting */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Auto-Renewal</h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={subscription?.auto_renew || false}
              onChange={async (e) => {
                try {
                  await paymentAPI.updateAutoRenewal(subscription.id, e.target.checked);
                  await onUpdate();
                  toast.success('Auto-renewal setting updated');
                } catch (error) {
                  console.error('Failed to update auto-renewal:', error);
                  toast.error('Failed to update auto-renewal setting');
                }
              }}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-600">
              Automatically renew my subscription
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => {
              setFormData({
                payment_method: currentPaymentMethod?.type || 'sepa',
                iban: '',
                bank_name: '',
                holder_name: ''
              });
              setShowUpdateModal(true);
            }}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Payment Method
          </button>
          
          {subscription?.status === 'active' && (
            <button
              onClick={async () => {
                try {
                  await paymentAPI.cancelSubscription(subscription.id);
                  await onUpdate();
                  toast.success('Subscription cancelled successfully');
                } catch (error) {
                  console.error('Failed to cancel subscription:', error);
                  toast.error('Failed to cancel subscription');
                }
              }}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      </div>

      {/* Update Payment Method Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Update Payment Method</h3>
            <form onSubmit={handleUpdatePaymentMethod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="sepa">SEPA Direct Debit</option>
                  <option value="ideal">iDEAL</option>
                </select>
              </div>

              {formData.payment_method === 'sepa' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IBAN</label>
                    <input
                      type="text"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.holder_name}
                      onChange={(e) => setFormData({ ...formData, holder_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank</label>
                  <select
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Select Bank</option>
                    <option value="ING">ING</option>
                    <option value="ABN AMRO">ABN AMRO</option>
                    <option value="Rabobank">Rabobank</option>
                    <option value="SNS">SNS</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}