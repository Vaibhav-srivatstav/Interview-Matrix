'use client';

import { useEffect, useState } from 'react';
import { Users, Brain, HelpCircle, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';


const COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
];

/* ---------------- MAIN PAGE ---------------- */
export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  /* ------------ THEME INIT ------------- */
  useEffect(() => {
    const saved = localStorage.getItem('theme') ?? 'dark';
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  /* ------------ FETCH DATA ------------- */
  useEffect(() => {
    fetch(`${API}/api/admin/stats`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ------------- RENDER -------------- */
  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading…</div>;
  if (!stats)  return <div className="p-8 text-red-500">Failed to load stats</div>;

  /***   PRE‑PARE THE DATA FOR THE BAR CHART   ***/
  const catChartData = stats.questionsByCategory.slice(0, 8).map((d, idx) => ({
    // pick whichever field holds the label:
    //  - if backend sends { _id: "Math", count: 12 }
    //  - if backend sends { category: "Math", count: 12 }
    //  Adjust the key below accordingly.
    name: d._id ?? d.category ?? d.name ?? `Cat ${idx + 1}`,
    count: d.count,
    // keep a stable id to help React reuse Cell keys
    key: d._id ?? d.category ?? idx,
  }));

  const tickColor = theme === 'dark' ? '#d1d5db' : '#6b7280';

  /* ---------- MAIN RETURN --------- */
  return (
    <div className="p-8 space-y-8 bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300">
      {/* HEADER ---------------------------------------------------- */}
      <div className="border-b px-6 py-3 flex justify-between items-center backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 rounded-xl">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Platform health at a glance
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:scale-105 transition"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* STAT CARDS ------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total users"
          value={stats.totalUsers}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
        />
        <StatCard
          icon={Brain}
          label="Sessions"
          value={stats.totalSessions}
          color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
        />
        <StatCard
          icon={HelpCircle}
          label="Questions"
          value={stats.totalQuestions}
          color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Confidence"
          value={`${stats.avgConfidence}%`}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
        />
      </div>

      {/* CHARTS ------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LINE CHART ---------------------------------------------- */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <h3 className="text-black dark:text-white font-semibold mb-4 text-sm">
            Sessions last 7 days
          </h3>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.dailySessions}>
              <XAxis
                dataKey="_id"
                tick={{ fill: tickColor, fontSize: 11 }}
              />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: theme === 'dark' ? '#111827' : '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  color: theme === 'dark' ? '#f9fafb' : '#111827',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART ----------------------------------------------- */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <h3 className="text-black dark:text-white font-semibold mb-4 text-sm">
            Questions by category
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={catChartData}
              layout="vertical"
              margin={{ top: 10, right: 0, left: 120, bottom: 10 }}
            >
              <XAxis
                type="number"
                tick={{ fill: tickColor, fontSize: 11 }}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: tickColor, fontSize: 11 }}
                width={120} // <‑‑ give more space
              />
              <Tooltip
                contentStyle={{
                  background: theme === 'dark' ? '#111827' : '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  color: theme === 'dark' ? '#f9fafb' : '#111827',
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={17}>
                {catChartData.map((c, i) => (
                  <Cell key={c.key} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT USERS -------------------------------------------- */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
        <h3 className="text-black dark:text-white font-semibold mb-4 text-sm">
          Recent signups
        </h3>

        <div className="space-y-2">
          {stats.recentUsers.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800 last:border-0"
            >
              <div>
                <p className="text-black dark:text-white text-sm font-medium">
                  {u.name}
                </p>
                <p className="text-gray-500 text-xs">{u.email}</p>
              </div>

              <div className="flex items-center gap-2">
                {u.isAdmin && (
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    Admin
                  </span>
                )}
                <span className="text-gray-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}