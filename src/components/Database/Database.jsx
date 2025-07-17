import React, { useState, useEffect } from 'react';
import {
  ChevronDown, ChevronRight, Plus, RefreshCw, Search, Grid, List, MoreHorizontal
} from 'lucide-react';
import { Box, Button, Input, Select, MenuItem, Typography, IconButton } from '@mui/material';

const dummyCollections = [
  {
    name: "Users",
    documentCount: 1245,
    storageSize: "2.3MB",
    avgDocumentSize: "1.8KB",
    indexes: 3,
    totalIndexSize: "456KB"
  },
  {
    name: "Orders",
    documentCount: 892,
    storageSize: "1.2MB",
    avgDocumentSize: "1.3KB",
    indexes: 2,
    totalIndexSize: "312KB"
  },
  {
    name: "Products",
    documentCount: 304,
    storageSize: "948KB",
    avgDocumentSize: "3.1KB",
    indexes: 4,
    totalIndexSize: "289KB"
  },
  {
    name: "Reviews",
    documentCount: 1845,
    storageSize: "3.5MB",
    avgDocumentSize: "1.9KB",
    indexes: 2,
    totalIndexSize: "1.2MB"
  },
  {
    name: "Inventory",
    documentCount: 673,
    storageSize: "1.6MB",
    avgDocumentSize: "2.4KB",
    indexes: 3,
    totalIndexSize: "390KB"
  },
  {
    name: "Sessions",
    documentCount: 2145,
    storageSize: "4.8MB",
    avgDocumentSize: "2.2KB",
    indexes: 1,
    totalIndexSize: "780KB"
  }
];

const Database_Collection = () => {
  const [openCollection, setOpenCollection] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('Collection Name');

  const toggleCollection = (name) => {
    setOpenCollection(prev => (prev === name ? null : name));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const filteredCollections = dummyCollections.filter(col =>
    col.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'Collection Name') return a.name.localeCompare(b.name);
    if (sortBy === 'Document Count') return a.documentCount - b.documentCount;
    if (sortBy === 'Storage Size') return parseFloat(a.storageSize) - parseFloat(b.storageSize);
    return 0;
  });

  return (
    <Box sx={{ minHeight: '100vh', p: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', mb: 4, gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<Plus />}>Create Collection</Button>
          <Button
            variant="outlined"
            startIcon={<RefreshCw className={isRefreshing ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 8, top: 10, color: '#888' }} />
            <Input
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ pl: 5, borderRadius: 1 }}
            />
          </Box>
          <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'grey.700', borderRadius: 1 }}>
            <IconButton onClick={() => setViewMode('list')} color={viewMode === 'list' ? 'primary' : 'default'}>
              <List />
            </IconButton>
            <IconButton onClick={() => setViewMode('grid')} color={viewMode === 'grid' ? 'primary' : 'default'}>
              <Grid />
            </IconButton>
          </Box>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ bgcolor: 'grey.800', color: 'white', borderRadius: 1, '.MuiSvgIcon-root': { color: 'white' } }}
          >
            <MenuItem value="Collection Name">Collection Name</MenuItem>
            <MenuItem value="Document Count">Document Count</MenuItem>
            <MenuItem value="Storage Size">Storage Size</MenuItem>
          </Select>
        </Box>
      </Box>

      {filteredCollections.length === 0 ? (
        <Box textAlign="center" py={10} bgcolor="grey.800" borderRadius={2} boxShadow={3}>
          <Search style={{ width: 40, height: 40, color: '#888', marginBottom: 12 }} />
          <Typography variant="h6">No collections found</Typography>
          <Typography variant="body2" color="grey.400">Try adjusting your search term.</Typography>
        </Box>
      ) : (
        <Box display="grid" gap={3} gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))">
          {filteredCollections.map((col) => (
            <Box
              key={col.name}
              bgcolor="grey.800"
              borderRadius={2}
              border="1px solid"
              borderColor="grey.700"
              boxShadow={4}
              sx={{ cursor: 'pointer', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }}
              onClick={() => toggleCollection(col.name)}
            >
              <Box p={2} display="flex" justifyContent="space-between" alignItems="center" sx={{ '&:hover': { bgcolor: 'grey.700' } }}>
                <Box display="flex" alignItems="center" gap={1}>
                  {openCollection === col.name ? (
                    <ChevronDown style={{ width: 16, height: 16, color: '#3b82f6' }} />
                  ) : (
                    <ChevronRight style={{ width: 16, height: 16, color: '#aaa' }} />
                  )}
                  <Typography variant="subtitle1" color="teal.300">{col.name}</Typography>
                </Box>
                <MoreHorizontal style={{ width: 18, height: 18, color: '#888' }} />
              </Box>
              <Box px={2} pb={2} fontSize={14} display="grid" gridTemplateColumns="1fr 1fr" rowGap={1}>
                <Typography variant="body2"><b>Documents:</b> {col.documentCount}</Typography>
                <Typography variant="body2"><b>Size:</b> {col.storageSize}</Typography>
                <Typography variant="body2"><b>Avg. Doc:</b> {col.avgDocumentSize}</Typography>
                <Typography variant="body2"><b>Indexes:</b> {col.indexes}</Typography>
                <Typography variant="body2"><b>Index Size:</b> {col.totalIndexSize}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Database_Collection;
