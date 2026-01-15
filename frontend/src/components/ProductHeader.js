import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';

const ProductHeader = ({ navigate }) => {
  const { user, isLoggedIn, logout, getToken } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const token = getToken();
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">LinkedIn Post Generator</span>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn() ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full" />
                  ) : (
                    getInitials(user?.name || 'U')
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="font-semibold text-gray-900">{user?.name}</div>
                    <div className="text-sm text-gray-600">{user?.email}</div>
                    <div className="mt-1">
                      <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                        {user?.plan?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigate('/app');
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                  >
                    <Sparkles className="w-4 h-4" />
                    Go to App
                  </button>

                  <button
                    onClick={() => {
                      navigate('/app/profile');
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                  >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 text-gray-700 font-medium hover:text-purple-600 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;