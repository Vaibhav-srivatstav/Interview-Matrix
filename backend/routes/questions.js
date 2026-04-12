import express  from 'express';
import auth from '../middleware/auth.js';
import Question  from '../models/Question.js';

const router = express.Router();

// GET /api/questions?category=react&difficulty=medium
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 5, category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    // IMPORTANT: Use aggregate, not find
    const questions = await Question.aggregate([
      { $match: filter }, 
      { $sample: { size: parseInt(limit) } } 
    ]);

    res.json({ questions });
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
