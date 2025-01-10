import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata?.role || 'employee',
          last_login: session.user.last_sign_in_at || undefined
        });
      }
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata?.role || 'employee',
          last_login: session.user.last_sign_in_at || undefined
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          toast.error('Invalid email or password');
        } else {
          toast.error('Failed to login. Please try again.');
        }
        throw error;
      }

      if (data.user) {
        const role = data.user.user_metadata?.role || 'employee';
        setUser({
          id: data.user.id,
          email: data.user.email!,
          role,
          last_login: data.user.last_sign_in_at || undefined
        });
        setIsAuthenticated(true);
        
        // Navigate to appropriate dashboard
        navigate(role === 'admin' ? '/admin' : '/dashboard');
        toast.success('Successfully logged in');
      }
    } catch (error: any) {
      // Don't rethrow the error - handle it gracefully
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setIsAuthenticated(false);
      navigate('/');
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}