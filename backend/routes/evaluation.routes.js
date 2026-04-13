import express from 'express';
import axios from 'axios';
import auth from '../middleware/auth.js';
import { getReport, postemotion, postvoice } from '../controllers/evaluation.controller.js';

const router = express.Router();

// POST /api/evaluation/emotion  – receive frame, call ML, return emotion
router.post('/emotion', auth, postemotion);

// POST /api/evaluation/voice  – analyze voice/speech metrics
router.post('/voice', auth, postvoice);

// GET /api/evaluation/session/:id/report  – full confidence report
router.get('/session/:id/report', auth, getReport);


export default router;