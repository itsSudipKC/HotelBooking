import { Router } from 'express';
import { getSummary } from '../controllers/adminDashboard.controller.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/dashboard-summary', verifyJWT, authorizeRoles('admin'), getSummary);

export default router;
