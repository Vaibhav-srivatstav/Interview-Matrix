'use client';
import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { Trophy, Calendar } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const EMOTION_COLOR = {
  happy: '#22c55e', neutral: '#6b7280', surprise: '#f59e0b',
  sad: '#3b82f6', fear: '#a855f7', angry: '#ef4444', disgust: '#f97316',
};

const SCORE_COLOR = (s) => s >= 75 ? 'text-green-500 dark:text-green-400' : s >= 50 ? 'text-yellow-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400';

export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchReports = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    fetch(`${API}/api/admin/reports?${params}`, { credentials: 'include' })
      .then(r => r.json()).then(setData).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const emotionData = (data?.emotionDist || []).map(e => ({
    name: e._id || 'unknown',
    value: e.count,
    fill: EMOTION_COLOR[e._id] || '#6b7280',
  }));

  return (
    <div className="p-8 space-y-8 min-h-screen bg-white dark:bg-transparent transition-colors">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Platform performance analytics</p>
        </div>

        <div className="flex items-center gap-3 bg-gray-300 dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-800">
          <Calendar size={16} className="text-gray-800 dark:text-gray-500" />
          <input type="date" className="bg-transparent text-gray-900 dark:text-white text-sm outline-none" value={from} onChange={e => setFrom(e.target.value)} />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" className="bg-transparent text-gray-900 dark:text-white text-sm outline-none" value={to} onChange={e => setTo(e.target.value)} />
          <button onClick={fetchReports} className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition">Apply</button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 dark:text-gray-500">Loading reports...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total sessions', value: data.sessions.length },
              {
                label: 'Avg performance', value: data.sessions.length
                  ? Math.round(data.sessions.reduce((a, s) => a + (s.overallPerformanceScore || 0), 0) / data.sessions.length) + '%'
                  : 'N/A'
              },
              {
                label: 'Avg confidence', value: data.sessions.length
                  ? Math.round(data.sessions.reduce((a, s) => a + (s.overallConfidenceScore || 0), 0) / data.sessions.length) + '%'
                  : 'N/A'
              },
              {
                label: 'Avg duration', value: data.sessions.length
                  ? Math.round(data.sessions.reduce((a, s) => a + (s.duration || 0), 0) / data.sessions.length / 60) + 'm'
                  : 'N/A'
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Daily completed sessions</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.daily}>
                  <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(31 41 55)',
                      border: 'none',
                      borderRadius: 8,
                      color: '#fff'
                    }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Sessions" />
                  <Bar dataKey="avgScore" fill="#22c55e" radius={[4, 4, 0, 0]} name="Avg score" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Emotion distribution</h3>
              {emotionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={emotionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} stroke="none">
                      {emotionData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">No emotion data</div>
              )}
            </div>
          </div>

          {data.topPerformers?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={16} className="text-amber-500" />
                <h3 className="text-gray-900 dark:text-white font-semibold text-sm">Top performers</h3>
              </div>
              <div className="space-y-2">
                {data.topPerformers.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className={`text-lg font-bold w-6 text-center ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-400'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white text-sm font-medium">{p.user?.name}</p>
                      <p className="text-gray-500 text-xs">{p.user?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${SCORE_COLOR(p.avgScore)}`}>{Math.round(p.avgScore)}%</p>
                      <p className="text-xs text-gray-500">{p.sessions} session{p.sessions !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white font-semibold text-sm">Recent completed sessions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    {['User', 'Tech stack', 'Confidence', 'Performance', 'Duration', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.sessions.slice(0, 20).map(s => (
                    <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">{s.userId?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{s.userId?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{s.techStack?.slice(0, 3).join(', ')}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${SCORE_COLOR(s.overallConfidenceScore)}`}>
                          {s.overallConfidenceScore || 0}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${SCORE_COLOR(s.overallPerformanceScore)}`}>
                          {s.overallPerformanceScore || 0}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                        {s.duration ? `${Math.round(s.duration / 60)}m` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
