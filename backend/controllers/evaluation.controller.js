import Session from '../models/Session.js';
import axios from 'axios';


/* 🔥 Reusable ML caller with retry + logging */
const callML = async (url, data, timeout = 30000) => {
  try {
    console.log("➡️ Calling ML:", url);

    const res = await axios.post(url, data, { timeout });

    console.log("✅ ML success:", url);
    return res;

  } catch (err) {
    console.error("❌ ML error (1st try):", err.message);

    // retry once (important for Render cold start)
    try {
      console.log("🔁 Retrying ML:", url);

      const res = await axios.post(url, data, { timeout });

      console.log("✅ ML success (retry):", url);
      return res;

    } catch (err2) {
      console.error("❌ ML failed again:", err2.message);
      throw err2;
    }
  }
};


/* ================= EMOTION ================= */

export const postemotion =  async (req, res) => {
  try {
    const { frameBase64, sessionId } = req.body;
    if (!frameBase64) return res.status(400).json({ message: 'No frame data' });

    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/analyze_emotion`,
      { frame: frameBase64 },
      { timeout: 30000 }
    );

    const emotionData = mlResponse.data;
    if (sessionId) req.app.get('io').to(sessionId).emit('emotion_update', emotionData);
    res.json(emotionData);

  } catch (err) {
    // Log but never return 500 — return fallback so interview continues
    console.error('[Emotion] ML error:', err.message);
    res.json({
      dominant_emotion: 'neutral',
      emotions: { neutral: 100, happy: 0, sad: 0, angry: 0, fear: 0, surprise: 0, disgust: 0 },
      confidence_contribution: 65,
      fallback: true,
      reason: err.message,
    });
  }
};


/* ================= VOICE ================= */

export const postvoice = async (req, res) => {
  try {
    const { audioBase64 } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ message: 'No audio data' });
    }

    console.log("🎤 Audio size:", audioBase64.length);

    const mlResponse = await callML(
      `${process.env.ML_SERVICE_URL}/analyze_voice`,
      { audio: audioBase64 },
      30000   // 🔥 IMPORTANT (voice is slow)
    );

    res.json(mlResponse.data);

  } catch (err) {
    console.error("VOICE FALLBACK:", err.message);

    res.json({
      transcript: '',
      speech_rate: 130,
      pause_count: 2,
      filler_words: 1,
      clarity: 70,
      error: 'Voice analysis unavailable',
    });
  }
};

export const getReport = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const report = buildConfidenceReport(session);
    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

function buildConfidenceReport(session) {
  const answers = session.answers || [];

  const emotionBreakdown = {};
  answers.forEach((a) => {
    const e = a.emotionSummary?.dominant || 'neutral';
    emotionBreakdown[e] = (emotionBreakdown[e] || 0) + 1;
  });

  const avgNlp = answers.length
    ? answers.reduce((s, a) => s + (a.nlpScore || 0), 0) / answers.length
    : 0;
  const avgVoice = answers.length
    ? answers.reduce((s, a) => s + (a.voiceMetrics?.clarity || 0), 0) / answers.length
    : 0;
  const avgEmotion = answers.length
    ? answers.reduce((s, a) => s + (a.emotionSummary?.avgConfidence || 0), 0) / answers.length
    : 0;

  return {
    sessionId: session._id,
    overallConfidence: session.overallConfidenceScore,
    overallPerformance: session.overallPerformanceScore,
    breakdown: {
      nlpScore: Math.round(avgNlp),
      voiceClarity: Math.round(avgVoice),
      emotionConfidence: Math.round(avgEmotion),
    },
    emotionBreakdown,
    perQuestionScores: answers.map((a, i) => ({
      question: i + 1,
      score: a.overallScore,
      emotion: a.emotionSummary?.dominant,
      feedback: a.aiFeedback,
    })),
    finalFeedback: session.aiFinalFeedback,
    duration: session.duration,
    techStack: session.techStack,
  };
}