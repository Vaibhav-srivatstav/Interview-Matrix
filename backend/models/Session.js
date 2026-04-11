import mongoose  from 'mongoose';

const emotionSnapshotSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  dominant_emotion: String,
  emotions: {
    happy: Number,
    sad: Number,
    angry: Number,
    fear: Number,
    surprise: Number,
    neutral: Number,
    disgust: Number,
  },
  confidence_contribution: Number,
});

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  questionText: String,
  answerText: String,
  audioUrl: String,
  nlpScore: { type: Number, default: 0 },
  keywordMatchScore: { type: Number, default: 0 },
  emotionSummary: {
    dominant: String,
    avgConfidence: Number,
    snapshots: [emotionSnapshotSchema],
  },
  voiceMetrics: {
    speechRate: Number,
    pauseCount: Number,
    fillerWords: Number,
    clarity: Number,
  },
  overallScore: { type: Number, default: 0 },
  aiFeedback: String,
});

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    techStack: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'abandoned'],
      default: 'pending',
    },
    answers: [answerSchema],
    overallConfidenceScore: { type: Number, default: 0 },
    overallPerformanceScore: { type: Number, default: 0 },
    emotionTimeline: [emotionSnapshotSchema],
    aiFinalFeedback: String,
    duration: { type: Number, default: 0 }, // seconds
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

// Calculate overall confidence score before saving
sessionSchema.methods.calculateConfidence = function () {
  if (!this.answers.length) return 0;

  const weights = { emotion: 0.3, voice: 0.2, nlp: 0.5 };

  const avgEmotion =
    this.answers.reduce((sum, a) => sum + (a.emotionSummary?.avgConfidence || 0), 0) /
    this.answers.length;

  const avgVoice =
    this.answers.reduce((sum, a) => sum + (a.voiceMetrics?.clarity || 0), 0) /
    this.answers.length;

  const avgNlp =
    this.answers.reduce((sum, a) => sum + (a.nlpScore || 0), 0) / this.answers.length;

  return Math.round(
    avgEmotion * weights.emotion + avgVoice * weights.voice + avgNlp * weights.nlp
  );
};

// module.exports = mongoose.model('Session', sessionSchema);
export default mongoose.model('Session', sessionSchema);