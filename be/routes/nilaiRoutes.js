import express from 'express';
import { 
  getAllNilai, 
  getNilaiById, 
  createNilai, 
  updateNilai, 
  deleteNilai,
  getNilaiStats
} from '../controllers/nilaiController.js';
import { verifyToken, verifyTeacher } from '../middleware/auth.js';

const router = express.Router();

import { getDistinctTahunAjaran } from '../controllers/nilaiController.js';

// All routes require authentication
router.use(verifyToken);

// Get all nilai with pagination and search
router.get('/', getAllNilai);

// Get nilai statistics


// New route to get distinct tahun ajaran
router.get('/tahun-ajaran', getDistinctTahunAjaran);

// Get single nilai
router.get('/:id', getNilaiById);

// Create new nilai (requires teacher/admin role)
router.post('/', verifyTeacher, createNilai);

// Update nilai (requires teacher/admin role)
router.put('/:id', verifyTeacher, updateNilai);

// Delete nilai (requires teacher/admin role)
router.delete('/:id', verifyTeacher, deleteNilai);

// Get nilai statistics
router.get('/stats', getNilaiStats);


export default router; 