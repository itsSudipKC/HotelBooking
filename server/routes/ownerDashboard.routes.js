// import { Router } from 'express';
// import { getSummary } from '../controllers/ownerDashboard.controller.js';
// import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

// const router = Router();

// router.get('/dashboard-summary', verifyJWT, authorizeRoles('owner'), getSummary);

// export default router;


import { Router } from 'express';
import { getSummary, getEarnings } from '../controllers/ownerDashboard.controller.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/dashboard-summary', verifyJWT, authorizeRoles('owner'), getSummary);
router.get('/dashboard-earnings', verifyJWT, authorizeRoles('owner'), getEarnings);

export default router;