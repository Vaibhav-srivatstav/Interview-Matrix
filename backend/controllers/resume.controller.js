import Resume from "../models/Resume.js";
import { detectTechStack, extractResumeData } from "../utils/resumeParser.js";
import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import path from "path";

export const uploadResume = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    let rawText = "";

    // ✅ Extract text
    if (ext === ".pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      rawText = data.text;
    } else {
      const result = await mammoth.extractRawText({ path: filePath });
      rawText = result.value;
    }

    // ✅ Parse resume
    const techStack = detectTechStack(rawText);
    const resumeData = extractResumeData(rawText);

    // ✅ Normalize data (VERY IMPORTANT)
    const normalizedData = {
      name: resumeData.name || "",
      email: resumeData.email || "",
      phone: resumeData.phone || "",
      skills: resumeData.skills || [],
      experience: resumeData.experience || [],
      education: resumeData.education || [],
      projects: resumeData.projects || [],
      summary: resumeData.summary || "",
    };

    // ✅ Save resume
    const resume = await Resume.create({
      userId,
      originalName: req.file.originalname,
      filePath,
      rawText,
      detectedSkills: normalizedData.skills,
      detectedTechStack: techStack,
      experience: normalizedData.experience,
      education: normalizedData.education,
      projects: normalizedData.projects,
      summary: normalizedData.summary,
    });

    // ✅ Update or create profile
    const profile = await Resume.findOneAndUpdate(
      { userId },
      {
        $set: {
          name: normalizedData.name,
          email: normalizedData.email,
          phone: normalizedData.phone,
          skills: normalizedData.skills,
          experience: normalizedData.experience,
          education: normalizedData.education,
          projects: normalizedData.projects,
          summary: normalizedData.summary,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    // ✅ RESPONSE (Frontend-safe)
    return res.status(200).json({
      success: true,
      message: "Resume uploaded and analyzed successfully",
      data: {
        resume,
        profile,
      },
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
      error: err.message,
    });
  }
};