'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSession, submitAnswer, completeInterview } from '@/lib/api';

import EmotionDetector from '@/components/EmotionDetector';
import VoiceRecorder from '@/components/VoiceRecorder';
import ConfidenceScore from '@/components/ConfidenceScore';
import AIInterviewer from '@/components/AIInterviewerPanel';

import { ChevronRight, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InterviewPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState(0);

  const [emotionData, setEmotionData] = useState({ confidence_contribution: 65 });
  const [voiceMetrics, setVoiceMetrics] = useState({ clarity: 65 });
  const [nlpScore, setNlpScore] = useState(65);

  const emotionSnapshotsRef = useRef([]);
  const timerRef = useRef(null);

  /* ---------------- Load Questions ---------------- */
  useEffect(() => {
    getSession(sessionId)
      .then(() => {
        const stored = sessionStorage.getItem(`questions_${sessionId}`);
        if (stored) {
          setQuestions(JSON.parse(stored));
        } else {
          toast.error('Session questions not found');
          router.push('/dashboard');
        }
      })
      .catch(() => {
        toast.error('Session not found');
        router.push('/dashboard');
      });
  }, [sessionId]);

  /* ---------------- Timer ---------------- */
  useEffect(() => {
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  /* ---------------- Handlers ---------------- */
  const handleEmotionUpdate = useCallback((data) => {
    setEmotionData(data);
    emotionSnapshotsRef.current.push({ ...data, timestamp: new Date() });
    if (emotionSnapshotsRef.current.length > 30) {
      emotionSnapshotsRef.current.shift();
    }
  }, []);

  const handleTranscript = useCallback((text) => {
    setAnswerText(text);
  }, []);

  const handleVoiceMetrics = useCallback((metrics) => {
    setVoiceMetrics(metrics);
  }, []);

  const handleSubmitAnswer = async () => {
    const q = questions[currentIdx];
    if (!answerText.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitAnswer(sessionId, {
        questionId: q.id,
        questionText: q.text,
        answerText,
        emotionSnapshots: emotionSnapshotsRef.current,
        voiceMetrics,
      });

      setNlpScore(res.data.scores?.nlpScore || 65);
      emotionSnapshotsRef.current = [];
      setAnswerText('');

      if (currentIdx + 1 >= questions.length) {
        await completeInterview(sessionId);
        setCompleted(true);
        clearInterval(timerRef.current);
        setTimeout(() => router.push(`/results/${sessionId}`), 2000);
      } else {
        setCurrentIdx((i) => i + 1);
      }
    } catch {
      toast.error('Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- States ---------------- */
  if (completed) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="text-green-500 mx-auto mb-4" size={60} />
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            Interview Complete!
          </h2>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">

      {/* Header */}
      <div className="border-b border-[var(--border)] px-6 py-3 flex justify-between backdrop-blur-md bg-[var(--card)]/60">
        <span className="text-sm flex items-center gap-2 text-muted-foreground">
          <Clock size={14} /> {formatTime(timer)}
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">

        {/* LEFT PANEL */}
        <div className="space-y-4">
          <AIInterviewer question={currentQ.text} />

          <EmotionDetector
            sessionId={sessionId}
            onEmotionUpdate={handleEmotionUpdate}
          />

          <ConfidenceScore
            emotionScore={emotionData.confidence_contribution}
            voiceScore={voiceMetrics.clarity}
            nlpScore={nlpScore}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2 space-y-4">

          {/* Question */}
          <div className="card">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {currentQ.text}
            </h2>
          </div>

          {/* Answer */}
          <div className="card space-y-3">
            <VoiceRecorder
              onTranscript={handleTranscript}
              onVoiceMetrics={handleVoiceMetrics}
            />

            <textarea
              className="input resize-none w-full bg-transparent"
              placeholder="Speak or type your answer..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmitAnswer}
            disabled={submitting}
            className="btn-primary w-full flex justify-center gap-2 py-3"
          >
            Next <ChevronRight size={18} />
          </button>

        </div>
      </div>
    </div>
  );
}