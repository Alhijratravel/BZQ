import React, { useState, useEffect } from 'react';
import { Loader2, Plus, CreditCard, Building } from 'lucide-react';
import { paymentAPI } from '../../lib/api';
import { toast } from 'sonner';

export default function PaymentMethods() {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'sepa',
    iban: '',
    bank_name: '',
    holder_name: ''
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const data = await paymentAPI.getAllMethods();
      setMethods(data);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentAPI.createPaymentMethod(newMethod);
      await loadPaymentMethods();
      setShowAddModal(false);
      toast.success('Payment method added successfully');
    } catch (error) {
      console.error('Failed to add payment method:', error);
      toast.error('Failed to add payment method');
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Method
          </button>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method) => (
            <div key={method.id} className="border rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {method.type === 'sepa' ? (
                    <CreditCard className="w-8 h-8 text-indigo-600" />
                  ) : (
                    <Building className="w-8 h-8 text-indigo-600" />
                  )}
                  <div className="ml-4">
                    <h3 className="font-medium">
                      {method.type === 'sepa' ? 'SEPA Direct Debit' : 'iDEAL'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {method.type === 'sepa' 
                        ? `****${method.last_four}`
                        : method.bank_name}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  method.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {method.status}
                </span>
              </div>
              {method.holder_name && (
                <p className="mt-4 text-sm text-gray-600">
                  Account Holder: {method.holder_name}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Payment Method</h2>
            <form onSubmit={handleAddMethod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newMethod.type}
                  onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="sepa">SEPA Direct Debit</option>
                  <option value="ideal">iDEAL</option>
                </select>
              </div>

              {newMethod.type === 'sepa' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IBAN</label>
                    <input
                      type="text"
                      value={newMethod.iban}
                      onChange={(e) => setNewMethod({ ...newMethod, iban: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                    <input
                      type="text"
                      value={newMethod.holder_name}
                      onChange={(e) => setNewMethod({ ...newMethod, holder_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank</label>
                  <select
                    value={newMethod.bank_name}
                    onChange={(e) => setNewMethod({ ...newMethod, bank_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Select Bank</option>
                    <option value="ING">ING</option>
                    <option value="ABN AMRO">ABN AMRO</option>
                    <option value="Rabobank">Rabobank</option>
                    <option value="SNS">SNS</option>
                    <option value="ASN Bank">ASN Bank</option>
                    <option value="RegioBank">RegioBank</option>
                    <option value="Bunq">Bunq</option>
                    <option value="Knab">Knab</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}