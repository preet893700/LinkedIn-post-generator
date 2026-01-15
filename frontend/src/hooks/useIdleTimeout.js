import { useEffect, useCallback, useRef } from 'react';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

export const useIdleTimeout = (navigate) => {
  const { isLoggedIn, updateActivity, isSessionExpired, logout, getToken } = useAuthStore();
  const logoutTimerRef = useRef(null);

  const handleActivity = useCallback(() => {
    if (isLoggedIn()) {
      updateActivity();
    }
  }, [isLoggedIn, updateActivity]);

  const checkSession = useCallback(async () => {
    if (!isLoggedIn()) return;

    if (isSessionExpired()) {
      // Session expired - logout
      const token = getToken();
      try {
        if (token) {
          await authService.logout(token);
        }
      } catch (error) {
        console.error('Logout error:', error);
      }
      
      logout();
      navigate('/auth?reason=session_expired');
    }
  }, [isLoggedIn, isSessionExpired, logout, getToken, navigate]);

  useEffect(() => {
    if (!isLoggedIn()) return;

    // Activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Session check interval
    const intervalId = setInterval(checkSession, CHECK_INTERVAL);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalId);
    };
  }, [isLoggedIn, handleActivity, checkSession]);

  return { isSessionExpired };
};