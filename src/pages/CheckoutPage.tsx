import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, Building, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { subscriptionAPI, paymentAPI } from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  max_family_members: number;
}

interface FamilyMember {
  name: string;
  date_of_birth: string;
  relationship: string;
}

export default function CheckoutPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [step, setStep] = useState(1);

  const [customerData, setCustomerData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    type: 'single' as 'single' | 'family'
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  
  const [paymentData, setPaymentData] = useState({
    method: 'sepa' as 'sepa' | 'ideal',
    iban: '',
    bank_name: '',
    holder_name: ''
  });

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .eq('active', true)
        .single();

      if (error) throw error;
      if (!data) {
        toast.error('Plan not found');
        navigate('/plans');
        return;
      }

      setPlan(data);
    } catch (error) {
      console.error('Error loading plan:', error);
      toast.error('Failed to load plan details');
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFamilyMember = () => {
    if (!plan) return;
    if (familyMembers.length >= plan.max_family_members) {
      toast.error(`Maximum ${plan.max_family_members} family members allowed`);
      return;
    }
    setFamilyMembers([...familyMembers, { name: '', date_of_birth: '', relationship: '' }]);
  };

  const handleRemoveFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const handleFamilyMemberChange = (index: number, field: keyof FamilyMember, value: string) => {
    const updatedMembers = [...familyMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setFamilyMembers(updatedMembers);
  };

  const validateIBAN = (iban: string) => {
    return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,}$/.test(iban.replace(/\s/g, ''));
  };

  const handleSubmit = async () => {
    if (!plan) return;
    setSubmitting(true);

    try {
      // Create or get customer
      let customerId;
      if (isAuthenticated && user) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', user.email)
          .single();

        if (existingCustomer) {
          customerId = existingCustomer.id;
        }
      }

      if (!customerId) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert([{
            ...customerData,
            email: isAuthenticated ? user?.email : customerData.email
          }])
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // Create payment method
      const { data: paymentMethod, error: paymentError } = await supabase
        .from('payment_methods')
        .insert([{
          customer_id: customerId,
          type: paymentData.method,
          status: 'active',
          iban: paymentData.iban,
          bank_name: paymentData.bank_name,
          holder_name: paymentData.holder_name,
          last_four: paymentData.iban.slice(-4)
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Create subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([{
          customer_id: customerId,
          plan_id: plan.id,
          start_date: new Date().toISOString(),
          billing_cycle: plan.billing_cycle,
          auto_renew: true,
          status: 'active'
        }])
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      // Add family members if any
      if (familyMembers.length > 0) {
        const { error: familyError } = await supabase
          .from('family_members')
          .insert(
            familyMembers.map(member => ({
              ...member,
              customer_id: customerId
            }))
          );

        if (familyError) throw familyError;
      }

      // Process initial payment
      const { error: paymentProcessError } = await supabase
        .from('payments')
        .insert([{
          subscription_id: subscription.id,
          customer_id: customerId,
          amount: plan.price,
          currency: 'EUR',
          status: 'processing',
          payment_method: paymentData.method
        }]);

      if (paymentProcessError) throw paymentProcessError;

      toast.success('Subscription created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Plan not found. Please select a valid plan.</p>
          <button
            onClick={() => navigate('/plans')}
            className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
            <p className="text-gray-600">
              You're subscribing to the {plan.name} plan at ${plan.price}/{plan.billing_cycle}
            </p>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between mb-8">
              {['Personal Info', 'Family Members', 'Payment'].map((stepName, index) => (
                <div
                  key={index}
                  className={`flex items-center ${index < step ? 'text-indigo-600' : 'text-gray-400'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index < step ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="ml-2">{stepName}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={customerData.first_name}
                      onChange={(e) => setCustomerData({ ...customerData, first_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={customerData.last_name}
                      onChange={(e) => setCustomerData({ ...customerData, last_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={isAuthenticated ? user?.email : customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                    disabled={isAuthenticated}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={customerData.address}
                    onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={customerData.city}
                      onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      value={customerData.country}
                      onChange={(e) => setCustomerData({ ...customerData, country: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Family Members */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Family Members</h3>
                  <button
                    type="button"
                    onClick={handleAddFamilyMember}
                    disabled={familyMembers.length >= plan.max_family_members}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    Add Family Member
                  </button>
                </div>

                {familyMembers.map((member, index) => (
                  <div key={index} className="border p-4 rounded-md">
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
                  Maximum family members allowed: {plan.max_family_members}
                </p>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:border-indigo-500">
                    <input
                      type="radio"
                      name="payment-method"
                      value="sepa"
                      checked={paymentData.method === 'sepa'}
                      onChange={(e) => setPaymentData({ ...paymentData, method: 'sepa' })}
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
                      onChange={(e) => setPaymentData({ ...paymentData, method: 'ideal' })}
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

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Payment Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span>{plan.name} Plan</span>
                    <span>${plan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Billing Cycle</span>
                    <span>{plan.billing_cycle}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  {submitting ? 'Processing...' : 'Complete Subscription'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}