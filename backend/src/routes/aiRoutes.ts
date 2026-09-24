import { Router } from 'express';
import { chatHandler, getHistoryHandler, clearHistoryHandler } from '../controllers/aiController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { chatValidator } from '../validators/resourceValidators.js';

const router = Router();

router.use(authenticate);

router.post('/chat', chatValidator, chatHandler);
router.get('/history', getHistoryHandler);
router.delete('/history', clearHistoryHandler);

export default router;
