import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // 默认错误状态码
  const statusCode = err.statusCode || 500;
  
  // 开发环境返回详细错误信息
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    success: false,
    message: err.message || '服务器内部错误',
    ...(isDevelopment && {
      stack: err.stack,
      details: {
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      }
    })
  };

  res.status(statusCode).json(errorResponse);
};