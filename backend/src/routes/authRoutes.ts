import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidators.js';

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

export default router;
