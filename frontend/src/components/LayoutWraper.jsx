"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/footer';
import { useState, useEffect } from 'react';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // This ensures logic only runs after the browser is ready
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide Nav/Footer for Admin and Interview routes
  const isAdmin = pathname?.startsWith('/admin');
  const isInterview = pathname?.startsWith('/interview');
  const hideExtras = isAdmin || isInterview;

  // While the page is "hydrating", just show children to prevent mismatch
  if (!mounted) return <>{children}</>;

  return (
    <>
      {!hideExtras && <Navbar />}
      <main>{children}</main>
      {!hideExtras && <Footer />}
    </>
  );
}