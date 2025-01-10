import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { subscriptionAPI, paymentAPI } from '../../lib/api';
import { toast } from 'sonner';
import { CreditCard, Building } from 'lucide-react';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  billing_cycle: string;
  max_family_members: number;
}

interface PaymentMethod {
  id: string;
  type: 'sepa' | 'ideal';
  last_four?: string;
  bank_name?: string;
  holder_name?: string;
  status: string;
}

export default function CreateSubscription() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    billing_cycle: 'monthly',
    auto_renew: true,
    status: 'active',
    family_members: [] as { name: string; date_of_birth: string; relationship: string }[],
  });

  const [paymentData, setPaymentData] = useState({
    method: 'sepa' as 'sepa' | 'ideal',
    iban: '',
    bank_name: '',
    holder_name: '',
    existing_method_id: ''
  });

  useEffect(() => {
    loadCustomersAndPlans();
  }, []);

  useEffect(() => {
    if (formData.customer_id) {
      loadPaymentMethods(formData.customer_id);
    }
  }, [formData.customer_id]);

  const loadCustomersAndPlans = async () => {
    try {
      const [customersResponse, plansResponse] = await Promise.all([
        supabase.from('customers').select('id, first_name, last_name, email'),
        supabase.from('plans').select('*').eq('active', true)
      ]);

      if (customersResponse.error) throw customersResponse.error;
      if (plansResponse.error) throw plansResponse.error;

      setCustomers(customersResponse.data || []);
      setPlans(plansResponse.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load customers and plans');
    }
  };

  const loadPaymentMethods = async (customerId: string) => {
    try {
      const methods = await paymentAPI.getCustomerPaymentMethods(customerId);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const handleAddFamilyMember = () => {
    setFormData({
      ...formData,
      family_members: [
        ...formData.family_members,
        { name: '', date_of_birth: '', relationship: '' },
      ],
    });
  };

  const handleFamilyMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...formData.family_members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setFormData({ ...formData, family_members: updatedMembers });
  };

  const handleRemoveFamilyMember = (index: number) => {
    const updatedMembers = formData.family_members.filter((_, i) => i !== index);
    setFormData({ ...formData, family_members: updatedMembers });
  };

  const validateIBAN = (iban: string) => {
    // Basic IBAN validation - should be enhanced in production
    return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,}$/.test(iban.replace(/\s/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate payment data
      if (paymentData.method === 'sepa' && !paymentData.existing_method_id) {
        if (!validateIBAN(paymentData.iban)) {
          toast.error('Please enter a valid IBAN');
          return;
        }
        if (!paymentData.holder_name) {
          toast.error('Please enter the account holder name');
          return;
        }
      }

      // Create subscription
      const subscription = await subscriptionAPI.create(formData);

      // Handle payment method
      let paymentMethodId = paymentData.existing_method_id;
      
      if (!paymentMethodId) {
        const paymentMethod = await paymentAPI.createPaymentMethod({
          customer_id: formData.customer_id,
          type: paymentData.method,
          iban: paymentData.iban,
          bank_name: paymentData.bank_name,
          holder_name: paymentData.holder_name
        });
        paymentMethodId = paymentMethod.id;
      }

      // Process initial payment
      const selectedPlan = plans.find(p => p.id === formData.plan_id);
      if (selectedPlan) {
        await paymentAPI.processPayment({
          subscription_id: subscription.id,
          customer_id: formData.customer_id,
          amount: selectedPlan.price,
          payment_method: paymentData.method
        });
      }

      toast.success('Subscription created successfully');
      navigate('/subscriptions/list');
    } catch (error) {
      console.error('Failed to create subscription:', error);
      toast.error('Failed to create subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === formData.plan_id);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Subscription</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Existing customer and plan selection fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Customer</label>
          <select
            value={formData.customer_id}
            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          >
            <option value="">Select Customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.first_name} {customer.last_name} ({customer.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Plan</label>
          <select
            value={formData.plan_id}
            onChange={(e) => {
              const plan = plans.find(p => p.id === e.target.value);
              setFormData({
                ...formData,
                plan_id: e.target.value,
                billing_cycle: plan?.billing_cycle || 'monthly'
              });
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          >
            <option value="">Select Plan</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.name} (€{plan.price}/{plan.billing_cycle})
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Selection */}
        <div className="border-t pt-4 mt-6">
          <h3 className="text-lg font-medium mb-4">Payment Method</h3>
          
          {paymentMethods.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use Existing Payment Method
              </label>
              <select
                value={paymentData.existing_method_id}
                onChange={(e) => setPaymentData({
                  ...paymentData,
                  existing_method_id: e.target.value,
                  method: e.target.value ? (paymentMethods.find(m => m.id === e.target.value)?.type || 'sepa') : 'sepa'
                })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Add New Payment Method</option>
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.type === 'sepa' 
                      ? `SEPA Direct Debit (**** ${method.last_four})` 
                      : `iDEAL - ${method.bank_name}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!paymentData.existing_method_id && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:border-indigo-500">
                  <input
                    type="radio"
                    name="payment-method"
                    value="sepa"
                    checked={paymentData.method === 'sepa'}
                    onChange={(e) => setPaymentData({ ...paymentData, method: 'sepa' as 'sepa' | 'ideal' })}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium">SEPA Direct Debit</span>
                    <span className="block text-xs text-gray-500">Automatic monthly payments</span>
                  </div>
                  <CreditCard className="ml-auto h-6 w-6 text-gray-400" />
                </label>

                <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:border-indigo-500">
                  <input
                    type="radio"
                    name="payment-method"
                    value="ideal"
                    checked={paymentData.method === 'ideal'}
                    onChange={(e) => setPaymentData({ ...paymentData, method: 'ideal' as 'sepa' | 'ideal' })}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium">iDEAL</span>
                    <span className="block text-xs text-gray-500">Pay via bank transfer</span>
                  </div>
                  <Building className="ml-auto h-6 w-6 text-gray-400" />
                </label>
              </div>

              {paymentData.method === 'sepa' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IBAN</label>
                    <input
                      type="text"
                      value={paymentData.iban}
                      onChange={(e) => setPaymentData({ ...paymentData, iban: e.target.value.toUpperCase() })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="NL91ABNA0417164300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                    <input
                      type="text"
                      value={paymentData.holder_name}
                      onChange={(e) => setPaymentData({ ...paymentData, holder_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                </div>
              )}

              {paymentData.method === 'ideal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank</label>
                  <select
                    value={paymentData.bank_name}
                    onChange={(e) => setPaymentData({ ...paymentData, bank_name: e.target.value })}
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
            </>
          )}
        </div>

        {/* Existing subscription details */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Billing Cycle</label>
          <select
            value={formData.billing_cycle}
            onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            disabled={!!selectedPlan}
          >
            <option value="monthly">Monthly</option>
            <option value="half_yearly">Half Yearly</option>
            <option value="yearly">Yearly</option>
          </select>
          {selectedPlan && (
            <p className="mt-1 text-sm text-gray-500">
              Billing cycle is determined by the selected plan
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.auto_renew}
            onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
          />
          <label className="ml-2 text-sm text-gray-700">Auto-renew subscription</label>
        </div>

        {/* Family members section */}
        {selectedPlan && selectedPlan.max_family_members > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Family Members</h3>
              <button
                type="button"
                onClick={handleAddFamilyMember}
                disabled={formData.family_members.length >= selectedPlan.max_family_members}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
              >
                Add Family Member
              </button>
            </div>
            {formData.family_members.map((member, index) => (
              <div key={index} className="border p-4 rounded-md mb-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      value={member.date_of_birth}
                      onChange={(e) => handleFamilyMemberChange(index, 'date_of_birth', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Relationship</label>
                    <select
                      value={member.relationship}
                      onChange={(e) => handleFamilyMemberChange(index, 'relationship', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    >
                      <option value="">Select Relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="parent">Parent</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFamilyMember(index)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <p className="text-sm text-gray-500">
              Maximum family members allowed: {selectedPlan.max_family_members}
            </p>
          </div>
        )}

        {/* Submit buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/subscriptions/list')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Subscription'}
          </button>
        </div>
      </form>
    </div>
  );
}