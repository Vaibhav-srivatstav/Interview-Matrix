'use client';
import { useEffect, useState } from 'react';
import { Users, Brain, HelpCircle, TrendingUp, Award } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}><Icon size={22} /></div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/admin/stats`, { credentials: 'include' })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (!stats)  return <div className="p-8 text-red-400">Failed to load stats</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Platform health at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="Total users"       value={stats.totalUsers}       color="bg-brand-900 text-brand-400" />
        <StatCard icon={Brain}      label="Total sessions"    value={stats.totalSessions}    color="bg-green-900 text-green-400" />
        <StatCard icon={HelpCircle} label="Questions"         value={stats.totalQuestions}   color="bg-amber-900 text-amber-400" />
        <StatCard icon={TrendingUp} label="Avg confidence"    value={`${stats.avgConfidence}%`} color="bg-purple-900 text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily sessions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm">Sessions last 7 days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.dailySessions}>
              <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Questions by category */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm">Questions by category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.questionsByCategory.slice(0, 8)} layout="vertical">
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis dataKey="_id" type="category" tick={{ fill: '#6b7280', fontSize: 11 }} width={80} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {stats.questionsByCategory.slice(0, 8).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4 text-sm">Recent signups</h3>
        <div className="space-y-2">
          {stats.recentUsers.map((u) => (
            <div key={u._id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div>
                <p className="text-white text-sm font-medium">{u.name}</p>
                <p className="text-gray-500 text-xs">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {u.isAdmin && <span className="badge bg-brand-900 text-brand-300 text-xs">Admin</span>}
                <span className="text-gray-600 text-xs">{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
