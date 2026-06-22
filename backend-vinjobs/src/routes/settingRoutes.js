import express from 'express';
import settingController from '../controllers/settingController.js';

const router = express.Router();

router.get('/', settingController.getSettings);

export default router;
