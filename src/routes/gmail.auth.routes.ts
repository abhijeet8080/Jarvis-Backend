import { Router } from 'express';
import { googleOAuthRedirect, googleOAuthCallback } from '../controllers/gmail.auth.controller';

const router = Router();

router.get('/login', googleOAuthRedirect);
router.get('/callback', googleOAuthCallback);

export default router;
