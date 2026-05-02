// components/ProtectedRoute.jsx
import { useAuthStore } from  "@/stores/useAuthStore";
import { useAuthModalStore } from  "@/stores/useAuthModalStore";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { open } = useAuthModalStore();

  const pathname = usePathname();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      open('login', pathname);
    }
  }, [isAuthenticated, isInitialized, open, pathname]);

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
