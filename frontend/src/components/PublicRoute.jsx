import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FullPageLoader from './FullPageLoader';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <FullPageLoader/>
    );
  }

  return children;
}