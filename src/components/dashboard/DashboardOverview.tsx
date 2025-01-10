import React, { useEffect, useState } from 'react';
import { Users, CreditCard, TrendingUp, AlertCircle, Loader2, Download } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { analyticsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { utils, writeFile } from 'xlsx';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalCustomers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  pendingRenewals: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionTrends, setSubscriptionTrends] = useState<{ month: string; subscriptions: number }[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<{ month: string; revenue: number }[]>([]);

  const loadDashboardData = async () => {
    try {
      const [stats, subTrends, revTrends] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        analyticsAPI.getSubscriptionTrends(),
        analyticsAPI.getRevenueReport()
      ]);

      setStats(stats);
      setSubscriptionTrends(subTrends);
      setRevenueTrends(revTrends);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const exportToExcel = () => {
    try {
      const workbook = utils.book_new();
      
      // Subscription trends sheet
      const subData = subscriptionTrends.map(item => ({
        Month: item.month,
        'New Subscriptions': item.subscriptions
      }));
      const subWs = utils.json_to_sheet(subData);
      utils.book_append_sheet(workbook, subWs, 'Subscription Trends');

      // Revenue trends sheet
      const revData = revenueTrends.map(item => ({
        Month: item.month,
        'Revenue ($)': item.revenue
      }));
      const revWs = utils.json_to_sheet(revData);
      utils.book_append_sheet(workbook, revWs, 'Revenue Trends');

      // Write to file
      writeFile(workbook, 'dashboard-report.xlsx');
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Failed to export report:', error);
      toast.error('Failed to export report');
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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalCustomers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.activeSubscriptions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats?.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Renewals</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.pendingRenewals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Subscription Trends</h3>
            <button
              onClick={exportToExcel}
              className="flex items-center px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          <Line
            data={{
              labels: subscriptionTrends.map(item => item.month),
              datasets: [
                {
                  label: 'New Subscriptions',
                  data: subscriptionTrends.map(item => item.subscriptions),
                  borderColor: 'rgb(79, 70, 229)',
                  tension: 0.1
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Revenue Trends</h3>
          </div>
          <Line
            data={{
              labels: revenueTrends.map(item => item.month),
              datasets: [
                {
                  label: 'Monthly Revenue',
                  data: revenueTrends.map(item => item.revenue),
                  borderColor: 'rgb(16, 185, 129)',
                  tension: 0.1
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: value => `$${value}`
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}