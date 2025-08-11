import React from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

export function SitemarkIcon() {
  const { darkMode } = useTheme();
  return (
    <Typography
      variant="h4"
      component="div"
      sx={{
        fontWeight: 'bold',
        color: darkMode ? 'grey.100' : 'grey.900',
        '& span': {
          color: '#ec008c',
        },
      }}
    >
      Triba<span>stion</span>
    </Typography>
  );
}
