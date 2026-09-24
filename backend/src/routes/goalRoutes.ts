import { Router } from 'express';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goalController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  goalValidator,
  goalUpdateValidator,
} from '../validators/resourceValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', getGoals);
router.post('/', goalValidator, createGoal);
router.put('/:id', goalUpdateValidator, updateGoal);
router.delete('/:id', deleteGoal);

export default router;
