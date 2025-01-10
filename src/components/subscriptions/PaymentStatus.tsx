import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import { paymentAPI } from '../../lib/api';

interface PaymentStatusProps {
  paymentId: string;
  onStatusChange?: (status: string) => void;
}

export default function PaymentStatus({ paymentId, onStatusChange }: PaymentStatusProps) {
  const [status, setStatus] = useState<string>('');
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // Initial status load
    loadPaymentStatus();

    // Set up real-time monitoring
    const unsubscribe = paymentAPI.monitorPayment(paymentId, (newStatus) => {
      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
      // Reload logs when status changes
      loadPaymentStatus();
    });

    return () => {
      unsubscribe();
    };
  }, [paymentId]);

  const loadPaymentStatus = async () => {
    try {
      const data = await paymentAPI.getPaymentStatus(paymentId);
      setStatus(data.status);
      setLogs(data.payment_logs || []);
    } catch (error) {
      console.error('Failed to load payment status:', error);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'processing':
        return <Clock className="h-6 w-6 text-blue-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Payment Status</h3>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="ml-2 capitalize">{status}</span>
        </span>
      </div>

      {logs.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Payment History</h4>
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start space-x-3 text-sm">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-gray-900">
                    {log.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                  {log.details && (
                    <p className="text-gray-600">{JSON.stringify(log.details)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}