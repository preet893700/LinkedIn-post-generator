import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children, navigate }) => {
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/auth');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn()) {
    return null; // Or a loading spinner
  }

  return children;
};

export default ProtectedRoute;