import Question from '../models/Question.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Resume from '../models/Resume.js';

export const getQuestions = async (req, res) => {
  try {
    const [totalUsers, totalSessions, totalQuestions, completedSessions] = await Promise.all([
      User.countDocuments(),
      Session.countDocuments(),
      Question.countDocuments(),
      Session.countDocuments({ status: 'completed' }),
    ]);

    // Avg confidence across all completed sessions
    const avgResult = await Session.aggregate([
      { $match: { status: 'completed', overallConfidenceScore: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$overallConfidenceScore' } } },
    ]);
    const avgConfidence = Math.round(avgResult[0]?.avg || 0);

    // Sessions per day last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailySessions = await Session.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Questions by category
    const questionsByCategory = await Question.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent signups (last 5)
    const recentUsers = await User.find()
      .select('name email createdAt isAdmin')
      .sort('-createdAt')
      .limit(5);

    res.json({
      totalUsers,
      totalSessions,
      totalQuestions,
      completedSessions,
      avgConfidence,
      dailySessions,
      questionsByCategory,
      recentUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export const getstats = async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (search) filter.text = { $regex: search, $options: 'i' };

    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ questions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

export const postquestions = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ question });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
export const putquestions = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ question });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export const deletequestions = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

export const bulkquestions =async (req, res) => {
  try {
    const { questions } = req.body;
    const result = await Question.insertMany(questions, { ordered: false });
    res.json({ inserted: result.length });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


export const getuser = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Attach session counts
    const userIds = users.map((u) => u._id);
    const sessionCounts = await Session.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
    ]);
    const countMap = {};
    sessionCounts.forEach((s) => { countMap[s._id] = s; });

    const enriched = users.map((u) => ({
      ...u.toObject(),
      sessionCount:    countMap[u._id]?.count     || 0,
      completedCount:  countMap[u._id]?.completed || 0,
    }));

    res.json({ users: enriched, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}


export const getuserid =async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sessions = await Session.find({ userId: req.params.id })
      .select('-answers.emotionSummary.snapshots')
      .sort('-createdAt')
      .limit(10);

    const resume = await Resume.findOne({ userId: req.params.id }).select('-rawText');

    res.json({ user, sessions, resume });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}
export const updateuser =async (req, res) => {
  try {
    const { isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin },
      { new: true }
    ).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

export const deleteusers =async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await User.findByIdAndDelete(req.params.id);
    await Session.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

export const  getreport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to)   dateFilter.$lte = new Date(to);

    const sessionFilter = Object.keys(dateFilter).length
      ? { createdAt: dateFilter }
      : {};

    const sessions = await Session.find({ ...sessionFilter, status: 'completed' })
      .populate('userId', 'name email')
      .select('userId techStack overallConfidenceScore overallPerformanceScore duration createdAt answers')
      .sort('-createdAt')
      .limit(100);

    // Top performers
    const topPerformers = await Session.aggregate([
      { $match: { status: 'completed', overallPerformanceScore: { $gt: 0 } } },
      { $group: { _id: '$userId', avgScore: { $avg: '$overallPerformanceScore' }, sessions: { $sum: 1 } } },
      { $sort: { avgScore: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { 'user.name': 1, 'user.email': 1, avgScore: 1, sessions: 1 } },
    ]);

    // Category performance
    const categoryPerf = await Session.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$answers' },
      { $group: { _id: '$answers.questionId', avgScore: { $avg: '$answers.overallScore' } } },
    ]);

    // Emotion distribution across all sessions
    const emotionDist = await Session.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$answers' },
      { $group: { _id: '$answers.emotionSummary.dominant', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Daily completions
    const daily = await Session.aggregate([
      { $match: { status: 'completed', ...sessionFilter } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, avgScore: { $avg: '$overallPerformanceScore' } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ sessions, topPerformers, emotionDist, daily });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}