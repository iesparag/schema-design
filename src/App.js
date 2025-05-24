import React, { useState, useMemo } from 'react';
import SchemaDesigner from './components/SchemaDesigner';
import { ThemeProvider, createTheme, IconButton, Box } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function App() {
  const [mode, setMode] = useState('dark');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: mode === 'light' ? '#ffffff' : '#121212',
            paper: mode === 'light' ? '#f5f5f5' : '#1e1e1e',
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: 'background.default',
        transition: 'background-color 0.3s ease'
      }}>
        <Box sx={{ position: 'fixed', top: 10, right: 10, zIndex: 5 }}>
          <IconButton 
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} 
            color="inherit"
            sx={{ color: mode === 'light' ? '#000' : '#fff' }}
          >
            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Box>
        <SchemaDesigner mode={mode} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
