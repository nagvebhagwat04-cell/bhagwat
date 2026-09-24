import { Router } from 'express';
import {
  calculateEMIHandler,
  calculateGoalHandler,
  calculateBudgetHandler,
  calculateDTIHandler,
  calculateEmergencyFundHandler,
} from '../controllers/calculationController.js';
import {
  emiCalculationValidator,
  goalCalculationValidator,
} from '../validators/resourceValidators.js';

const router = Router();

// Calculation endpoints are accessible publicly or authenticated as pure math utilities
router.post('/emi', emiCalculationValidator, calculateEMIHandler);
router.post('/goal', goalCalculationValidator, calculateGoalHandler);
router.post('/budget', calculateBudgetHandler);
router.post('/dti', calculateDTIHandler);
router.post('/emergency', calculateEmergencyFundHandler);

export default router;
