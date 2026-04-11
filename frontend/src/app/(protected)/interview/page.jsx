'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Brain } from 'lucide-react';

export default function InterviewRedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(0);

  /* Fake progress steps for UX */
  useEffect(() => {
    const steps = [
      'Analyzing your resume...',
      'Generating AI questions...',
      'Preparing interview session...',
      'Almost ready...',
    ];

    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < steps.length) setStep(i);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const sessionId = searchParams.get('session');
    const questions = searchParams.get('q');

    if (sessionId && questions) {
      sessionStorage.setItem(`questions_${sessionId}`, questions);

      setTimeout(() => {
        router.replace(`/interview/${sessionId}`);
      }, 4000); // matches animation timing
    } else {
      router.replace('/dashboard');
    }
  }, []);

  const stepsText = [
    'Analyzing your resume...',
    'Generating AI questions...',
    'Preparing interview session...',
    'Almost ready...',
  ];

  return (
    <div className="relative min-h-screen grid-pattern flex items-center justify-center">

      {/* Glow */}
      <div className="bg-glow top-1/3 left-1/2 -translate-x-1/2" />

      <div className="relative z-10 text-center">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-5 rounded-full bg-white/5 border border-white/10 animate-pulse">
            <Brain size={36} className="text-green-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-white mb-2">
          Preparing Your Interview
        </h1>

        {/* Dynamic Status */}
        <p className="text-gray-400 text-sm mb-6">
          {stepsText[step]}
        </p>

        {/* Progress Bar */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-700"
            style={{ width: `${(step + 1) * 25}%` }}
          />
        </div>

        {/* Sub text */}
        <p className="text-xs text-gray-500 mt-4">
          This may take a few seconds...
        </p>

      </div>
    </div>
  );
}