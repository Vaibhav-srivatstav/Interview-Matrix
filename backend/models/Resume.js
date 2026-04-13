import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: String,
    name: String,
    email: String,
    phone: String,
    location: String,
    avatar: String,
    filePath: String,
    rawText: String,
    detectedSkills: [{ type: String }],
    detectedTechStack: [{ type: String }], // e.g. ['frontend', 'react', 'html']
    experience: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        year: String,
      },
    ],
    projects: [
      {
        name: String,
        tech: [String],
        description: String,
      },
    ],
    summary: String,
  },
  { timestamps: true }
);

// module.exports = mongoose.model('Resume', resumeSchema);
export default mongoose.model('Resume', resumeSchema);
