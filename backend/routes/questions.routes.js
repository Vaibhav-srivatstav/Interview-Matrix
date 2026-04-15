import express  from 'express';
import auth from '../middleware/auth.js';
import { adminAuth } from '../middleware/auth.js';
import { getQuestions, addQuestions , addbulkquestions} from '../controllers/questions.controller.js';

const router = express.Router();

router.get('/', auth, getQuestions);
router.post('/', auth , adminAuth, addQuestions);
router.post('/bulk-seed', auth, addbulkquestions);

export default router;
