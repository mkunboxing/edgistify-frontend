import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, logout } from '../store/authSlice';
import { toast } from 'react-hot-toast';

interface NavbarProps {
  cartItemsCount: number;
  userName?: string;
}

const Navbar: React.FC<NavbarProps> = ({ cartItemsCount, userName = 'Guest' }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    
    // Dispatch logout action
    dispatch(logout());
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Navigate to home page
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              MK Shop
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {/* User Name and Logout */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Welcome, {userName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 transition duration-200"
                >
                  Logout
                </button>
                <Link to="/orders" className="text-gray-700 hover:text-blue-600">
                  Orders
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link to="/signup" className="text-gray-700 hover:text-blue-600">
                  Signup
                </Link>
              </>
            )}

            {/* Cart Icon */}
            <div className="relative">
              <Link to="/cart" className="text-gray-700 hover:text-blue-600">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                  />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 