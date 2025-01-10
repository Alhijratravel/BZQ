import React, { useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { paymentAPI } from '../../lib/api';
import { toast } from 'sonner';

interface PaymentRetryButtonProps {
  paymentId: string;
  onSuccess?: () => void;
}

export default function PaymentRetryButton({ paymentId, onSuccess }: PaymentRetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await paymentAPI.retryPayment(paymentId);
      toast.success('Payment retry initiated');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Failed to retry payment:', error);
      toast.error(error.message || 'Failed to retry payment');
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <button
      onClick={handleRetry}
      disabled={isRetrying}
      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
    >
      {isRetrying ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4 mr-2" />
      )}
      {isRetrying ? 'Retrying...' : 'Retry Payment'}
    </button>
  );
}