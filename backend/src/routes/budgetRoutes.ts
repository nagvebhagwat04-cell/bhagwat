import { Router } from 'express';
import { getBudget, upsertBudget } from '../controllers/budgetController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { budgetValidator } from '../validators/resourceValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', getBudget);
router.post('/', budgetValidator, upsertBudget);

export default router;
