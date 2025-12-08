// components/ProtectedRoute.jsx
import { useAuthStore } from '../stores/useAuthStore';
import { useAuthModalStore } from '../stores/useAuthModalStore';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { open } = useAuthModalStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      open('login', window.location.pathname);
    }
  }, [isAuthenticated, isInitialized, open]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Auth modal will open
  }

  return children;
};

export default ProtectedRoute;
