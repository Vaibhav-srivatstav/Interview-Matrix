import express from 'express';
import axios from 'axios';
import auth from '../middleware/auth.js';
import Session from '../models/Session.js';

const router = express.Router();

// POST /api/evaluation/emotion  – receive frame, call ML, return emotion
router.post('/emotion', auth, async (req, res) => {
  try {
    const { frameBase64, sessionId } = req.body;
    if (!frameBase64) return res.status(400).json({ message: 'No frame data' });

    // Forward to Flask ML service
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/analyze_emotion`,
      { frame: frameBase64 },
      { timeout: 3000 }
    );

    const emotionData = mlResponse.data;

    // Broadcast via socket.io if sessionId provided
    if (sessionId) {
      const io = req.app.get('io');
      io.to(sessionId).emit('emotion_update', emotionData);
    }

    res.json(emotionData);
  } catch (err) {
    // Graceful fallback — don't break the interview
    res.json({
      dominant_emotion: 'neutral',
      emotions: { neutral: 1.0 },
      confidence_contribution: 65,
      error: 'ML service unavailable',
    });
  }
});

// POST /api/evaluation/voice  – analyze voice/speech metrics
router.post('/voice', auth, async (req, res) => {
  try {
    const { audioBase64, sessionId } = req.body;

    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/analyze_voice`,
      { audio: audioBase64 },
      { timeout: 10000 }
    );

    res.json(mlResponse.data);
  } catch (err) {
    res.json({
      transcript: '',
      speech_rate: 130,
      pause_count: 2,
      filler_words: 1,
      clarity: 70,
      error: 'Voice analysis unavailable',
    });
  }
});

// GET /api/evaluation/session/:id/report  – full confidence report
router.get('/session/:id/report', auth, async (req, res) => {
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
});

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

export default router;