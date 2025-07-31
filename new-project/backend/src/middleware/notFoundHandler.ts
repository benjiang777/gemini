import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `路由 ${req.originalUrl} 不存在`,
    availableEndpoints: {
      api: '/api',
      health: '/health',
      data: '/api/data'
    },
    timestamp: new Date().toISOString()
  });
};