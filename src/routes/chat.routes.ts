import { Router } from 'express';
import { chatWithAI } from '../controllers/chat.controller';
import {authenticate} from '../middlewares/auth';
const router = Router();

router.post('/chat',authenticate, chatWithAI);

export default router;
