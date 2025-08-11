import React from 'react';
import { Box, Stack, Typography, alpha } from '@mui/material';
import { SitemarkIcon } from './SitemarkIcon';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import ModelTrainingRoundedIcon from '@mui/icons-material/ModelTrainingRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { useTheme } from '../../context/ThemeContext';

const items = [
  {
    icon: <MarkEmailReadRoundedIcon />,
    title: 'Realistic Phishing Simulations',
    description: 'Test your team with authentic-looking phishing templates, from common scams to sophisticated attacks.',
  },
  {
    icon: <ModelTrainingRoundedIcon />,
    title: 'Automated Training Workflows',
    description: 'Automatically enroll users who fall for a simulation into engaging, gamified training modules.',
  },
  {
    icon: <AssessmentRoundedIcon />,
    title: 'Actionable Reporting & Insights',
    description: "Gain a clear view of your organization's security posture with detailed reports on performance.",
  },
  {
    icon: <ShieldRoundedIcon />,
    title: 'Strengthen Your Human Firewall',
    description: 'Empower your employees to become the first line of defense against cyber threats.',
  },
];

export default function Content() {
  const { darkMode } = useTheme();
  return (
    <Stack sx={{ gap: 4 }}>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, mb: 2 }}>
        <SitemarkIcon />
      </Box>
      <Typography variant="h4" fontWeight="bold">
        Build a Resilient Organization
      </Typography>
      <Typography color="text.secondary">
        Our platform empowers you to train your team, identify risks, and build a strong security culture from the inside out.
      </Typography>
      <Stack sx={{ gap: 3, mt: 2 }}>
        {items.map((item, index) => (
          <Stack key={index} direction="row" sx={{ gap: 2, alignItems: 'center' }}>
            <Box sx={{
                display: 'flex',
                p: 1.5,
                borderRadius: '50%',
                background: darkMode ? alpha('#ec008c', 0.1) : alpha('#ec008c', 0.1),
                color: '#ec008c'
            }}>
              {item.icon}
            </Box>
            <Box>
              <Typography fontWeight="medium">{item.title}</Typography>
              <Typography variant="body2" color="text.secondary">{item.description}</Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
