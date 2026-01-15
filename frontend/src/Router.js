import React, { useState, useEffect } from 'react';
import ProductPage from './pages/ProductPage';
import AuthPage from './pages/AuthPage';
import AppPage from './pages/AppPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';

const Router = () => {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentRoute(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
    window.scrollTo(0, 0);
  };

  // Route to auth page
  if (currentRoute === '/auth') {
    return <AuthPage navigate={navigate} />;
  }

  // Route to profile page (protected)
  if (currentRoute === '/app/profile') {
    return (
      <ProtectedRoute navigate={navigate}>
        <ProfilePage navigate={navigate} />
      </ProtectedRoute>
    );
  }

  // Route to app (protected)
  if (currentRoute === '/app') {
    return (
      <ProtectedRoute navigate={navigate}>
        <AppPage />
      </ProtectedRoute>
    );
  }

  // Default to product page
  return <ProductPage navigate={navigate} />;
};

export default Router;