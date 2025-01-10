export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  last_login?: string;
  password?: string; // Only used for forms, never stored
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

export interface NavigationItem {
  title: string;
  path: string;
  icon: string;
  children?: Omit<NavigationItem, 'children'>[];
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}