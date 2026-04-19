'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import Link from 'next/link';
import {
  LayoutDashboard, HelpCircle, Users, BarChart3,
  LogOut, Shield, ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import Image from 'next/image';
import logo from '../../../../public/Interview.png'

const NAV = [
  { href: '/admin',           label: 'Overview',  icon: LayoutDashboard },
  { href: '/admin/questions', label: 'Questions', icon: HelpCircle },
  { href: '/admin/profiles',  label: 'Users',     icon: Users },
  { href: '/admin/reports',   label: 'Reports',   icon: BarChart3 },
];

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ THEME STATE
  const [theme, setTheme] = useState("dark");

  /* ---------------- AUTH CHECK ---------------- */
  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.replace('/login');
    }
  }, [user, loading]);

  /* ---------------- THEME INIT ---------------- */
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

  /* ---------------- LOADING ---------------- */
  if (loading || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="text-gray-600 dark:text-gray-400">Checking access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors">

      {/* SIDEBAR */}
      <aside className="w-56 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 transition-colors">

        {/* BRAND */}
        <div className="px-5 py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <Image src={logo} width={48} height={30} />
              <span className="font-bold text-black dark:text-white text-sm">
                Admin Panel
              </span>
            </div>

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
            >
              {theme === "dark" ?<Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-600 mt-1 truncate">
            {user.email}
          </p>
        </div>

        {/* NAV LINKS */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white'
                }`}
              >
                <Icon size={16} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto bg-white dark:bg-gray-950 transition-colors">
        {children}
      </main>
    </div>
  );
}