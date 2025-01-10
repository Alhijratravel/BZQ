import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronRight,
  Receipt,
  Bell
} from 'lucide-react';

const navigation = [
  {
    title: 'Overview',
    path: '/dashboard',
    icon: 'LayoutDashboard'
  },
  {
    title: 'Family Members',
    path: '/dashboard/family',
    icon: 'Users'
  },
  {
    title: 'Subscription',
    path: '/dashboard/subscription',
    icon: 'CreditCard'
  },
  {
    title: 'Payments',
    path: '/dashboard/payments',
    icon: 'Receipt'
  },
  {
    title: 'Notifications',
    path: '/dashboard/notifications',
    icon: 'Bell'
  },
  {
    title: 'Settings',
    path: '/dashboard/settings',
    icon: 'Settings'
  }
];

const IconMap: Record<string, React.ComponentType> = {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Receipt,
  Bell
};

export default function CustomerSidebar() {
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

  const renderNavItem = (item: any, depth = 0) => {
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
            ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-dark-800 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'}
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
            {item.children.map((child: any) => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 h-screen bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-dark-700">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Dashboard</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map(item => renderNavItem(item))}
      </nav>
    </div>
  );
}