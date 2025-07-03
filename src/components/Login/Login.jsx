import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SignInCard from './SignInCard';
import Content from './Content';

// Create custom theme with #ec008c as primary
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ec008c', // Your brand pink
    },
    secondary: {
      main: '#f06292', // Related pink
    },
    background: {
      default: '#fdf7fa',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
  },
});

export default function Login() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />

      <Stack
        direction="column"
        component="main"
        sx={[
          {
            justifyContent: 'center',
            height: 'calc((1 - var(--template-frame-height, 0)) * 100%)',
            marginTop: 'max(40px - var(--template-frame-height, 0px), 0px)',
            minHeight: '100%',
          },
          (theme) => ({
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              zIndex: -1,
              inset: 0,
              backgroundImage:
                'radial-gradient(ellipse at 50% 50%, hsl(330, 100%, 98%), hsl(0, 0%, 100%))',
              backgroundRepeat: 'no-repeat',
            },
          }),
        ]}
      >
        <Stack
          direction={{ xs: 'column-reverse', md: 'row' }}
          sx={{
            justifyContent: 'center',
            gap: { xs: 6, sm: 12 },
            p: 2,
            mx: 'auto',
          }}
        >
          <Stack
            direction={{ xs: 'column-reverse', md: 'row' }}
            sx={{
              justifyContent: 'center',
              gap: { xs: 6, sm: 12 },
              p: { xs: 2, sm: 4 },
              m: 'auto',
            }}
          >
            <Content />
            <SignInCard />
          </Stack>
        </Stack>
      </Stack>
    </ThemeProvider>
  );
}
