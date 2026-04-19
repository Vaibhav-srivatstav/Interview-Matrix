'use client';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '/src/lib/authContext';
import Navbar from '@/components/Navbar';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Footer from '@/components/footer';
import { ThemeProvider } from 'next-themes';
import { usePathname } from 'next/navigation';
import LayoutWrapper from '@/components/LayoutWraper';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark">
              <LayoutWrapper>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
                }}
              />
              </LayoutWrapper>
            </ThemeProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
