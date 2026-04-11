'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { analyzeEmotion } from '/src/lib/api';

export default function EmotionDetector({ sessionId, onEmotionUpdate }) {
  const webcamRef = useRef(null);
  const [emotion, setEmotion] = useState({ dominant_emotion: 'neutral', confidence_contribution: 65, emotions: {} });
  const [camError, setCamError] = useState(false);

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;
    try {
      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) return;

      const base64 = screenshot.replace(/^data:image\/\w+;base64,/, '');
      const res = await analyzeEmotion({ frameBase64: base64, sessionId });

      setEmotion(res.data);
      onEmotionUpdate?.(res.data);
    } catch {}
  }, [sessionId]);

  useEffect(() => {
    const interval = setInterval(capture, 2000);
    return () => clearInterval(interval);
  }, [capture]);

  return (
    <div className="
      rounded-2xl overflow-hidden border backdrop-blur-xl
      bg-white/60 border-gray-200
      dark:bg-gray-900/60 dark:border-gray-800
    ">
      {camError ? (
        <div className="h-48 flex items-center justify-center text-sm opacity-60">
          Camera unavailable
        </div>
      ) : (
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          onUserMediaError={() => setCamError(true)}
          className="w-full"
          mirrored
        />
      )}

      <div className="p-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="capitalize font-medium">
            {emotion.dominant_emotion}
          </span>
          <span>{Math.round(emotion.confidence_contribution || 65)}%</span>
        </div>

        <div className="space-y-1">
          {Object.entries(emotion.emotions || {}).slice(0, 4).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 text-xs">
              <span className="w-14 capitalize opacity-60">{k}</span>
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${v}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}