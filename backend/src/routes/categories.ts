import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categories';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All category routes require authentication
router.use(authenticateToken);

// Category CRUD operations
router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;