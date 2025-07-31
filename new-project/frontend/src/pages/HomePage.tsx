import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { useApi } from '../hooks/useApi';

interface DataItem {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

const HomePage: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const { loading, error, fetchData } = useApi();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await fetchData('/api/data');
      setData(result);
    } catch (err) {
      console.error('加载数据失败:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        欢迎使用我的现代化应用
      </Typography>
      
      <Typography variant="body1" paragraph>
        这是一个使用 React + TypeScript + Material-UI 构建的现代化前端应用，
        后端使用 Node.js + Express + TypeScript。
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button variant="contained" onClick={loadData}>
          刷新数据
        </Button>
      </Box>

      <Grid container spacing={3}>
        {data.length > 0 ? (
          data.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.content}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    创建时间: {new Date(item.createdAt).toLocaleString('zh-CN')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  暂无数据
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  点击"刷新数据"按钮从后端API获取数据。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default HomePage;