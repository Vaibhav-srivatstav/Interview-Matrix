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

  /* 1. Stable Random Selection (Runs once on mount) */
  useEffect(() => {
    const index = Math.floor(Math.random() * INTERVIEWERS.length);
    setInterviewer(INTERVIEWERS[index]);
    setAvatar(`/Interviewer${index + 1}.png`);
  }, []);

  /* 2. Text-to-Speech & Animation Logic */
  useEffect(() => {
    if (!question || typeof window === 'undefined') return;

    // Cancel any ongoing speech if the question changes quickly
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(question);
    
    // Optional: Find a specific voice (e.g., Google English)
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.lang.includes('en')) || voices[0];
    
    utterance.rate = 0.95; // Slightly slower for professional feel
    utterance.pitch = 1.0;

    // Start Animation when audio starts
    utterance.onstart = () => {
      setSpeaking(true);
    };

    // Stop Animation when audio ends
    utterance.onend = () => {
      setSpeaking(false);
    };

    // Error handling
    utterance.onerror = () => {
      setSpeaking(false);
    };

    // Speak the question
    window.speechSynthesis.speak(utterance);

    // Cleanup: Stop speaking if user leaves the page or question changes
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [question]);

  if (!interviewer || !avatar) return null;

  return (
    <div className="card flex items-center gap-4 relative overflow-hidden transition-all duration-500 bg-white/5 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl backdrop-blur-md">

      {/* Glow Background (Pulses while speaking) */}
      <div className={`absolute inset-0 opacity-10 bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl transition-opacity duration-500 ${speaking ? 'opacity-25' : 'opacity-10'}`} />

      {/* Avatar Section */}
      <div className="relative z-10">
        <div className={`relative h-16 w-16 transition-transform duration-300 ${speaking ? 'scale-110' : 'scale-100'}`}>
           <Image
            src={avatar}
            alt="Interviewer"
            width={64}
            height={64}
            sizes="64px"
            className={`rounded-full border-2 object-cover transition-colors duration-300 ${
                speaking ? 'border-green-400' : 'border-blue-500'
            }`}
            style={{ height: "auto", width: "auto" }} // Prevents hydration warnings
          />
        </div>

        {/* Mic Indicator Icon */}
        {speaking && (
          <span className="absolute -bottom-1 -right-1 bg-green-500 p-1.5 rounded-full animate-bounce shadow-lg text-white">
            <Mic size={12} />
          </span>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 z-10">
        <p className="text-gray-900 dark:text-white font-bold text-lg leading-tight">{interviewer.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">{interviewer.role}</p>

        <div className="mt-2 text-sm flex items-center gap-2">
          {speaking ? (
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Asking Question...
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400 font-medium">
              <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
              Listening...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
