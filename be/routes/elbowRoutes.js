import express from 'express';
import { getElbowAnalysis } from '../controllers/elbowController.js';

const router = express.Router();

router.get('/elbow-analysis', getElbowAnalysis);

export default router;
