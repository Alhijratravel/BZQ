import { supabase } from './supabase';
import type { User, Customer, Plan, Subscription, Payment } from '../types';

// Analytics API
export const analyticsAPI = {
  async getDashboardStats() {
    try {
      const [customersResponse, subscriptionsResponse, paymentsResponse] = await Promise.all([
        supabase.from('customers').select('count', { count: 'exact' }),
        supabase.from('subscriptions').select('*'),
        supabase.from('payments').select('amount').eq('status', 'completed')
      ]);

      if (customersResponse.error) throw customersResponse.error;
      if (subscriptionsResponse.error) throw subscriptionsResponse.error;
      if (paymentsResponse.error) throw paymentsResponse.error;

      const activeSubscriptions = subscriptionsResponse.data.filter(sub => sub.status === 'active').length;
      const pendingRenewals = subscriptionsResponse.data.filter(sub => {
        const endDate = new Date(sub.end_date);
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        return sub.status === 'active' && endDate <= thirtyDaysFromNow;
      }).length;

      const monthlyRevenue = paymentsResponse.data.reduce((total, payment) => total + (payment.amount || 0), 0);

      return {
        totalCustomers: customersResponse.count || 0,
        activeSubscriptions,
        monthlyRevenue,
        pendingRenewals
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw error;
    }
  },

  async getSubscriptionTrends() {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const monthlyData = data.reduce((acc: Record<string, number>, sub) => {
        const month = new Date(sub.created_at).toLocaleString('default', { month: 'long', year: 'numeric' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(monthlyData).map(([month, subscriptions]) => ({
        month,
        subscriptions
      }));
    } catch (error) {
      console.error('Failed to get subscription trends:', error);
      throw error;
    }
  },

  async getRevenueReport() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount, created_at')
        .eq('status', 'completed')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const monthlyData = data.reduce((acc: Record<string, number>, payment) => {
        const month = new Date(payment.created_at).toLocaleString('default', { month: 'long', year: 'numeric' });
        acc[month] = (acc[month] || 0) + (payment.amount || 0);
        return acc;
      }, {});

      return Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue
      }));
    } catch (error) {
      console.error('Failed to get revenue report:', error);
      throw error;
    }
  }
};

// User API
export const userAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Customer API
export const customerAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*, family_members(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(customerData: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, customerData: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update(customerData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Plan API
export const planAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(planData: Partial<Plan>) {
    const { data, error } = await supabase
      .from('plans')
      .insert([planData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, planData: Partial<Plan>) {
    const { data, error } = await supabase
      .from('plans')
      .update(planData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Subscription API
export const subscriptionAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email
        ),
        plans (
          id,
          name,
          price,
          billing_cycle
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(subscriptionData: Partial<Subscription>) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscriptionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, subscriptionData: Partial<Subscription>) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancel(id: string, reason?: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancellation_date: new Date().toISOString(),
        cancellation_reason: reason
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async reactivate(id: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        cancellation_date: null,
        cancellation_reason: null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Payment API
export const paymentAPI = {
  async getAll(filters?: any) {
    let query = supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.subscription_id) {
      query = query.eq('subscription_id', filters.subscription_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getPaymentMethod(subscriptionId: string) {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .single();

    if (error) throw error;
    return data;
  },

  async createPaymentMethod(methodData: any) {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([methodData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePaymentMethod(subscriptionId: string, methodData: any) {
    const { data, error } = await supabase
      .from('payment_methods')
      .update(methodData)
      .eq('subscription_id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async processPayment(paymentData: any) {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        ...paymentData,
        status: 'processing'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async retryPayment(paymentId: string) {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'processing',
        attempt_count: supabase.sql`attempt_count + 1`,
        next_attempt_date: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAutoRenewal(subscriptionId: string, autoRenew: boolean) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ auto_renew: autoRenew })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async exportPayments(filters?: any) {
    const payments = await this.getAll(filters);
    return payments.map(payment => ({
      ID: payment.id,
      Amount: payment.amount,
      Status: payment.status,
      Method: payment.payment_method,
      Date: new Date(payment.created_at).toLocaleDateString(),
      Customer: payment.customer_id,
      Subscription: payment.subscription_id
    }));
  }
};