import express from 'express';
import { register, login, logout, getMe, googleLogin } from '../controllers/auth.controller.js';
import auth from '../middleware/auth.js'; // We will update this next

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', auth, getMe); // Used to check if user is still logged in
router.post('/google', googleLogin);

export default router;