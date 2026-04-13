import Resume from "../models/Resume.js";
import User from "../models/User.js";


export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const resume = await Resume.findOne({ userId: userId.toString() });
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ msg: "User not found" });

    let finalProfile = {};

    if (resume) {
      finalProfile = resume.toObject();

      if (!finalProfile.avatar) finalProfile.avatar = user.avatar;
      if (!finalProfile.name) finalProfile.name = user.name;
      if (!finalProfile.email) finalProfile.email = user.email;

    } else {
      finalProfile = {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        skills: resume ? resume.detectedSkills : [],
        experience: resume ? resume.experience : [],
        projects: resume ? resume.projects : [],
        education: resume ? resume.education : [],
        summary: resume ? resume.summary : "",
        resumeId: resume ? resume._id : null
      };
    }

    res.json(finalProfile);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;
    
    const resumeUpdates = {
      detectedSkills: updates.skills,
      experience: updates.experience,
      projects: updates.projects,
      education: updates.education,
      summary: updates.summary
    };

    const profile = await Resume.findOneAndUpdate(
      { userId: userId.toString() },
      { $set: resumeUpdates },
      { new: true, upsert: true }
    );

    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};