import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Bell,
  Receipt,
  ChevronDown,
  ChevronRight,
  Webhook
} from 'lucide-react';
import type { NavigationItem } from '../../types';

const navigation: NavigationItem[] = [
  {
    title: 'Dashboard',
    path: '/admin',
    icon: 'LayoutDashboard'
  },
  {
    title: 'User Management',
    path: '/admin/users',
    icon: 'Users',
    children: [
      { title: 'All Users', path: '/admin/users/list', icon: 'Users' },
      { title: 'Add User', path: '/admin/users/create', icon: 'Users' }
    ]
  },
  {
    title: 'Customer Management',
    path: '/admin/customers',
    icon: 'Users',
    children: [
      { title: 'All Customers', path: '/admin/customers/list', icon: 'Users' },
      { title: 'Add Customer', path: '/admin/customers/create', icon: 'Users' }
    ]
  },
  {
    title: 'Plan Management',
    path: '/admin/plans',
    icon: 'CreditCard',
    children: [
      { title: 'All Plans', path: '/admin/plans/list', icon: 'CreditCard' },
      { title: 'Add Plan', path: '/admin/plans/create', icon: 'CreditCard' }
    ]
  },
  {
    title: 'Subscriptions',
    path: '/admin/subscriptions',
    icon: 'CreditCard',
    children: [
      { title: 'All Subscriptions', path: '/admin/subscriptions/list', icon: 'CreditCard' },
      { title: 'Add Subscription', path: '/admin/subscriptions/create', icon: 'CreditCard' }
    ]
  },
  {
    title: 'Payments',
    path: '/admin/payments',
    icon: 'Receipt',
    children: [
      { title: 'All Payments', path: '/admin/payments/list', icon: 'Receipt' },
      { title: 'Payment Methods', path: '/admin/payments/methods', icon: 'CreditCard' },
      { title: 'Payment Logs', path: '/admin/payments/logs', icon: 'Receipt' }
    ]
  },
  {
    title: 'Webhooks',
    path: '/admin/webhooks',
    icon: 'Webhook',
    children: [
      { title: 'All Webhooks', path: '/admin/webhooks/list', icon: 'Webhook' }
    ]
  },
  {
    title: 'Reports',
    path: '/admin/reports',
    icon: 'LayoutDashboard'
  },
  {
    title: 'Settings',
    path: '/admin/settings',
    icon: 'Settings'
  }
];

const IconMap: Record<string, React.ComponentType> = {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Bell,
  Receipt,
  Webhook
};

export default function Sidebar() {
  const [expanded, setExpanded] = useState<string[]>([]);
  const location = useLocation();

  const toggleExpand = (path: string) => {
    setExpanded(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const renderNavItem = (item: NavigationItem, depth = 0) => {
    const Icon = IconMap[item.icon];
    const isExpanded = expanded.includes(item.path) || isPathActive(item.path);
    const isActive = isPathActive(item.path);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.path} className="w-full">
        <Link
          to={hasChildren ? '#' : item.path}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpand(item.path);
            }
          }}
          className={`
            flex items-center w-full px-4 py-2 text-sm
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}
            ${depth > 0 ? 'pl-8' : ''}
          `}
        >
          {Icon && <Icon className="w-5 h-5 mr-2" />}
          <span>{item.title}</span>
          {hasChildren && (
            <div className="ml-auto">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </Link>
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {item.children.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-indigo-600">Admin Dashboard</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map(item => renderNavItem(item))}
      </nav>
    </div>
  );
}