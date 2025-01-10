import React, { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { paymentAPI } from '../../lib/api';
import { toast } from 'sonner';

interface ManualSEPAModalProps {
  subscriptionId: string;
  customerId: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManualSEPAModal({ 
  subscriptionId, 
  customerId, 
  amount, 
  onClose, 
  onSuccess 
}: ManualSEPAModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bank_account: '',
    reference: `SEPA-${Date.now()}`
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await paymentAPI.processManualSEPAPayment({
        subscription_id: subscriptionId,
        customer_id: customerId,
        amount,
        ...formData
      });
      toast.success('Manual SEPA payment processed');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to process manual payment:', error);
      toast.error('Failed to process manual payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center mb-4">
          <CreditCard className="h-6 w-6 text-indigo-500 mr-2" />
          <h2 className="text-xl font-bold">Manual SEPA Payment</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Account (IBAN)</label>
            <input
              type="text"
              value={formData.bank_account}
              onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
              placeholder="e.g., DE89370400440532013000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Reference</label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-4">
            <p className="text-sm text-gray-700">
              <strong>Amount:</strong> €{amount.toFixed(2)}
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Processing...' : 'Process Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}