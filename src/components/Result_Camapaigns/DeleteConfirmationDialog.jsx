import React from 'react';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Button,
  alpha,
  Box,
  Typography
} from '@mui/material';
import { useTheme } from "../../context/ThemeContext";
import { Warning as WarningIcon } from "@mui/icons-material";

const DeleteConfirmationDialog = ({ open, onClose, onConfirm, title, description }) => {
  const { darkMode } = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: darkMode 
            ? alpha("#1a1a2e", 0.95) 
            : alpha("#ffffff", 0.95),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.5)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle 
        sx={{
          fontWeight: 'bold',
          color: darkMode ? '#e1e1e1' : '#333',
          background: `linear-gradient(135deg, ${alpha('#f44336', 0.1)}, ${alpha('#ef5350', 0.05)})`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        }}
      >
        <Box
          sx={{
            backgroundColor: alpha('#f44336', 0.1),
            borderRadius: '8px',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WarningIcon sx={{ color: '#f44336' }} />
        </Box>
        {title}
      </DialogTitle>
      
      <DialogContent 
        sx={{ 
          pt: 3,
          backgroundColor: darkMode 
            ? alpha('#1a1a2e', 0.3) 
            : alpha('#f8f9fa', 0.5),
        }}
      >
        <Typography
          sx={{
            color: darkMode ? '#ccc' : '#666',
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 'medium',
            px: 3,
            py: 1,
            color: darkMode ? '#ccc' : '#666',
            borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
            '&:hover': {
              backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
            },
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 'bold',
            px: 3,
            py: 1,
            backgroundColor: '#f44336',
            '&:hover': {
              backgroundColor: '#d32f2f',
              boxShadow: '0 4px 16px rgba(244, 67, 54, 0.4)',
            },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
