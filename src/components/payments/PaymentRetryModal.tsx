import React, { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { paymentAPI } from '../../lib/api';
import { toast } from 'sonner';

interface PaymentRetryModalProps {
  payment: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentRetryModal({ payment, onClose, onSuccess }: PaymentRetryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRetry = async () => {
    setIsSubmitting(true);
    try {
      await paymentAPI.retryPayment(payment.id);
      toast.success('Payment retry initiated');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to retry payment:', error);
      toast.error(error.message || 'Failed to retry payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold">Retry Payment</h2>
        </div>

        <p className="text-gray-600 mb-4">
          Are you sure you want to retry this payment? This will initiate a new payment attempt.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Maximum 3 retry attempts are allowed. Current attempts: {payment.attempt_count}
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
            type="button"
            onClick={handleRetry}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            disabled={isSubmitting || payment.attempt_count >= 3}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubmitting ? 'Processing...' : 'Retry Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}