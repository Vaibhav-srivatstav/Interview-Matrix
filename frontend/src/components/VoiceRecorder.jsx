'use client';
import { useRef, useEffect, useState } from 'react';
import { Mic, Square } from 'lucide-react';

export default function VoiceRecorder({ onTranscript, onVoiceMetrics }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const srRef = useRef(null);
  const finalRef = useRef('');
  const shouldRef = useRef(false);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const sr = new SR();
    sr.continuous = true;
    sr.interimResults = true;

    sr.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalRef.current += e.results[i][0].transcript + ' ';
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      onTranscript(finalRef.current + interim);
    };

    sr.onend = () => {
      if (shouldRef.current) sr.start();
    };

    srRef.current = sr;
  }, []);

  const start = () => {
    finalRef.current = '';
    onTranscript('');
    shouldRef.current = true;
    srRef.current.start();
    setRecording(true);
  };

  const stop = () => {
    shouldRef.current = false;
    srRef.current.stop();
    setRecording(false);
    onVoiceMetrics?.({ clarity: 75 });
  };

  return (
    <div className="
      flex items-center gap-3 p-3 rounded-xl border
      bg-white/60 border-gray-200
      dark:bg-gray-900/60 dark:border-gray-800
    ">
      {!recording ? (
        <button
          onClick={start}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl"
        >
          <Mic size={14} /> Start
        </button>
      ) : (
        <button
          onClick={stop}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-xl"
        >
          <Square size={14} /> Stop
        </button>
      )}

      {recording && (
        <span className="text-green-500 text-sm animate-pulse">
          Listening...
        </span>
      )}

      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}