import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Placeholder routes - will be implemented in next phase
router.get('/', authenticateToken, authorizeRoles('company_admin'), (req, res) => {
  res.json({ message: 'User management routes - coming soon' });
});

export default router;