import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { exportData } from '../controllers/export';

const router = express.Router();

// 导出数据路由
router.get('/data', authenticateToken, exportData);

export default router;