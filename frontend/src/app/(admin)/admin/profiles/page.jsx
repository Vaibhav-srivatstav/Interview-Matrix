'use client';
import { useEffect, useState } from 'react';
import { Search, Shield, Trash2, Eye, X, ChevronLeft, ChevronRight, User } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function UserDetailModal({ userId, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/admin/users/${userId}`, { credentials: 'include' })
      .then(r => r.json()).then(setData).catch(console.error);
  }, [userId]);

  if (!data) return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-gray-500 dark:text-gray-400">Loading...</div>
    </div>
  );

  const { user, sessions, resume } = data;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-auto backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <p className="text-gray-900 dark:text-white font-semibold">{user.name}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Sessions', value: sessions.length },
              { label: 'Completed', value: sessions.filter(s => s.status === 'completed').length },
              { label: 'Avg score', value: sessions.length
                ? Math.round(sessions.filter(s => s.overallPerformanceScore).reduce((a,s) => a + s.overallPerformanceScore, 0) / Math.max(sessions.filter(s => s.overallPerformanceScore).length, 1)) + '%'
                : 'N/A' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-transparent">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Skills from resume */}
          {resume?.detectedSkills?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Detected skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {resume.detectedSkills.map((s, i) => (
                  <span key={i} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-md">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Recent sessions */}
          {sessions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Recent sessions</h4>
              <div className="space-y-2">
                {sessions.slice(0, 5).map(s => (
                  <div key={s._id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-transparent">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">{s.techStack?.join(', ') || 'General'}</p>
                      <p className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-xs capitalize font-medium ${s.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                        {s.status}
                      </span>
                      {s.overallPerformanceScore > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.overallPerformanceScore}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400 dark:text-gray-600">
            Joined: {new Date(user.createdAt).toLocaleDateString()} ·
            Provider: {user.oauthProvider || 'email'}
            {user.isAdmin && ' · Admin'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProfilesPage() {
  const [data, setData] = useState({ users: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (search) params.set('search', search);
    const res = await fetch(`${API}/api/admin/users?${params}`, { credentials: 'include' });
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page]);
  useEffect(() => {
    const t = setTimeout(fetchUsers, 400);
    return () => clearTimeout(t);
  }, [search]);

  const toggleAdmin = async (userId, current) => {
    if (!confirm(`${current ? 'Remove' : 'Grant'} admin access?`)) return;
    await fetch(`${API}/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isAdmin: !current }),
    });
    fetchUsers();
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user and all their sessions?')) return;
    await fetch(`${API}/api/admin/users/${userId}`, { method: 'DELETE', credentials: 'include' });
    fetchUsers();
  };

  return (
    <div className="p-8 space-y-6 min-h-screen bg-white dark:bg-transparent transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{data.total} registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input 
          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition" 
          placeholder="Search by name or email..."
          value={search} 
          onChange={e => { setSearch(e.target.value); setPage(1); }} 
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  {['User', 'Joined', 'Sessions', 'Completed', 'Role', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 text-xs font-bold">
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white font-medium">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{u.sessionCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{u.completedCount}</td>
                    <td className="px-4 py-3">
                      {u.isAdmin
                        ? <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-medium">Admin</span>
                        : <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium">User</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => setViewing(u._id)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition" title="View details">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => toggleAdmin(u._id, u.isAdmin)}
                          className={`p-1.5 rounded-lg transition ${u.isAdmin ? 'text-brand-500 bg-brand-50 dark:bg-brand-950/50' : 'text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950'}`}
                          title={u.isAdmin ? 'Remove admin' : 'Make admin'}>
                          <Shield size={14} />
                        </button>
                        <button onClick={() => deleteUser(u._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition" title="Delete user">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {data.pages}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p-1))} 
              disabled={page===1} 
              className="p-2 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition"
            >
              <ChevronLeft size={16}/>
            </button>
            <button 
              onClick={() => setPage(p => Math.min(data.pages, p+1))} 
              disabled={page===data.pages} 
              className="p-2 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition"
            >
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      )}

      {viewing && <UserDetailModal userId={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
