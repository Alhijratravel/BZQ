import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { paymentAPI } from '../../lib/api';
import { toast } from 'sonner';

interface ChargebackModalProps {
  payment: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChargebackModal({ payment, onClose, onSuccess }: ChargebackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await paymentAPI.processChargebackRequest(payment.id, reason);
      toast.success('Chargeback request submitted');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to submit chargeback:', error);
      toast.error('Failed to submit chargeback request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
          <h2 className="text-xl font-bold">Request Chargeback</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Reason for Chargeback</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              rows={4}
              required
              placeholder="Please provide a detailed reason for the chargeback request..."
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-sm text-red-700">
              <strong>Warning:</strong> Chargebacks should only be requested for valid reasons such as unauthorized transactions or services not received.
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
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Processing...' : 'Submit Chargeback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}