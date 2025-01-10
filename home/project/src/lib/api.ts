import { supabase } from './supabase';

// Analytics API
export const analyticsAPI = {
  async getDashboardStats() {
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

    // Calculate monthly revenue from completed payments
    const monthlyRevenue = paymentsResponse.data.reduce((total, payment) => total + (payment.amount || 0), 0);

    return {
      totalCustomers: customersResponse.count || 0,
      activeSubscriptions,
      monthlyRevenue,
      pendingRenewals
    };
  },

  async getSubscriptionTrends() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group subscriptions by month
    const monthlyData = data.reduce((acc: Record<string, number>, sub) => {
      const month = new Date(sub.created_at).toLocaleString('default', { month: 'long', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([month, subscriptions]) => ({
      month,
      subscriptions
    }));
  },

  async getRevenueReport() {
    const { data, error } = await supabase
      .from('payments')
      .select('amount, created_at')
      .eq('status', 'completed')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group payments by month
    const monthlyData = data.reduce((acc: Record<string, number>, payment) => {
      const month = new Date(payment.created_at).toLocaleString('default', { month: 'long', year: 'numeric' });
      acc[month] = (acc[month] || 0) + (payment.amount || 0);
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue
    }));
  }
};

// Rest of the file remains unchanged...
${restOfTheFile}