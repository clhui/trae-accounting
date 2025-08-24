import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getMonthlyStatistics, getCategoryStatistics, getAccountStatistics } from '../controllers/statistics';

const router = Router();

// 所有统计路由都需要认证
router.use(authenticateToken);

// 月度统计
router.get('/monthly', getMonthlyStatistics);

// 分类统计
router.get('/category', getCategoryStatistics);

// 账户统计
router.get('/account', getAccountStatistics);

export default router;