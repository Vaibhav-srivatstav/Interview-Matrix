'use client';

import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FullPageLoader from './FullPageLoader';

export default function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // 1. Check if we are done checking auth status
    if (initialized && !loading) {
      // 2. Check if user is missing OR if the login flag was manually removed
      const hasSession = localStorage.getItem("isLoggedIn") === "true";
      
      if (!user && !hasSession) {
        setIsRedirecting(true);
        router.replace('/login');
      }
    }
  }, [user, loading, initialized, router]);

  // 3. Show loader if we are still fetching OR if we are in the middle of a redirect
  if (loading || !initialized || isRedirecting) {
    return <FullPageLoader />;
  }
  if (!user) return null;

  return <>{children}</>;
}