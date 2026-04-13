import Question  from '../models/Question.js';

export const getQuestions = async (req, res) => {
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
};

export const addQuestions = async (req, res) => {
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
};

export const addbulkquestions = async (req, res) => {
  try {
    const { questions } = req.body;
    const result = await Question.insertMany(questions, { ordered: false });
    res.json({ inserted: result.length });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};