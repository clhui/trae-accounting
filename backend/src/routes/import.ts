import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { importData, upload } from '../controllers/import';

const router = express.Router();

// 导入数据路由 - 使用multer中间件处理文件上传
router.post('/data', authenticateToken, upload.single('file'), importData);

export default router;