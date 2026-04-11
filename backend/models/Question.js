import mongoose  from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'frontend', 'backend', 'fullstack', 'mern', 'html', 'css',
        'javascript', 'react', 'nodejs', 'mongodb', 'python',
        'data_structures', 'system_design', 'behavioral', 'hr',
      ],
      required: true,
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    expectedKeywords: [{ type: String }],
    sampleAnswer: { type: String },
    followUps: [{ type: String }],
    isAIGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// module.exports = mongoose.model('Question', questionSchema);
export default mongoose.model('Question', questionSchema);
