'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSessionReport } from '/src/lib/api';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line,
  CartesianGrid,
} from 'recharts';
import { Brain, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const EMOTION_COLOR_MAP = {
  happy: '#22c55e', neutral: '#6b7280', surprise: '#f59e0b',
  sad: '#3b82f6', fear: '#a855f7', angry: '#ef4444', disgust: '#f97316',
};

/* ---------------- Score Ring ---------------- */
function ScoreRing({ value, label, color }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="110" height="110">
        <circle cx="55" cy="55" r="45" fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx="55" cy="55" r="45" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="55" y="55" textAnchor="middle" dominantBaseline="central"
          fill="var(--foreground)" fontSize="20" fontWeight="600">
          {value}%
        </text>
      </svg>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export default function ResultsPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionReport(sessionId)
      .then((res) => setReport(res.data.report))
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-muted-foreground">Loading your results...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <button onClick={() => router.push('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  /* ---------------- Data ---------------- */
  const radarData = [
    { metric: 'NLP', value: report.breakdown?.nlpScore || 0 },
    { metric: 'Voice', value: report.breakdown?.voiceClarity || 0 },
    { metric: 'Emotion', value: report.breakdown?.emotionConfidence || 0 },
    { metric: 'Confidence', value: report.overallConfidence || 0 },
    { metric: 'Performance', value: report.overallPerformance || 0 },
  ];

  const emotionData = Object.entries(report.emotionBreakdown || {}).map(([name, count]) => ({
    name, count, fill: EMOTION_COLOR_MAP[name] || '#6b7280',
  }));

  const perQData = (report.perQuestionScores || []).map((q) => ({
    name: `Q${q.question}`, score: q.score,
  }));

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={16} /> Dashboard
          </button>

          <h1 className="text-2xl font-bold">Interview Results</h1>

          <span className="text-sm text-muted-foreground">
            {Math.floor(report.duration / 60)}m {report.duration % 60}s
          </span>
        </div>

        {/* Score Rings */}
        <div className="card mb-6 backdrop-blur-md bg-[var(--card)]/70">
          <h2 className="text-lg font-semibold text-center mb-6">Overall Scores</h2>
          <div className="flex justify-around flex-wrap gap-6">
            <ScoreRing value={report.overallConfidence || 0} label="Confidence" color="#6366f1" />
            <ScoreRing value={report.overallPerformance || 0} label="Performance" color="#22c55e" />
            <ScoreRing value={report.breakdown?.nlpScore || 0} label="Answer" color="#f59e0b" />
            <ScoreRing value={report.breakdown?.voiceClarity || 0} label="Voice" color="#3b82f6" />
            <ScoreRing value={report.breakdown?.emotionConfidence || 0} label="Emotion" color="#a855f7" />
          </div>
        </div>

        {/* AI Feedback */}
        {report.finalFeedback && (
          <div className="card mb-6 border border-[var(--border)] bg-[var(--card)]/60">
            <div className="flex gap-3">
              <Brain className="text-purple-400" />
              <div>
                <h3 className="font-semibold mb-1">AI Feedback</h3>
                <p className="text-sm text-muted-foreground">{report.finalFeedback}</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* Radar */}
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold">Performance Radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--foreground)', fontSize: 11 }} />
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Emotion */}
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold">Emotion Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={emotionData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="count">
                  {emotionData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Per Question */}
        {perQData.length > 0 && (
          <div className="card mb-6">
            <h3 className="mb-4 text-sm font-semibold">Score per Question</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={perQData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af' }} />

                <Tooltip />

                <Bar
                  dataKey="score"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button onClick={() => router.push('/upload')} className="btn-primary">
            Practice Again
          </button>
          <button onClick={() => router.push('/dashboard')} className="btn-secondary">
            Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}