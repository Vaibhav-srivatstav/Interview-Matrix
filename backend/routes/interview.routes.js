import express from 'express';
import auth from '../middleware/auth.js';
import { getAnswer, getsession, getsessionid, sessioncomplete, startInterview } from '../controllers/interview.controller.js';

const router = express.Router();


router.post('/start', auth, startInterview);
router.post('/:sessionId/answer', auth, getAnswer);
router.post('/:sessionId/complete', auth, sessioncomplete);
router.get('/sessions', auth, getsession);
router.get('/:sessionId', auth, getsessionid);

export default router;