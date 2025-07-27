import express from 'express';
import { uploadSingle, deleteFile, getFileInfo } from '../controllers/uploadController.js';

const router = express.Router();

// Placeholder routes - will be implemented in next phase
router.post('/single', authenticateToken, (req, res) => {
  res.json({ message: 'File upload routes - coming soon' });
}
)
// File upload routes
router.post('/single', uploadSingle);
router.get('/:filename', getFileInfo);
router.delete('/:filename', deleteFile);

export default router;