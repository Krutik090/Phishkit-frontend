import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SitemarkIcon } from './SitemarkIcon'; // Assuming this is your brand logo

// Importing new, more relevant icons
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import ModelTrainingRoundedIcon from '@mui/icons-material/ModelTrainingRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';

// Updated content focused on phishing awareness
const items = [
  {
    icon: <MarkEmailReadRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'Realistic Phishing Simulations',
    description:
      'Test your team with authentic-looking phishing templates, from common scams to sophisticated spear-phishing attacks.',
  },
  {
    icon: <ModelTrainingRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'Automated Training Workflows',
    description:
      'Automatically enroll users who fall for a simulation into engaging, gamified training modules to reinforce learning.',
  },
  {
    icon: <AssessmentRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'Actionable Reporting & Insights',
    description:
      "Gain a clear view of your organization's security posture with detailed reports on campaign performance and user progress.",
  },
  {
    icon: <ShieldRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'Strengthen Your Human Firewall',
    description:
      'Empower your employees to become the first line of defense against cyber threats, reducing risk and protecting sensitive data.',
  },
];

export default function Content() {
  return (
    <Stack
      sx={{ flexDirection: 'column', alignSelf: 'center', gap: 4, maxWidth: 450 }}
    >
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <SitemarkIcon />
      </Box>
      {items.map((item, index) => (
        <Stack key={index} direction="row" sx={{ gap: 2 }}>
          {item.icon}
          <div>
            <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.description}
            </Typography>
          </div>
        </Stack>
      ))}
    </Stack>
  );
}
