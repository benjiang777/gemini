import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Code,
  Web,
  Storage,
  Speed,
  Security,
  Mobile
} from '@mui/icons-material';

const AboutPage: React.FC = () => {
  const technologies = [
    { name: 'React 18', category: '前端框架' },
    { name: 'TypeScript', category: '编程语言' },
    { name: 'Material-UI', category: 'UI库' },
    { name: 'Node.js', category: '后端运行时' },
    { name: 'Express', category: '后端框架' },
    { name: 'Docker', category: '容器化' }
  ];

  const features = [
    { icon: <Web />, title: '现代化UI', description: '使用Material-UI构建美观的用户界面' },
    { icon: <Code />, title: 'TypeScript', description: '类型安全的开发体验' },
    { icon: <Storage />, title: 'RESTful API', description: '标准化的后端API接口' },
    { icon: <Speed />, title: '高性能', description: '优化的构建和运行性能' },
    { icon: <Security />, title: '安全性', description: '内置安全最佳实践' },
    { icon: <Mobile />, title: '响应式设计', description: '适配各种设备尺寸' }
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        关于此项目
      </Typography>
      
      <Typography variant="body1" paragraph>
        这是一个现代化的全栈Web应用，展示了当前最佳的开发实践和技术栈。
        项目采用前后端分离的架构，提供了完整的开发、构建和部署方案。
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                技术栈
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {technologies.map((tech, index) => (
                  <Chip
                    key={index}
                    label={`${tech.name} (${tech.category})`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                项目特性
              </Typography>
              <List dense>
                {features.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {feature.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={feature.title}
                      secondary={feature.description}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                开发说明
              </Typography>
              <Typography variant="body2" paragraph>
                项目结构清晰，代码规范统一，包含了完整的开发工具配置：
              </Typography>
              <Typography variant="body2" component="div">
                <ul>
                  <li>TypeScript 类型检查</li>
                  <li>ESLint 代码检查</li>
                  <li>Prettier 代码格式化</li>
                  <li>热更新开发环境</li>
                  <li>Docker 容器化部署</li>
                  <li>自动化构建流程</li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AboutPage;