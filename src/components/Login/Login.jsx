import React from 'react';
import { Box, Container, CssBaseline, ThemeProvider, createTheme, alpha } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { SignInCard } from './SignInCard'; // Corrected import
import Content from './Content';

const Login = () => {
  const { darkMode } = useTheme();

  // Create a dynamic theme for the login page
  const loginTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#ec008c',
      },
      background: {
        default: darkMode ? '#101021' : '#f7f7f9',
      },
    },
    typography: {
      fontFamily: 'Inter, Roboto, sans-serif',
    },
  });

  return (
    <ThemeProvider theme={loginTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          background: darkMode ? '#101021' : '#f7f7f9',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at top left, ${alpha('#ec008c', 0.3)}, transparent 40%),
                         radial-gradient(circle at bottom right, ${alpha('#7c3aed', 0.3)}, transparent 40%)`,
            animation: 'gradient-animation 15s ease infinite',
          },
          '@keyframes gradient-animation': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 8,
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            <Content />
            <SignInCard />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
