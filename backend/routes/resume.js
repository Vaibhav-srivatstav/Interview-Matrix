import express  from 'express';
import multer  from 'multer';
import path  from 'path';
import fs  from 'fs';
import pdfParse  from 'pdf-parse';
import mammoth  from 'mammoth';
import auth  from '../middleware/auth.js';
import Resume  from '../models/Resume.js';
import { detectTechStack, extractResumeData }  from '../utils/resumeParser.js';

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/resumes';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF and Word documents are allowed'));
  },
});

// POST /api/resume/upload
router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let rawText = '';

    if (ext === '.pdf') {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      rawText = data.text;
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ path: filePath });
      rawText = result.value;
    }

    if (!rawText.trim()) return res.status(400).json({ message: 'Could not extract text from file' });

    // Parse and detect tech stack
    const techStack = detectTechStack(rawText);
    const resumeData = extractResumeData(rawText);

    const resume = await Resume.create({
      userId: req.user._id,
      originalName: req.file.originalname,
      filePath,
      rawText,
      detectedSkills: resumeData.skills,
      detectedTechStack: techStack,
      experience: resumeData.experience,
      education: resumeData.education,
      projects: resumeData.projects,
      summary: resumeData.summary,
    });

    res.status(201).json({
      message: 'Resume uploaded and analyzed successfully',
      resume: {
        id: resume._id,
        detectedTechStack: resume.detectedTechStack,
        detectedSkills: resume.detectedSkills,
        experience: resume.experience,
        education: resume.education,
        projects: resume.projects,
      },
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// GET /api/resume/my
router.get('/my', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('-rawText')
      .sort('-createdAt');
    res.json({ resumes });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/resume/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id }).select('-rawText');
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json({ resume });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
