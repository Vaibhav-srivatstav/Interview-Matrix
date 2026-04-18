import express from 'express';
import axios from 'axios';
import auth from '../middleware/auth.js';
import { getReport, postemotion, postvoice } from '../controllers/evaluation.controller.js';

const router = express.Router();

router.post('/emotion', auth, postemotion);
router.post('/voice', auth, postvoice);
router.get('/session/:id/report', auth, getReport);


export default router;