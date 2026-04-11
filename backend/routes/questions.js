import express  from 'express';
import auth from '../middleware/auth.js';
import Question  from '../models/Question.js';

const router = express.Router();

// GET /api/questions?category=react&difficulty=medium
router.get('/', auth, async (req, res) => {
  try {
    const { category, difficulty, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = { $in: category.split(',') };
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter).limit(Number(limit));
    res.json({ questions, count: questions.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/questions  – add question (admin/seeding)
router.post('/', auth, async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ question });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/questions/bulk-seed  – seed many questions
router.post('/bulk-seed', auth, async (req, res) => {
  try {
    const { questions } = req.body;
    const result = await Question.insertMany(questions, { ordered: false });
    res.json({ inserted: result.length });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
