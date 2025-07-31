import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

const router = Router();

// 模拟数据库数据
let mockData = [
  {
    id: 1,
    title: '欢迎使用现代化应用',
    content: '这是一个使用最新技术栈构建的全栈Web应用示例。',
    createdAt: new Date('2024-01-01T10:00:00Z').toISOString()
  },
  {
    id: 2,
    title: '技术栈介绍',
    content: '前端使用React + TypeScript + Material-UI，后端使用Node.js + Express + TypeScript。',
    createdAt: new Date('2024-01-02T14:30:00Z').toISOString()
  },
  {
    id: 3,
    title: '功能特点',
    content: '支持响应式设计、类型安全、组件化开发、RESTful API等现代Web开发特性。',
    createdAt: new Date('2024-01-03T09:15:00Z').toISOString()
  }
];

// 获取所有数据
router.get('/', (req: Request, res: Response) => {
  try {
    // 模拟数据库查询延迟
    setTimeout(() => {
      res.json({
        success: true,
        data: mockData,
        total: mockData.length,
        timestamp: new Date().toISOString()
      });
    }, 500);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取数据失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 根据ID获取单个数据
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const item = mockData.find(data => data.id === id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: '数据不存在'
      });
    }
    
    res.json({
      success: true,
      data: item,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取数据失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 创建新数据
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('标题不能为空'),
    body('content').notEmpty().withMessage('内容不能为空')
  ],
  (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '数据验证失败',
          errors: errors.array()
        });
      }

      const { title, content } = req.body;
      const newItem = {
        id: Math.max(...mockData.map(item => item.id)) + 1,
        title,
        content,
        createdAt: new Date().toISOString()
      };
      
      mockData.push(newItem);
      
      res.status(201).json({
        success: true,
        data: newItem,
        message: '创建成功',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '创建数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

// 更新数据
router.put(
  '/:id',
  [
    body('title').optional().notEmpty().withMessage('标题不能为空'),
    body('content').optional().notEmpty().withMessage('内容不能为空')
  ],
  (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '数据验证失败',
          errors: errors.array()
        });
      }

      const id = parseInt(req.params.id);
      const itemIndex = mockData.findIndex(data => data.id === id);
      
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: '数据不存在'
        });
      }
      
      const { title, content } = req.body;
      if (title) mockData[itemIndex].title = title;
      if (content) mockData[itemIndex].content = content;
      
      res.json({
        success: true,
        data: mockData[itemIndex],
        message: '更新成功',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '更新数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

// 删除数据
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const itemIndex = mockData.findIndex(data => data.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '数据不存在'
      });
    }
    
    const deletedItem = mockData.splice(itemIndex, 1)[0];
    
    res.json({
      success: true,
      data: deletedItem,
      message: '删除成功',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除数据失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router;