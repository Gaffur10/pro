import express from 'express';
import { 
  runClustering, 
  getClusteringResults, 
  getClusteringStats, 
  clearClusteringResults 
} from '../controllers/clusteringController.js';
import { getElbowAnalysis } from '../controllers/elbowController.js';
import { verifyToken, verifyTeacher } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get elbow analysis
router.get('/elbow', getElbowAnalysis);

// Get clustering results with pagination and filtering
router.get('/results', getClusteringResults);

// Get clustering statistics
router.get('/stats', getClusteringStats);



// Run clustering algorithm (requires teacher/admin role)
router.post('/run', verifyTeacher, runClustering);

// Clear clustering results (requires teacher/admin role)
router.delete('/clear', verifyTeacher, clearClusteringResults);

export default router;
