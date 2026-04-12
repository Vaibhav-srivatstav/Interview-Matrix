'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '/src/lib/authContext';
import { Brain, Mic, Camera, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import logo from '../../public/light_hero.png';
import logo2 from '../../public/dark_hero.png';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  const features = [
    { icon: Camera, title: 'Facial Emotion AI', desc: 'Real-time emotion detection via DeepFace analyzes your confidence, nervousness, and engagement.' },
    { icon: Mic, title: 'Voice Analysis', desc: 'Speech rate, filler words, clarity, and pause detection to measure verbal confidence.' },
    { icon: Brain, title: 'NLP Answer Scoring', desc: 'Semantic similarity scoring compares your answers to ideal responses using transformer models.' },
    { icon: FileText, title: 'Smart Resume Parsing', desc: 'Upload your resume — we auto-detect your tech stack and generate role-specific questions.' },
    { icon: TrendingUp, title: 'Confidence Score', desc: 'A weighted score (emotion 30% + voice 20% + NLP 50%) gives you a holistic confidence rating.' },
  ];

  return (
    <div className="min-h-screen transition
      bg-white text-black
      dark:bg-gray-950 dark:text-white
    ">

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src={logo} alt="Logo" width={800} hight='auto' className="block dark:hidden" />
          <Image src={logo2} alt="Logo" width={800} hight='auto' className="hidden dark:block" />
        </div>

        {/* Badge */}
        <div className="
          inline-block px-4 py-1 rounded-full text-sm mb-6
          bg-gray-200 text-gray-700
          dark:bg-brand-900 dark:text-brand-300
        ">
          AI-Powered Interview Practice
        </div>

        {/* Heading */}
        <h1 className="
          text-5xl font-bold mb-6 leading-tight
          text-black dark:text-white
        ">
          Ace Your Next Interview<br />
          <span className="text-brand-500">
            with Real-time AI Feedback
          </span>
        </h1>

        {/* Description */}
        <p className="
          text-lg max-w-2xl mx-auto mb-10
          text-gray-600 dark:text-gray-400
        ">
          Upload your resume, get custom questions for your tech stack, and practice with live facial emotion tracking, voice analysis, and AI-powered scoring.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push(user ? '/upload' : '/register')}
            className="btn-primary flex items-center gap-2 text-base px-8 py-3"
          >
            Start Practicing <ArrowRight size={18} />
          </button>

          <button
            onClick={() => router.push('/login')}
            className="btn-secondary text-base px-8 py-3"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="
                p-6 rounded-2xl border transition
                bg-white border-gray-200
                dark:bg-gray-900 dark:border-gray-800
                hover:border-brand-500
              "
            >
              <Icon className="text-brand-500 mb-3" size={28} />

              <h3 className="
                font-semibold mb-2
                text-black dark:text-white
              ">
                {title}
              </h3>

              <p className="
                text-sm leading-relaxed
                text-gray-600 dark:text-gray-400
              ">
                {desc}
              </p>
            </div>
          ))}

        </div>
      </section>

    </div>
  );
}