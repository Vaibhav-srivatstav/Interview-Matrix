import Session from '../models/Session.js';
import Resume from '../models/Resume.js';
import Question from '../models/Question.js';
import axios from 'axios';
import { generateFinalFeedback } from '../utils/aiHelper.js';

export const startInterview = async (req, res) => {
  try {
    const { resumeId, techStack, difficulty = 'medium', questionCount = 5 } = req.body;
    let stackToUse = techStack || [];
    let resumeDoc = null;

    if (resumeId) {
      resumeDoc = await Resume.findOne({ _id: resumeId, userId: req.user._id });
      if (!resumeDoc) return res.status(404).json({ message: 'Resume not found' });
      // Use detected stack if available, otherwise fallback to provided techStack
      stackToUse = resumeDoc.detectedTechStack && resumeDoc.detectedTechStack.length > 0 
        ? resumeDoc.detectedTechStack 
        : stackToUse;
    }

    if (!stackToUse || stackToUse.length === 0) {
      return res.status(400).json({ message: 'No tech stack provided or detected' });
    }

    // 1. RANDOM SELECTION: Using MongoDB $sample ensures variety every time
    // We normalize the category names to lowercase to match typical DB entries
    const normalizedStack = stackToUse.map(s => s.toLowerCase());

    let questions = await Question.aggregate([
      {
        $match: {
          category: { $in: normalizedStack },
          difficulty: difficulty.toLowerCase()
        }
      },
      { $sample: { size: parseInt(questionCount) } }
    ]);

    // 2. SAFETY FALLBACK: If DB has no matches for specific difficulty, try without difficulty filter
    if (questions.length === 0) {
      questions = await Question.aggregate([
        { $match: { category: { $in: normalizedStack } } },
        { $sample: { size: parseInt(questionCount) } }
      ]);
    }

    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found in database for these categories." });
    }

    // Create the session
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
};

export const getAnswer =async (req, res) => {
  try {
    const { questionId, questionText, answerText, emotionSnapshots, voiceMetrics } = req.body;

    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
      status: 'active',
    });
    if (!session) return res.status(404).json({ message: 'Session not found or not active' });

    let nlpScore = 70; 
    let keywordMatchScore = 60;
    let aiFeedback = '';

    // NLP Analysis via ML Service
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

    // Confidence Calculation
    const avgConfidence = emotionSnapshots?.length
      ? emotionSnapshots.reduce((sum, s) => sum + (s.confidence_contribution || 0), 0) / emotionSnapshots.length
      : 65;

    const dominantEmotion = emotionSnapshots?.length
      ? getMostFrequentEmotion(emotionSnapshots)
      : 'neutral';

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
};

export const sessioncomplete = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // 1. Mark as completed
    session.status = 'completed';
    session.completedAt = new Date();
    session.duration = Math.round((session.completedAt - session.startedAt) / 1000);

    // 2. Calculate Final Scores (Crucial for Graphs)
    const totalAnswers = session.answers.length;
    if (totalAnswers > 0) {
      // Average Performance
      session.overallPerformanceScore = Math.round(
        session.answers.reduce((s, a) => s + (a.overallScore || 0), 0) / totalAnswers
      );
      
      // Average Confidence
      session.overallConfidenceScore = Math.round(
        session.answers.reduce((s, a) => s + (a.emotionSummary?.avgConfidence || 0), 0) / totalAnswers
      );
    }

    // 3. Generate AI Feedback (Now it uses the REAL scores calculated above)
    try {
      // Pass the updated session object
      session.aiFinalFeedback = await generateFinalFeedback(session);
    } catch (e) {
      console.error("AI Feedback Error:", e.message);
      session.aiFinalFeedback = "Interview completed. Great effort on your technical session!";
    }

    // 4. SAVE EVERYTHING TO DB
    await session.save();

    res.json({
      message: 'Interview completed',
      results: session // Send the saved session back
    });
  } catch (err) {
    console.error('Completion error:', err);
    res.status(500).json({ message: 'Failed to save results' });
  }
};

export const getsession =async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .select('-answers.emotionSummary.snapshots')
      .sort('-createdAt')
      .limit(20);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getsessionid = async (req, res) => {
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
};

function getMostFrequentEmotion(snapshots) {
  const counts = {};
  snapshots.forEach((s) => {
    const e = s.dominant_emotion || 'neutral';
    counts[e] = (counts[e] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
}