import { create } from 'zustand';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  authLoading: false,
  lastActivityAt: Date.now(),
  sessionExpiresAt: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: (token) => {
    const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
    set({ 
      accessToken: token, 
      sessionExpiresAt: expiresAt,
      lastActivityAt: Date.now()
    });
  },
  
  setAuth: (user, token) => {
    const expiresAt = Date.now() + (10 * 60 * 1000);
    set({ 
      user, 
      accessToken: token, 
      isAuthenticated: true,
      sessionExpiresAt: expiresAt,
      lastActivityAt: Date.now()
    });
  },
  
  updateActivity: () => {
    set({ lastActivityAt: Date.now() });
  },
  
  setAuthLoading: (loading) => set({ authLoading: loading }),
  
  logout: () => set({ 
    user: null, 
    accessToken: null, 
    isAuthenticated: false,
    sessionExpiresAt: null,
    lastActivityAt: Date.now()
  }),
  
  getToken: () => get().accessToken,
  
  isLoggedIn: () => get().isAuthenticated && get().accessToken,
  
  isSessionExpired: () => {
    const { lastActivityAt, sessionExpiresAt } = get();
    const now = Date.now();
    const idleTime = now - lastActivityAt;
    
    // Check if idle timeout exceeded OR session expired
    return idleTime > IDLE_TIMEOUT || (sessionExpiresAt && now > sessionExpiresAt);
  },
  
  getIdleTime: () => {
    const { lastActivityAt } = get();
    return Date.now() - lastActivityAt;
  }
}));

export default useAuthStore;