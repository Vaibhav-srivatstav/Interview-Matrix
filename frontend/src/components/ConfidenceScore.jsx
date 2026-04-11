'use client';
import { useEffect, useState } from 'react';

function Arc({ value, size = 120, strokeWidth = 10 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const progress = circ - (value / 100) * circ * 0.75;
  const center = size / 2;

  const color = value >= 75 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size * 0.75}>
      <circle
        cx={center} cy={center} r={r}
        fill="none" stroke="rgb(75 85 99 / 0.3)"
        strokeWidth={strokeWidth}
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
        strokeDashoffset={circ * 0.125}
        strokeLinecap="round"
        transform={`rotate(135 ${center} ${center})`}
      />
      <circle
        cx={center} cy={center} r={r}
        fill="none" stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circ * 0.75 - progress} ${circ}`}
        strokeDashoffset={circ * 0.125}
        strokeLinecap="round"
        transform={`rotate(135 ${center} ${center})`}
        style={{ transition: 'all 0.6s ease' }}
      />
    </svg>
  );
}

export default function ConfidenceScore({ emotionScore, voiceScore, nlpScore }) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const calc = Math.round(
      (emotionScore || 65) * 0.3 +
      (voiceScore || 65) * 0.2 +
      (nlpScore || 65) * 0.5
    );
    setScore(calc);
  }, [emotionScore, voiceScore, nlpScore]);

  const label =
    score >= 75 ? 'High Confidence' :
    score >= 50 ? 'Moderate' : 'Low Confidence';

  return (
    <div className="
      rounded-2xl p-5 border backdrop-blur-xl
      bg-white/60 border-gray-200 text-black
      dark:bg-gray-900/60 dark:border-gray-800 dark:text-white
      shadow-lg
    ">
      <h3 className="text-sm font-medium text-center mb-4 opacity-70">
        Live Confidence Score
      </h3>

      <div className="flex flex-col items-center">
        <div className="relative">
          <Arc value={score} />
          <div className="absolute inset-0 flex items-center justify-center pt-4">
            <p className="text-2xl font-bold">{score}%</p>
          </div>
        </div>

        <p className="text-sm mt-2 font-medium opacity-80">{label}</p>
      </div>

      <div className="mt-5 space-y-3">
        {[
          { label: 'Emotion', value: emotionScore || 65 },
          { label: 'Voice', value: voiceScore || 65 },
          { label: 'Answer', value: nlpScore || 65 },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="flex justify-between text-xs opacity-60 mb-1">
              <span>{label}</span>
              <span>{Math.round(value)}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-700"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}