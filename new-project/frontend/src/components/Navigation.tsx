import React from 'react';
import { Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        color="inherit"
        component={Link}
        to="/"
        sx={{ 
          textDecoration: 'none',
          backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent'
        }}
      >
        首页
      </Button>
      <Button
        color="inherit"
        component={Link}
        to="/about"
        sx={{ 
          textDecoration: 'none',
          backgroundColor: isActive('/about') ? 'rgba(255,255,255,0.1)' : 'transparent'
        }}
      >
        关于
      </Button>
    </Box>
  );
};

export default Navigation;