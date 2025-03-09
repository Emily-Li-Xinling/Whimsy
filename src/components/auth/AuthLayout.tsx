'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { logout } from '@/lib/auth';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Processing...</div>;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div>
      <div className="p-4 border-b">
        <p>Welcome, {user.email}</p>
        <button 
          onClick={logout}
          className="text-blue-500 hover:underline"
        >
          logout
        </button>
      </div>
      {children}
    </div>
  );
} 