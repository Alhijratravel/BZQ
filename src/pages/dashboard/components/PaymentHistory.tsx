import React, { useState, useEffect } from 'react';
import { Download, Search } from 'lucide-react';
import { paymentAPI } from '../../../lib/api';
import { toast } from 'sonner';
import { utils, writeFile } from 'xlsx';

interface PaymentHistoryProps {
  subscription: any;
}

export default function PaymentHistory({ subscription }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subscription) {
      loadPayments();
    }
  }, [subscription]);

  const loadPayments = async () => {
    try {
      const data = await paymentAPI.getAll({ subscription_id: subscription.id });
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const exportPayments = async () => {
    try {
      // Create workbook
      const wb = utils.book_new();
      
      // Format data for export
      const exportData = payments.map(payment => ({
        Date: new Date(payment.created_at).toLocaleDateString(),
        Amount: `$${payment.amount}`,
        Status: payment.status,
        Method: payment.payment_method
      }));
      
      const ws = utils.json_to_sheet(exportData);
      utils.book_append_sheet(wb, ws, 'Payments');
      
      // Generate filename with current date
      const filename = `payment-history-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      writeFile(wb, filename);
      toast.success('Payment history exported successfully');
    } catch (error) {
      console.error('Failed to export payments:', error);
      toast.error('Failed to export payment history');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Payment History</h2>
          <button
            onClick={exportPayments}
            className="flex items-center px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(payment.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${payment.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {payment.payment_method}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No payment history available
          </div>
        )}
      </div>
    </div>
  );
}