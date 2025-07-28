import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { uploadSingle, deleteFile, getFileInfo } from '../controllers/uploadController.js';

const router = express.Router();

// @route   POST /api/upload/single
// @desc    Upload single file
// @access  Private
router.post('/single', authenticateToken, uploadSingle);

// @route   DELETE /api/upload/:filename
// @desc    Delete uploaded file
// @access  Private
router.delete('/:filename', authenticateToken, deleteFile);

// @route   GET /api/upload/:filename
// @desc    Get file information
// @access  Private
router.get('/:filename', authenticateToken, getFileInfo);

export default router;