import { Router } from 'express';
import userAuthRoutes from './userAuth.routes.js';
import ownerAuthRoutes from './ownerAuth.routes.js';
import adminAuthRoutes from './adminAuth.routes.js';

const router = Router();

router.use('/user', userAuthRoutes);
router.use('/owner', ownerAuthRoutes);
router.use('/admin', adminAuthRoutes);

export default router;
