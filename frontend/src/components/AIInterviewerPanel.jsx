'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Mic } from 'lucide-react';

/* ---------------- Interviewer Data ---------------- */
const INTERVIEWERS = [
  { name: "Sarah Johnson", role: "Senior HR Manager" },
  { name: "David Lee", role: "Tech Lead - Backend" },
  { name: "Emily Carter", role: "Frontend Architect" },
  { name: "Rahul Mehta", role: "Engineering Manager" },
  { name: "Ananya Sharma", role: "Product Manager" },
  { name: "Michael Chen", role: "AI Specialist" },
];

export default function AIInterviewer({ question }) {
  const [interviewer, setInterviewer] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  /* ---------------- FIX: Stable Random Selection ---------------- */
  useEffect(() => {
    const index = Math.floor(Math.random() * INTERVIEWERS.length);

    setInterviewer(INTERVIEWERS[index]);

    // IMPORTANT: must use "/" for public folder
    setAvatar(`/interviewer${index + 1}.png`);
  }, []);

  /* ---------------- Speaking Animation ---------------- */
  useEffect(() => {
    if (!question) return;

    setSpeaking(true);
    const timer = setTimeout(() => setSpeaking(false), 2500);

    return () => clearTimeout(timer);
  }, [question]);

  if (!interviewer || !avatar) return null;

  return (
    <div className="card flex items-center gap-4 relative overflow-hidden">

      {/* Glow Background */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl" />

      {/* Avatar */}
      <div className="relative">
        <Image
          src={avatar}
          alt="Interviewer"
          width={64}
          height={64}
          className={`rounded-full border-2 border-blue-500 transition duration-300 ${
            speaking ? 'animate-pulse scale-105' : ''
          }`}
        />

        {/* Mic Indicator */}
        {speaking && (
          <span className="absolute bottom-0 right-0 bg-green-500 p-1 rounded-full animate-bounce">
            <Mic size={12} />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <p className="text-white font-semibold">{interviewer.name}</p>
        <p className="text-xs text-gray-400">{interviewer.role}</p>

        <div className="mt-2 text-sm text-blue-400 flex items-center gap-2">
          {speaking ? (
            <>
              <span className="animate-pulse">●</span>
              Speaking...
            </>
          ) : (
            "Listening..."
          )}
        </div>
      </div>
    </div>
  );
}