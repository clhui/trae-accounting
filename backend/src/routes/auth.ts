import { Router } from 'express';
import { signUp, signIn, refreshToken, getProfile } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;