import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { paymentAPI } from '../../lib/api';
import { toast } from 'sonner';

export default function PaymentLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentLogs();
  }, []);

  const loadPaymentLogs = async () => {
    try {
      const data = await paymentAPI.getAllLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load payment logs:', error);
      toast.error('Failed to load payment logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Payment Logs</h1>

        {/* Timeline */}
        <div className="flow-root">
          <ul className="-mb-8">
            {logs.map((log, index) => (
              <li key={log.id}>
                <div className="relative pb-8">
                  {index !== logs.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-100">
                        {getStatusIcon(log.status)}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">
                          {log.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        {log.details && (
                          <pre className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time dateTime={log.created_at}>
                          {new Date(log.created_at).toLocaleString()}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}