'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { X, Menu, LogOut, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import logo from '../../public/logo.png';
import logo2 from '../../public/logo2.png';

/* ---------------- Theme Hook ---------------- */
function useTheme() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return { theme, toggleTheme };
}

/* ---------------- Mobile Drawer ---------------- */
function MobileDrawer({ user, navLinks, onLogin, onRegister, onLogout, onClose }) {
  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="
        absolute top-0 right-0 h-full w-64 flex flex-col animate-fade-in
        bg-white text-black border-l border-gray-300
        dark:bg-gray-950 dark:text-white dark:border-gray-800
      ">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300 dark:border-gray-800">
            <div className="size-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
              <span className="font-bold text-xl">
                <Image src={logo} alt="Logo" width={48} height={50} className="block dark:hidden" />
                <Image src={logo2} alt="Logo" width={48} height={50} className="hidden dark:block" />
              </span>
            </div>
            <span className="hidden sm:inline font-semibold text-sm text-black dark:text-white">Interview Matrix</span>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Links (UNCHANGED) */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href} className="block px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
              {label}
            </a>
          ))}
        </nav>

        {/* Auth */}
        <div className="p-4 border-t border-gray-300 dark:border-gray-800">
          {user ? (
            <button
              onClick={() => { onClose(); onLogout(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-xl"
            >
              <LogOut size={14} /> Sign out
            </button>
          ) : (
            <>
              <button onClick={() => { onClose(); onLogin(); }} className="w-full btn-secondary mb-2">
                Sign in
              </button>
              <button onClick={() => { onClose(); onRegister(); }} className="w-full btn-primary">
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Navbar ---------------- */
export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const guestLinks = [
    { label: 'Home', href: '/' },
    { label: 'Interview', href: '/upload' },
  ];

  const authLinks = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Interview', href: '/upload' },
    { label: 'profile', href: '/profile' },
  ];

  const navLinks = user ? authLinks : guestLinks;

  if (loading) return null;

  return (
    <>
      <nav className="
        flex items-center border mx-4 max-md:w-full max-md:justify-between 
        px-6 py-4 rounded-full text-sm justify-between transition

        bg-white text-black border-gray-300
        dark:bg-gray-950 dark:text-white dark:border-slate-700
      ">

        {/* LEFT: Theme + Logo */}
        <div className="flex items-center gap-3">


          {/* Logo */}
          <button
            onClick={() => router.push(user ? '/dashboard' : '/')}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <Image src={logo} alt="Logo" width={48} height={50} className="block dark:hidden" />
            <Image src={logo2} alt="Logo" width={48} height={50} className="hidden dark:block" />
            <span className="font-bold text-sm tracking-tight">
              Interview Matrix
            </span>
          </button>

           {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-400 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

        </div>

        {/* Links (UNCHANGED UI) */}
        <div className="hidden md:flex items-center gap-6 ml-7">
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href} className="relative overflow-hidden h-6 group">
              <span className="block group-hover:-translate-y-full transition-transform duration-300">{label}</span>
              <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300">{label}</span>
            </a>
          ))}
        </div>

       

        {/* Auth Buttons */}
        
        <div className="hidden ml-14 md:flex items-center gap-4">
          {user ? (
            <button
              onClick={handleLogout}
              className="
                border border-gray-400 dark:border-slate-600
                hover:bg-gray-200 dark:hover:bg-slate-800
                px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2
              "
            >
              <LogOut size={14} />
              Sign out
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="
                  border border-gray-400 dark:border-slate-600
                  hover:bg-gray-200 dark:hover:bg-slate-800
                  px-4 py-2 rounded-full text-sm font-medium transition
                "
              >
                Sign in
              </button>

              <button
                onClick={() => router.push('/register')}
                className="
                  bg-black text-white dark:bg-white dark:text-black
                  px-4 py-2 rounded-full text-sm font-medium
                  hover:opacity-90 transition
                "
              >
                Get started
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
        >
          <Menu size={20} />
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <MobileDrawer
          user={user}
          navLinks={navLinks}
          onLogin={() => router.push('/login')}
          onRegister={() => router.push('/register')}
          onLogout={handleLogout}
          onClose={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}