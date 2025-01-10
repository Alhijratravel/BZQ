import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            FamilyPlans
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/plans"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              Plans
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center text-gray-600 hover:text-indigo-600"
              >
                <User className="h-5 w-5 mr-1" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}