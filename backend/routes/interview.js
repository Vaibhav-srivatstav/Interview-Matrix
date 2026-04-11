import express  from 'express';
import axios from 'axios';
import auth  from '../middleware/auth.js';
import Session  from '../models/Session.js';
import Resume  from '../models/Resume.js';
import Question  from '../models/Question.js';
import { generateQuestionsWithAI } from '../utils/aiHelper.js';

const router = express.Router();

// POST /api/interview/start  – create session + pick questions
router.post('/start', auth, async (req, res) => {
  try {
    const { resumeId, techStack, difficulty = 'medium', questionCount = 10 } = req.body;
console.log("✅ START ROUTE HIT");
    let stackToUse = techStack;
    let resumeDoc = null;

    if (resumeId) {
      resumeDoc = await Resume.findOne({ _id: resumeId, userId: req.user._id });
      if (!resumeDoc) return res.status(404).json({ message: 'Resume not found' });
      stackToUse = resumeDoc.detectedTechStack;
    }

    if (!stackToUse || !stackToUse.length)
      return res.status(400).json({ message: 'No tech stack provided or detected' });

    // Fetch questions from DB for detected stack
    let questions = await Question.find({
      category: { $in: stackToUse },
      difficulty,
    }).limit(questionCount);

    // If not enough questions, generate with AI
    if (questions.length < questionCount) {
      const aiQuestions = await generateQuestionsWithAI(
        stackToUse,
        difficulty,
        questionCount - questions.length,
        resumeDoc?.rawText
      );
      questions = [...questions, ...aiQuestions];
    }

    // Shuffle questions
    questions = questions.sort(() => Math.random() - 0.5).slice(0, questionCount);

    const session = await Session.create({
      userId: req.user._id,
      resumeId: resumeDoc?._id,
      techStack: stackToUse,
      status: 'active',
      startedAt: new Date(),
    });

    res.status(201).json({
      sessionId: session._id,
      questions: questions.map((q) => ({
        id: q._id,
        text: q.text,
        category: q.category,
        difficulty: q.difficulty,
      })),
      techStack: stackToUse,
    });
  } catch (err) {
    console.error('Start interview error:', err);
    res.status(500).json({ message: 'Failed to start interview', error: err.message });
  }
});

// POST /api/interview/:sessionId/answer  – submit an answer
router.post('/:sessionId/answer', auth, async (req, res) => {
  try {
    const { questionId, questionText, answerText, emotionSnapshots, voiceMetrics } = req.body;

    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
      status: 'active',
    });
    if (!session) return res.status(404).json({ message: 'Session not found or not active' });

    // Call ML service for NLP scoring
    let nlpScore = 70; // default fallback
    let keywordMatchScore = 60;
    let aiFeedback = '';

    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/analyze_answer`, {
        question: questionText,
        answer: answerText,
      });
      nlpScore = mlResponse.data.nlp_score || 70;
      keywordMatchScore = mlResponse.data.keyword_score || 60;
      aiFeedback = mlResponse.data.feedback || '';
    } catch (mlErr) {
      console.warn('ML service unavailable, using fallback scores');
    }

    // Calculate emotion-based confidence from snapshots
    const avgConfidence = emotionSnapshots?.length
      ? emotionSnapshots.reduce((sum, s) => sum + (s.confidence_contribution || 0), 0) /
        emotionSnapshots.length
      : 65;

    const dominantEmotion = emotionSnapshots?.length
      ? getMostFrequentEmotion(emotionSnapshots)
      : 'neutral';

    // Weighted overall score per answer
    const overallScore = Math.round(
      nlpScore * 0.5 +
        keywordMatchScore * 0.2 +
        avgConfidence * 0.2 +
        (voiceMetrics?.clarity || 65) * 0.1
    );

    session.answers.push({
      questionId,
      questionText,
      answerText,
      nlpScore,
      keywordMatchScore,
      emotionSummary: {
        dominant: dominantEmotion,
        avgConfidence,
        snapshots: emotionSnapshots || [],
      },
      voiceMetrics: voiceMetrics || {},
      overallScore,
      aiFeedback,
    });

    await session.save();

    res.json({
      message: 'Answer saved',
      scores: { nlpScore, keywordMatchScore, avgConfidence, overallScore },
      aiFeedback,
    });
  } catch (err) {
    console.error('Answer submission error:', err);
    res.status(500).json({ message: 'Failed to save answer' });
  }
});

// POST /api/interview/:sessionId/complete
router.post('/:sessionId/complete', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'completed';
    session.completedAt = new Date();
    session.duration = Math.round((session.completedAt - session.startedAt) / 1000);

    // Final scores
    const totalAnswers = session.answers.length;
    if (totalAnswers > 0) {
      session.overallPerformanceScore = Math.round(
        session.answers.reduce((s, a) => s + a.overallScore, 0) / totalAnswers
      );
      session.overallConfidenceScore = session.calculateConfidence();
    }

    // Generate AI final feedback
    try {
      const { generateFinalFeedback } = require('../utils/aiHelper');
      session.aiFinalFeedback = await generateFinalFeedback(session);
    } catch (e) {
      session.aiFinalFeedback = 'Interview completed successfully.';
    }

    await session.save();

    res.json({
      message: 'Interview completed',
      results: {
        sessionId: session._id,
        overallConfidenceScore: session.overallConfidenceScore,
        overallPerformanceScore: session.overallPerformanceScore,
        duration: session.duration,
        totalQuestions: totalAnswers,
        aiFinalFeedback: session.aiFinalFeedback,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to complete session' });
  }
});

// GET /api/interview/sessions  – user's session history
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .select('-answers.emotionSummary.snapshots')
      .sort('-createdAt')
      .limit(20);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/interview/:sessionId  – full session result
router.get('/:sessionId', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
    }).populate('resumeId', 'detectedTechStack detectedSkills');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

function getMostFrequentEmotion(snapshots) {
  const counts = {};
  snapshots.forEach((s) => {
    const e = s.dominant_emotion || 'neutral';
    counts[e] = (counts[e] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
}

export default router;
