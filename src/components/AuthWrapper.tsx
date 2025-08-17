import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from './AdminLayout';
import AdminLogin from '@/pages/AdminLogin';
import { Loader2 } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth();

  console.log("AuthWrapper render:", { isAuthenticated, isLoading });

  if (isLoading) {
    console.log("AuthWrapper: showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-admin-bg">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("AuthWrapper: user not authenticated, showing login");
    return <AdminLogin />;
  }

  console.log("AuthWrapper: user authenticated, rendering admin layout");
  return <AdminLayout>{children}</AdminLayout>;
}