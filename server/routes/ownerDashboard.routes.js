import { Router } from 'express';
import { getSummary } from '../controllers/ownerDashboard.controller.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/dashboard-summary', verifyJWT, authorizeRoles('owner'), getSummary);

export default router;
