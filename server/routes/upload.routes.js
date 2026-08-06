import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/image', verifyJWT, upload.single('image'), uploadImage);

export default router;
