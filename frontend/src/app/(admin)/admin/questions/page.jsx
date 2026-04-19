'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const CATEGORIES = ['html','css','javascript','react','nodejs','mongodb','mern','fullstack',
  'frontend','backend','python','system_design','data_structures','behavioral','hr'];
const DIFFICULTIES = ['easy','medium','hard'];

// Refined colors for better contrast in both themes
const DIFF_COLOR = { 
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', 
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', 
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
};

const EMPTY = { text: '', category: 'javascript', difficulty: 'medium', expectedKeywords: [] };

function QuestionModal({ question, onSave, onClose }) {
  const [form, setForm] = useState(question || EMPTY);
  const [kwInput, setKwInput] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const addKw = () => {
    if (!kwInput.trim()) return;
    setForm(f => ({ ...f, expectedKeywords: [...(f.expectedKeywords || []), kwInput.trim()] }));
    setKwInput('');
  };

  const removeKw = (i) => setForm(f => ({
    ...f, expectedKeywords: f.expectedKeywords.filter((_, idx) => idx !== i)
  }));

  const handleSave = async () => {
    if (!form.text.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-900 dark:text-white font-semibold">{question?._id ? 'Edit Question' : 'Add Question'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"><X size={18} /></button>
        </div>

        <textarea
          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 resize-none h-28"
          placeholder="Question text..."
          value={form.text}
          onChange={set('text')}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Category</label>
            <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 text-sm text-gray-900 dark:text-white outline-none" value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Difficulty</label>
            <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 text-sm text-gray-900 dark:text-white outline-none" value={form.difficulty} onChange={set('difficulty')}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Expected keywords</label>
          <div className="flex gap-2 mb-2">
            <input className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 text-sm text-gray-900 dark:text-white outline-none" placeholder="Add keyword..." value={kwInput}
              onChange={e => setKwInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addKw()} />
            <button onClick={addKw} className="bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded-xl transition">Add</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(form.expectedKeywords || []).map((kw, i) => (
              <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs border border-gray-200 dark:border-transparent">
                {kw}
                <button onClick={() => removeKw(i)} className="text-gray-400 hover:text-red-500"><X size={10} /></button>
              </span>
            ))}
          </div>
        </div>

        <textarea
          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 resize-none h-20"
          placeholder="Sample answer (optional)..."
          value={form.sampleAnswer || ''}
          onChange={set('sampleAnswer')}
        />

        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm py-2 px-6 rounded-xl font-medium transition">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminQuestionsPage() {
  const [data, setData]       = useState({ questions: [], total: 0, pages: 1 });
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); 
  const [deleting, setDeleting] = useState(null);

  const fetchQuestions = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (search)     params.set('search', search);
    if (category !== 'all')   params.set('category', category);
    if (difficulty !== 'all') params.set('difficulty', difficulty);

    const res = await fetch(`${API}/api/admin/questions?${params}`, { credentials: 'include' });
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, [page, category, difficulty]);
  useEffect(() => {
    const t = setTimeout(fetchQuestions, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSave = async (form) => {
    const isEdit = !!form._id;
    const url = isEdit ? `${API}/api/admin/questions/${form._id}` : `${API}/api/admin/questions`;
    await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    setModal(null);
    fetchQuestions();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    setDeleting(id);
    await fetch(`${API}/api/admin/questions/${id}`, { method: 'DELETE', credentials: 'include' });
    setDeleting(null);
    fetchQuestions();
  };

  return (
    <div className="p-8 space-y-6 min-h-screen bg-white dark:bg-transparent">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Questions</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{data.total} total questions</p>
        </div>
        <button onClick={() => setModal('add')} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition shadow-lg shadow-brand-500/20">
          <Plus size={16} /> Add Question
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 transition" placeholder="Search questions..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm outline-none w-36" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
          <option value="all">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm outline-none w-32" value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }}>
          <option value="all">All levels</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">Loading...</div>
        ) : data.questions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">No questions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  {['Question', 'Category', 'Difficulty', 'Keywords', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.questions.map(q => (
                  <tr key={q._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 max-w-xs">
                      <p className="truncate font-medium">{q.text}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs border border-gray-200 dark:border-transparent">{q.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs capitalize font-medium ${DIFF_COLOR[q.difficulty]}`}>{q.difficulty}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {(q.expectedKeywords || []).slice(0, 3).join(', ')}
                      {q.expectedKeywords?.length > 3 && '...'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setModal(q)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(q._id)} disabled={deleting === q._id}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition">
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

      {data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {data.pages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
              className="p-2 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {modal && (
        <QuestionModal
          question={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
