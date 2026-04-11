import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default:null },
    avatar: { type: String },
    googleId: { type: String, default: null },
    skills: {type: [String], default: []},
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);