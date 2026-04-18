'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '/src/lib/authContext';
import { getSessions } from '/src/lib/api';
import {
  Brain, Upload, Play, TrendingUp, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import FullPageLoader from '@/components/FullPageLoader';

/* ---------------- Score Badge ---------------- */
function ScoreBadge({ score }) {
  const color =
    score >= 75
      ? 'bg-green-500/20 text-green-400'
      : score >= 50
      ? 'bg-yellow-500/20 text-yellow-400'
      : 'bg-red-500/20 text-red-400';

  return <span className={`px-2 py-1 rounded-lg text-xs ${color}`}>{score}%</span>;
}

/* ---------------- KPI Card ---------------- */
function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="
      p-5 rounded-2xl backdrop-blur
      bg-white/70 border border-gray-200
      dark:bg-gray-900/70 dark:border-gray-800
      flex items-center gap-4
      hover:shadow-lg hover:scale-[1.02] transition
    ">
      <div className="p-3 rounded-xl bg-gradient-to-br from-brand-500/30 to-purple-500/20">
        <Icon size={22} className="text-brand-400" />
      </div>

      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

/* ---------------- Progress Bar ---------------- */
function ProgressBar({ value, label }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-400">{value}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-purple-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return; 
    }

    getSessions()
      .then((res) => setSessions(res.data.sessions || []))
      .catch(() => toast.error('Failed to load sessions'))
      .finally(() => setLoading(false));
  }, [user]);

  const completed = sessions.filter((s) => s.status === 'completed');

  const avgConfidence = completed.length
    ? Math.round(completed.reduce((s, c) => s + (c.overallConfidenceScore || 0), 0) / completed.length)
    : 0;

  const avgPerformance = completed.length
    ? Math.round(completed.reduce((s, c) => s + (c.overallPerformanceScore || 0), 0) / completed.length)
    : 0;

  const chartData = completed.map((s, i) => ({
    name: `#${i + 1}`,
    confidence: s.overallConfidenceScore || 0,
    performance: s.overallPerformanceScore || 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-black transition">

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10 sticky top-0 z-10 backdrop-blur bg-white/60 dark:bg-black/40 py-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/upload')}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload size={16} /> Upload
            </button>

            <button
              onClick={() => router.push('/upload')}
              className="btn-primary flex items-center gap-2"
            >
              <Play size={16} /> Start
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          <StatCard label="Sessions" value={sessions.length} icon={Brain} />
          <StatCard label="Completed" value={completed.length} icon={TrendingUp} />
          <StatCard label="Confidence" value={`${avgConfidence}%`} icon={TrendingUp} />
          <StatCard label="Performance" value={`${avgPerformance}%`} icon={Clock} />
        </div>

        {/* ANALYTICS */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">

          {/* Line Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border dark:border-gray-800">
            <h2 className="font-semibold mb-4">Performance</h2>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="confidence" strokeWidth={3} />
                  <Line type="monotone" dataKey="performance" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border dark:border-gray-800">
            <h2 className="font-semibold mb-4">Confidence Growth Trend</h2>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="confidence" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* PROGRESS INSIGHTS */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border dark:border-gray-800 mb-10">
          <h2 className="font-semibold mb-4">Insights</h2>

          <div className="space-y-4">
            <ProgressBar value={avgConfidence} label="Confidence Level" />
            <ProgressBar value={avgPerformance} label="Performance Level" />
          </div>
        </div>

        {/* SESSIONS */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border dark:border-gray-800">
          <h2 className="font-semibold mb-4">Interview History</h2>

          {loading ? (
            <FullPageLoader/>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No interviews yet</p>
              <button onClick={() => router.push('/upload')} className="btn-primary">
                Start Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((s) => (
                <div
                  key={s._id}
                  onClick={() => router.push(`/results/${s._id}`)}
                  className="
                    p-4 rounded-xl cursor-pointer transition
                    bg-gray-100 hover:bg-gray-200
                    dark:bg-gray-800 dark:hover:bg-gray-700
                    flex justify-between items-center
                  "
                >
                  <div>
                    <p className="font-medium capitalize">
                      {s.techStack?.join(', ') || 'General'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {s.status === 'completed' && (
                    <div className="flex gap-6">
                      <ScoreBadge score={s.overallConfidenceScore || 0} />
                      <ScoreBadge score={s.overallPerformanceScore || 0} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}