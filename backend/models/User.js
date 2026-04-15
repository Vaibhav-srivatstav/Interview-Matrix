import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    avatar: { type: String },
    googleId: { type: String, default: null },
    skills: { type: [String], default: [] },
    sessions:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);