import { Router } from 'express';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../controllers/accounts';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All account routes require authentication
router.use(authenticateToken);

// Account CRUD operations
router.get('/', getAccounts);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;