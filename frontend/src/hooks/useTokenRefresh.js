import { useEffect, useCallback, useRef } from 'react';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';

const REFRESH_INTERVAL = 8 * 60 * 1000; // Refresh every 8 minutes (before 10 min expiry)

export const useTokenRefresh = () => {
  const { isLoggedIn, setAuth, logout } = useAuthStore();
  const refreshTimerRef = useRef(null);

  const refreshAccessToken = useCallback(async () => {
    if (!isLoggedIn()) return;

    try {
      const response = await authService.refreshToken();
      setAuth(response.user, response.access_token);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout
      logout();
    }
  }, [isLoggedIn, setAuth, logout]);

  useEffect(() => {
    if (!isLoggedIn()) {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      return;
    }

    // Set up automatic token refresh
    refreshTimerRef.current = setInterval(refreshAccessToken, REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [isLoggedIn, refreshAccessToken]);

  return { refreshAccessToken };
};