'use client';

import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FullPageLoader from './FullPageLoader';

export default function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuth();


  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, initialized, router]);

  if (loading || !initialized) {
    return <FullPageLoader/>;
  }
  if (!user) return null;

  return children;
}