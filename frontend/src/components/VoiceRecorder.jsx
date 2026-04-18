'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { analyzeVoice } from '@/lib/api';

export default function VoiceRecorder({ onTranscript, onVoiceMetrics }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const srRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const shouldRestartSR = useRef(false);

  /* ---------------- Speech Recognition ---------------- */
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
          finalTranscriptRef.current += e.results[i][0].transcript + ' ';
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      onTranscript && onTranscript(finalTranscriptRef.current + interim);
    };

    sr.onend = () => {
      if (shouldRestartSR.current && recording) sr.start();
    };

    sr.onerror = () => {
      // silent fail for UX
    };

    srRef.current = sr;

    return () => {
      shouldRestartSR.current = false;
      sr.stop();
    };
  }, [recording, onTranscript]);

  /* ---------------- Start Recording ---------------- */
  const startRecording = async () => {
    try {
      setError('');
      finalTranscriptRef.current = '';
      onTranscript && onTranscript('');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start(250);
      setRecording(true);

      if (srRef.current) {
        shouldRestartSR.current = true;
        srRef.current.start();
      }
    } catch (err) {
      console.error(err);
      setError('Microphone permission denied or unavailable.');
    }
  };

  /* ---------------- Stop Recording ---------------- */
  const stopRecording = async () => {
    setRecording(false);
    setProcessing(true);

    try {
      shouldRestartSR.current = false;
      srRef.current && srRef.current.stop();

      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) return;

      mediaRecorder.stop();

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType,
          });

          const base64 = await blobToBase64(blob);

          const res = await analyzeVoice({
            audioBase64: base64,
          });

          const data = res.data;

          if (data.transcript) {
            onTranscript && onTranscript(data.transcript);
          }

          onVoiceMetrics &&
            onVoiceMetrics({
              clarity: data.clarity ?? 60,
            });
        } catch (err) {
          console.error(err);
          setError('Voice analysis failed.');
          onVoiceMetrics && onVoiceMetrics({ clarity: 60 });
        } finally {
          cleanupStream();
          setProcessing(false);
        }
      };
    } catch (err) {
      console.error(err);
      setProcessing(false);
      cleanupStream();
    }
  };

  /* ---------------- Helpers ---------------- */
  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () =>
        resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
    });

  /* ---------------- UI ---------------- */
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border
      bg-white/60 border-gray-200
      dark:bg-gray-900/60 dark:border-gray-800"
    >
      {!recording ? (
        <button
          onClick={startRecording}
          disabled={processing}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl disabled:opacity-50"
        >
          <Mic size={14} />
          Start
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-xl"
        >
          <Square size={14} />
          Stop
        </button>
      )}

      {recording && (
        <span className="text-green-500 text-sm animate-pulse">
          Listening...
        </span>
      )}

      {processing && (
        <span className="text-yellow-500 text-sm flex items-center gap-1">
          <Loader2 size={14} className="animate-spin" />
          Analyzing...
        </span>
      )}

      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}