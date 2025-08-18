import { Router } from 'express';
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from '../controllers/records';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All record routes require authentication
router.use(authenticateToken);

// Record CRUD operations
router.get('/', getRecords);
router.get('/:id', getRecord);
router.post('/', createRecord);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

export default router;