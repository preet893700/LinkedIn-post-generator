import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children, navigate }) => {
  const { isLoggedIn } = useAuthStore();
  const loggedIn = isLoggedIn(); // Store the result in a variable

  useEffect(() => {
    if (!loggedIn) {
      navigate('/auth');
    }
  }, [loggedIn, navigate]); // Use the variable, not the function

  if (!loggedIn) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>; // Use fragment wrapper
};

export default ProtectedRoute;