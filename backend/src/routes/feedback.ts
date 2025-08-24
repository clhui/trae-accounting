import { Router } from 'express';
import { getFeedback, createFeedback, updateFeedbackStatus } from '../controllers/feedback';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Optional auth routes - 允许未登录用户提交反馈，但如果已登录则获取用户ID
router.post('/', optionalAuth, createFeedback);

// Protected routes - 需要登录才能查看反馈历史
router.get('/', authenticateToken, getFeedback);

// Admin routes - 更新反馈状态（可以根据需要添加管理员权限验证）
router.patch('/:id/status', authenticateToken, updateFeedbackStatus);

export default router;