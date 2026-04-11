import mongoose from 'mongoose';

const CandidateProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: String,
    email: String,
    phone: String,
    location: String,
    avatar: String,
    skills: [String],
    atsScore: { type: Number, default: 0 }, 
    missingKeywords: [String],
    improvements: [String],
    
    experience: [{
        title: String,
        company: String,
        duration: String,
        description: String
    }],
    projects: [{
        name: String,
        description: String,
        technologies: [String]
    }],
    education: [{
        degree: String,
        school: String,
        year: String
    }],
    summary: String
});

export default mongoose.model('CandidateProfile', CandidateProfileSchema);