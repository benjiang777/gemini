import { Router } from 'express';
import dataRoutes from './data';

const router = Router();

// API版本信息
router.get('/', (req, res) => {
  res.json({
    message: '现代化全栈应用 API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      data: '/api/data',
      health: '/health'
    }
  });
});

// 数据相关路由
router.use('/data', dataRoutes);

export default router;