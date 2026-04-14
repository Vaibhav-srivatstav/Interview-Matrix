import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from "google-auth-library";
import Resume from '../models/Resume.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendTokenResponse = async (user, res) => {
    const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '30d' }
    );
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    let avatarToSend = user.avatar;
    let skillsToSend = user.skills || [];
    try {
        const resume = await Resume.findOne({ userId: user._id });
        if (resume && resume.avatar) {
            avatarToSend = resume.avatar;
        }
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
        return;
    }

    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: avatarToSend,
            skills: skillsToSend
        }
    });
};


export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please login.'
        });

    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Please provide an email" });
        }

        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            console.log("❌ User not found");
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (user.password === "GOOGLE_OAUTH") {
            console.log("❌ Google user trying password login");
            return res.status(400).json({
                success: false,
                message: "Please login using Google"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("❌ Password mismatch");
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        sendTokenResponse(user, res);

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


export const logout = (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    const cookiePath = '/';

    res.clearCookie('token', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: cookiePath
    });
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};


export const getMe = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }


        let avatarToSend = user.avatar;
        try {
            const resume = await Resume.findOne({ userId });
            if (resume && resume.avatar) {
                avatarToSend = resume.avatar;
            }
        } catch (e) { }

        const userData = {
            ...user.toObject(),
            avatar: avatarToSend
        };

        res.status(200).json({
            success: true,
            user: userData
        });

    } catch (err) {
        console.error('GetMe Error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ success: false, msg: "Token missing" });

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                avatar: picture,
                password: "GOOGLE_OAUTH",
            });
        }

        sendTokenResponse(user, res);
    } catch (err) {
        console.error("Google login error:", err);
        res.status(500).json({ success: false, msg: "Google login failed" });
    }
};