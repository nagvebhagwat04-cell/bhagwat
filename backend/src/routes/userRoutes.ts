import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { profileValidator } from '../validators/authValidators.js';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, profileValidator, updateProfile);

export default router;
