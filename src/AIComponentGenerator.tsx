import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Select, MenuItem, FormControl,
  InputLabel, Divider, Grid, Alert, CircularProgress, Card, CardContent,
  useTheme, Chip, Tooltip, ThemeProvider, createTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StorageIcon from '@mui/icons-material/Storage';
import DatasetIcon from '@mui/icons-material/Dataset';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';

// Dark theme configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#ce93d8' },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  background: 'linear-gradient(145deg, rgba(40,40,40,0.6) 0%, rgba(20,20,20,0.8) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.4)'
  }
}));

const DataSourceChip = styled(Chip)(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: selected ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.1)',
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.2)',
  }
}));

const AIComponentGenerator = ({ onGenerateCode }) => {
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [complexity, setComplexity] = useState('medium');
  const [style, setStyle] = useState('mui');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState([]);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [selectedDataSources, setSelectedDataSources] = useState([]);
  const [availableDataSources, setAvailableDataSources] = useState([]);
  const [isDataSourcesLoading, setIsDataSourcesLoading] = useState(false);
  const [validationWarning, setValidationWarning] = useState('');

  // Fetch templates and data sources on component mount
  useEffect(() => {
    fetchTemplates();
    fetchDataSources();
  }, []);

  // Validate component requirements when description or data sources change
  useEffect(() => {
    validateComponentRequirements();
  }, [description, selectedDataSources]);

  const fetchDataSources = async () => {
    setIsDataSourcesLoading(true);
    try {
      const response = await fetch('http://localhost:8000/available-data-sources');
      if (!response.ok) {
        throw new Error('Failed to fetch data sources');
      }
      const data = await response.json();
      setAvailableDataSources(data);
    } catch (err) {
      console.error('Error fetching data sources:', err);
      setError('Failed to load data sources');
    } finally {
      setIsDataSourcesLoading(false);
    }
  };

  const fetchTemplates = async () => {
    setIsTemplatesLoading(true);
    try {
      const response = await fetch('http://localhost:8000/component-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
    } finally {
      setIsTemplatesLoading(false);
    }
  };

  const validateComponentRequirements = () => {
    setValidationWarning('');
    
    if (!description || selectedDataSources.length === 0) return;
    
    const descLower = description.toLowerCase();
    
    // Check for potential mismatches between description and data sources
    const userDataSelected = selectedDataSources.includes('users');
    const productDataSelected = selectedDataSources.includes('products');
    const orderDataSelected = selectedDataSources.includes('orders');
    const analyticsDataSelected = selectedDataSources.includes('analytics');
    
    if (
      (descLower.includes('user') && !userDataSelected) ||
      (descLower.includes('profile') && !userDataSelected) ||
      (descLower.includes('product') && !productDataSelected) ||
      (descLower.includes('item') && !productDataSelected && !orderDataSelected) ||
      (descLower.includes('order') && !orderDataSelected) ||
      (descLower.includes('purchase') && !orderDataSelected) ||
      (descLower.includes('analytic') && !analyticsDataSelected) ||
      (descLower.includes('statistic') && !analyticsDataSelected) ||
      (descLower.includes('chart') && !analyticsDataSelected)
    ) {
      setValidationWarning('Your component description may require additional data sources. Please check your selections.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (selectedDataSources.length === 0) {
      setError('Please select at least one data source for your component');
      setIsLoading(false);
      return;
    }
    
    try {
      const featuresArray = features
        .split(',')
        .map(feature => feature.trim())
        .filter(feature => feature.length > 0);
      
      // Map data sources to their full objects for the backend
      const selectedDataSourcesObjects = selectedDataSources.map(id => 
        availableDataSources.find(ds => ds.id === id)
      );
      
      const response = await fetch('http://localhost:8000/generate-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          features: featuresArray,
          complexity,
          style,
          data_sources: selectedDataSourcesObjects
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate component');
      }
      
      const data = await response.json();
      
      if (onGenerateCode && typeof onGenerateCode === 'function') {
        onGenerateCode(data.component_code);
      }
      
    } catch (err) {
      console.error('Error generating component:', err);
      setError(err.message || 'Failed to generate component');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = async (template) => {
    // When selecting a template, try to detect which data sources it needs
    const templateCode = template.template;
    const templateLower = (template.name + template.description).toLowerCase();
    
    // Auto-select appropriate data sources based on template
    const newSelectedSources = [];
    
    if (templateCode.includes('/data/users') || 
        templateLower.includes('user')) {
      newSelectedSources.push('users');
    }
    
    if (templateCode.includes('/data/products') || 
        templateLower.includes('product')) {
      newSelectedSources.push('products');
    }
    
    if (templateCode.includes('/data/orders') || 
        templateLower.includes('order')) {
      newSelectedSources.push('orders');
    }
    
    if (templateCode.includes('/data/analytics') || 
        templateLower.includes('analytic') || 
        templateLower.includes('chart') ||
        templateLower.includes('dashboard')) {
      newSelectedSources.push('analytics');
    }
    
    setSelectedDataSources(newSelectedSources);
    
    if (onGenerateCode && typeof onGenerateCode === 'function') {
      onGenerateCode(template.template);
    }
  };

  const toggleDataSource = (sourceId) => {
    setSelectedDataSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId) 
        : [...prev, sourceId]
    );
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(145deg, rgba(40,40,40,0.8) 0%, rgba(25,25,25,0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4, 
          justifyContent: 'space-between'
        }}>
          <Typography 
            variant="h4" 
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(90deg, #90caf9, #ce93d8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}
          >
            AI Component Generator
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DatasetIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle2" color="text.secondary">
              {selectedDataSources.length} data source{selectedDataSources.length !== 1 ? 's' : ''} selected
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
            Templates
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            overflowX: 'auto',
            pb: 1,
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
            }
          }}>
            {isTemplatesLoading ? (
              <Box sx={{ p: 2, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={16} sx={{ mr: 1 }} /> 
                Loading templates...
              </Box>
            ) : templates.length > 0 ? (
              templates.map((template, index) => (
                <StyledCard 
                  key={index}
                  onClick={() => handleTemplateSelect(template)}
                  variant="outlined"
                  sx={{ minWidth: 200, maxWidth: 250 }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {template.description}
                    </Typography>
                    <Chip 
                      label="Use Template" 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </StyledCard>
              ))
            ) : (
              <Box sx={{ p: 2, color: 'text.secondary' }}>
                No templates available
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Generator Form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                id="description"
                label="What component would you like to create?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the component you want to generate..."
                required
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              
              {validationWarning && (
                <Alert 
                  severity="warning" 
                  icon={<WarningIcon />}
                  sx={{ mt: 1, borderRadius: 2 }}
                >
                  {validationWarning}
                </Alert>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
                Data Sources <Typography component="span" variant="caption" color="error.main">(Required)</Typography>
              </Typography>
              
              {isDataSourcesLoading ? (
                <Box sx={{ p: 2, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} /> 
                  Loading data sources...
                </Box>
              ) : (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    mb: 2
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {availableDataSources.map(source => (
                      <DataSourceChip
                        key={source.id}
                        label={source.name}
                        icon={<StorageIcon />}
                        onClick={() => toggleDataSource(source.id)}
                        selected={selectedDataSources.includes(source.id)}
                        variant={selectedDataSources.includes(source.id) ? "filled" : "outlined"}
                        deleteIcon={
                          selectedDataSources.includes(source.id) ? 
                            <Tooltip title="Data count">
                              <Box component="span" sx={{ 
                                bgcolor: 'rgba(0,0,0,0.2)', 
                                px: 0.8,
                                py: 0.2,
                                borderRadius: 5,
                                fontSize: '0.7rem',
                                ml: 0.5
                              }}>
                                {source.count}
                              </Box>
                            </Tooltip> : null
                        }
                        onDelete={
                          selectedDataSources.includes(source.id) ? 
                            () => {} : null
                        }
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Select data sources for your component to use via API
                  </Typography>
                </Paper>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="features"
                label="Features (comma-separated)"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="search functionality, dark mode, charts, etc."
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="complexity-label">Complexity</InputLabel>
                <Select
                  labelId="complexity-label"
                  id="complexity"
                  value={complexity}
                  label="Complexity"
                  onChange={(e) => setComplexity(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="simple">Simple</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="complex">Complex</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="style-label">Style Preference</InputLabel>
                <Select
                  labelId="style-label"
                  id="style"
                  value={style}
                  label="Style Preference"
                  onChange={(e) => setStyle(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="mui">Material-UI</MenuItem>
                  <MenuItem value="minimal">Minimal</MenuItem>
                  <MenuItem value="elaborate">Elaborate</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isLoading || !description.trim() || selectedDataSources.length === 0}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #5c6bc0, #8e24aa)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #3949ab, #6a1b9a)',
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Generating...
                  </>
                ) : (
                  'Generate Component'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </ThemeProvider>
  );
};

export default AIComponentGenerator;
