import CandidateProfile from "../models/CandidateProfile.js";
import User from "../models/User.js";


export const getProfile = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;;

    const profile = await CandidateProfile.findOne({ userId });
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ msg: "User not found" });

    let finalProfile = {};

    if (profile) {
        finalProfile = profile.toObject(); 
        
        if (!finalProfile.avatar) {
            finalProfile.avatar = user.avatar;
        }
        if (!finalProfile.name) finalProfile.name = user.name;
        if (!finalProfile.email) finalProfile.email = user.email;

    } else {
        finalProfile = {
            userId: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar, // Google Avatar
            skills: [],
            experience: [],
            projects: [],
            education: []
        };
    }

    res.json(finalProfile);

  } catch (err) {
    res.status(500).send("Server Error");
  }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const updates = req.body;
        
        const profile = await CandidateProfile.findOneAndUpdate(
            { userId },
            { $set: updates },
            { new: true, upsert: true } 
        );

        res.json({ success: true, profile });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};