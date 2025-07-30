import express from 'express';
import { 
  getDashboardStats, 
  getChartData, 
  getQuickStats 
} from '../controllers/dashboardController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get chart data
router.get('/charts', getChartData);

// Get quick stats
router.get('/quick-stats', getQuickStats);

export default router; 