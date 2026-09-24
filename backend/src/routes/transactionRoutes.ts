import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  transactionValidator,
  transactionUpdateValidator,
} from '../validators/resourceValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', getTransactions);
router.post('/', transactionValidator, createTransaction);
router.put('/:id', transactionUpdateValidator, updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
