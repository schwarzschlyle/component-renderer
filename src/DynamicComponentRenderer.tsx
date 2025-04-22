import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  AlertTitle, 
  createTheme, 
  ThemeProvider,
  TextField,
  Divider,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Checkbox,
  FormControl,
  FormLabel,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Fab,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Chip,
  Avatar,
  Tooltip,
  Switch
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// Create MUI dark theme for the rendered components
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#2e7d32',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

interface DynamicComponentRendererProps {
  code: string;
}

const DynamicComponentRenderer: React.FC<DynamicComponentRendererProps> = ({ code }) => {
  const [DynamicComponent, setDynamicComponent] = useState<React.FC | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Process imports to handle them properly in the component code
  const processImports = (code: string) => {
    // Find all import statements
    const importRegexes = [
      // Named imports like: import { useState, useEffect } from 'react';
      { regex: /import\s*{([^}]*)}\s*from\s*(['"][^'"]*['"])/g, type: 'named' },
      // Default imports like: import React from 'react';
      { regex: /import\s+([^{}\s,]+)\s+from\s+(['"][^'"]*['"])/g, type: 'default' },
      // Namespace imports like: import * as React from 'react';
      { regex: /import\s+\*\s+as\s+([^\s,]+)\s+from\s+(['"][^'"]*['"])/g, type: 'namespace' }
    ];
    
    // Collect all imports
    const importsToReplace = [];
    for (const { regex, type } of importRegexes) {
      let match;
      const regexCopy = new RegExp(regex);
      while ((match = regexCopy.exec(code)) !== null) {
        importsToReplace.push({ 
          fullMatch: match[0], 
          items: match[1], 
          module: match[2].replace(/['"]/g, ''),
          type
        });
      }
    }

    // Process the code by replacing imports with variable declarations
    let processedCode = code;
    
    // For each import statement, generate appropriate variable declarations
    importsToReplace.forEach(({ fullMatch, items, module, type }) => {
      let replacement = '';
      
      if (type === 'named') {
        // Handle named imports: import { useState, useEffect } from 'react';
        const importedItems = items
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        for (const item of importedItems) {
          // Handle aliases: { useState as useStateAlias }
          const [name, alias] = item.split(' as ').map(s => s.trim());
          const varName = alias || name;
          
          replacement += `const ${varName} = mockLibraries['${module}']['${name}'];\n`;
        }
      } else if (type === 'default') {
        // Handle default imports: import React from 'react';
        replacement = `const ${items} = mockLibraries['${module}'];\n`;
      } else if (type === 'namespace') {
        // Handle namespace imports: import * as React from 'react';
        replacement = `const ${items} = mockLibraries['${module}'];\n`;
      }
      
      processedCode = processedCode.replace(fullMatch, replacement);
    });
    
    return processedCode;
  };

  const renderComponent = () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);
    
    try {
      // Process imports in the code
      const processedCode = processImports(code);
      
      // Add debugging logs
      console.log("Processed component code:", processedCode);

      // Wrap the processed code to ensure it returns the component
      const wrappedCode = `
        // Initialize mock libraries
        const mockLibraries = {
          'react': React,
          'react-dom': ReactDOM,
          // Material-UI mock library
          '@mui/material': mui,
          '@mui/icons-material': mui.icons,
          'lucide-react': {
            Clock: (props) => React.createElement('svg', {
              xmlns: "http://www.w3.org/2000/svg",
              width: props?.size || 24,
              height: props?.size || 24,
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: props?.color || "currentColor",
              strokeWidth: 2,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              ...props
            }, [
              React.createElement('circle', { key: 1, cx: 12, cy: 12, r: 10 }),
              React.createElement('polyline', { key: 2, points: "12 6 12 12 16 14" })
            ]),
            Play: (props) => React.createElement('svg', {
              xmlns: "http://www.w3.org/2000/svg",
              width: props?.size || 24,
              height: props?.size || 24,
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: props?.color || "currentColor",
              strokeWidth: 2,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              ...props
            }, [
              React.createElement('polygon', { key: 1, points: "5 3 19 12 5 21 5 3" })
            ]),
            Pause: (props) => React.createElement('svg', {
              xmlns: "http://www.w3.org/2000/svg",
              width: props?.size || 24,
              height: props?.size || 24,
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: props?.color || "currentColor",
              strokeWidth: 2,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              ...props
            }, [
              React.createElement('rect', { key: 1, x: 6, y: 4, width: 4, height: 16 }),
              React.createElement('rect', { key: 2, x: 14, y: 4, width: 4, height: 16 })
            ]),
            X: (props) => React.createElement('svg', {
              xmlns: "http://www.w3.org/2000/svg",
              width: props?.size || 24,
              height: props?.size || 24,
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: props?.color || "currentColor",
              strokeWidth: 2,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              ...props
            }, [
              React.createElement('line', { key: 1, x1: 18, y1: 6, x2: 6, y2: 18 }),
              React.createElement('line', { key: 2, x1: 6, y1: 6, x2: 18, y2: 18 })
            ]),
            Plus: (props) => React.createElement('svg', {
              xmlns: "http://www.w3.org/2000/svg",
              width: props?.size || 24,
              height: props?.size || 24,
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: props?.color || "currentColor",
              strokeWidth: 2,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              ...props
            }, [
              React.createElement('line', { key: 1, x1: 12, y1: 5, x2: 12, y2: 19 }),
              React.createElement('line', { key: 2, x1: 5, y1: 12, x2: 19, y2: 12 })
            ]),
            Save: (props) => React.createElement('svg', {
              xmlns: "http://www.w3.org/2000/svg",
              width: props?.size || 24,
              height: props?.size || 24,
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: props?.color || "currentColor",
              strokeWidth: 2,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              ...props
            }, [
              React.createElement('path', { key: 1, d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }),
              React.createElement('polyline', { key: 2, points: "17 21 17 13 7 13 7 21" }),
              React.createElement('polyline', { key: 3, points: "7 3 7 8 15 8" })
            ])
          }
        };
      
        try {
          ${processedCode}
          
          // Look for the AIGeneratedWidget component first
          if (typeof AIGeneratedWidget === 'function') {
            return AIGeneratedWidget;
          }
          
          // Try different ways to find the component
          // Look for any function that looks like a React component
          // It should start with uppercase letter
          const allVars = Object.getOwnPropertyNames(this);
          const componentCandidates = allVars.filter(name => {
            return typeof this[name] === 'function' && 
                  /^[A-Z]/.test(name) && 
                  !['React', 'ReactDOM'].includes(name);
          });
          
          if (componentCandidates.length > 0) {
            return this[componentCandidates[0]];
          }
          
          // If no specific component is found, look for any function that returns JSX
          const allFunctions = allVars.filter(name => typeof this[name] === 'function');
          for (const funcName of allFunctions) {
            const funcStr = this[funcName].toString();
            if (funcStr.includes('React.createElement') || 
                funcStr.includes('return (') || 
                funcStr.includes('return <')) {
              return this[funcName];
            }
          }
          
          throw new Error("No React component found in the code. Make sure your component is properly defined and exported as AIGeneratedWidget.");
        } catch (err) {
          console.error('Error in component code:', err);
          throw err;
        }
      `;

      // Create ThemeProvider wrapper for nested use
      const MuiThemeProvider = ({ children }) => 
        React.createElement(ThemeProvider, { theme: darkTheme }, children);

      // Execute the wrapped code
      const Component = new Function('React', 'ReactDOM', 'mui', wrappedCode)(React, ReactDOM, {
        // MUI ThemeProvider and styling
        ThemeProvider: MuiThemeProvider,
        createTheme: createTheme,
        // Mock MUI components for the component to use
        Button: ({ children, ...props }) => React.createElement(Button, props, children),
        Box: ({ children, ...props }) => React.createElement(Box, props, children),
        Paper: ({ children, ...props }) => React.createElement(Paper, props, children),
        Typography: ({ children, ...props }) => React.createElement(Typography, props, children),
        TextField: ({ ...props }) => React.createElement(TextField, props),
        CircularProgress: ({ ...props }) => React.createElement(CircularProgress, props),
        Alert: ({ children, ...props }) => React.createElement(Alert, props, children),
        Divider: ({ ...props }) => React.createElement(Divider, props),
        Container: ({ children, ...props }) => React.createElement(Container, props, children),
        Grid: ({ children, ...props }) => React.createElement(Grid, props, children),
        Card: ({ children, ...props }) => React.createElement(Card, props, children),
        CardContent: ({ children, ...props }) => React.createElement(CardContent, props, children),
        CardHeader: ({ ...props }) => React.createElement(CardHeader, props),
        CardActions: ({ children, ...props }) => React.createElement(CardActions, props, children),
        Checkbox: ({ ...props }) => React.createElement(Checkbox, props),
        FormControl: ({ children, ...props }) => React.createElement(FormControl, props, children),
        FormLabel: ({ children, ...props }) => React.createElement(FormLabel, props, children),
        InputLabel: ({ children, ...props }) => React.createElement(InputLabel, props, children),
        Select: ({ children, ...props }) => React.createElement(Select, props, children),
        MenuItem: ({ children, ...props }) => React.createElement(MenuItem, props, children),
        List: ({ children, ...props }) => React.createElement(List, props, children),
        ListItem: ({ children, ...props }) => React.createElement(ListItem, props, children),
        ListItemText: ({ ...props }) => React.createElement(ListItemText, props),
        ListItemIcon: ({ children, ...props }) => React.createElement(ListItemIcon, props, children),
        ListItemButton: ({ children, ...props }) => React.createElement(ListItemButton, props, children),
        Fab: ({ children, ...props }) => React.createElement(Fab, props, children),
        IconButton: ({ children, ...props }) => React.createElement(IconButton, props, children),
        Tabs: ({ children, ...props }) => React.createElement(Tabs, props, children),
        Tab: ({ ...props }) => React.createElement(Tab, props),
        Dialog: ({ children, ...props }) => React.createElement(Dialog, props, children),
        DialogTitle: ({ children, ...props }) => React.createElement(DialogTitle, props, children),
        DialogContent: ({ children, ...props }) => React.createElement(DialogContent, props, children),
        LinearProgress: ({ ...props }) => React.createElement(LinearProgress, props),
        Chip: ({ ...props }) => React.createElement(Chip, props),
        Avatar: ({ ...props }) => React.createElement(Avatar, props),
        Tooltip: ({ children, ...props }) => React.createElement(Tooltip, props, children),
        Switch: ({ ...props }) => React.createElement(Switch, props),
        // Mock MUI icons
        icons: {
          Delete: ({ ...props }) => React.createElement(DeleteIcon, props),
          Add: ({ ...props }) => React.createElement(AddIcon, props),
          Check: ({ ...props }) => React.createElement(CheckIcon, props),
          Close: ({ ...props }) => React.createElement(CloseIcon, props),
          Edit: ({ ...props }) => React.createElement(EditIcon, props),
          PlayArrow: ({ ...props }) => React.createElement(PlayArrowIcon, props),
          Pause: ({ ...props }) => React.createElement(PauseIcon, props),
          Refresh: ({ ...props }) => React.createElement(RefreshIcon, props),
          Settings: ({ ...props }) => React.createElement(SettingsIcon, props),
          Search: ({ ...props }) => React.createElement(SearchIcon, props),
          Favorite: ({ ...props }) => React.createElement(FavoriteIcon, props),
          FavoriteBorder: ({ ...props }) => React.createElement(FavoriteBorderIcon, props),
          Star: ({ ...props }) => React.createElement(StarIcon, props),
          StarBorder: ({ ...props }) => React.createElement(StarBorderIcon, props),
          Info: ({ ...props }) => React.createElement(InfoIcon, props),
          Warning: ({ ...props }) => React.createElement(WarningIcon, props),
          Error: ({ ...props }) => React.createElement(ErrorIcon, props),
          CheckCircle: ({ ...props }) => React.createElement(CheckCircleIcon, props),
          Person: ({ ...props }) => React.createElement(PersonIcon, props),
          ArrowUpward: ({ ...props }) => React.createElement(ArrowUpwardIcon, props),
          ArrowDownward: ({ ...props }) => React.createElement(ArrowDownwardIcon, props)
        }
      });

      // Check if we got a valid component
      console.log("Generated Component:", Component);

      if (!Component) {
        throw new Error("No React component was found. Make sure your component is exported as AIGeneratedWidget.");
      }

      // Set the component for rendering
      setDynamicComponent(() => Component);
      setStatusMessage('Component rendered successfully!');
    } catch (err) {
      console.error('Error transpiling or evaluating code:', err);
      setError((err as Error).message);
      setDynamicComponent(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="renderer-container" sx={{ mb: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={renderComponent}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CodeIcon />}
        sx={{ mb: 2 }}
      >
        {isLoading ? 'Rendering...' : 'Render Component'}
      </Button>

      {statusMessage && (
        <Alert 
          severity="success" 
          icon={<CheckCircleOutlineIcon />}
          sx={{ mb: 2 }}
        >
          {statusMessage}
        </Alert>
      )}

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
        >
          <AlertTitle>Error</AlertTitle>
          <Box sx={{ 
            fontFamily: 'monospace', 
            p: 1.5, 
            bgcolor: 'rgba(0,0,0,0.04)', 
            borderRadius: 1,
            overflowX: 'auto',
            mb: 1 
          }}>
            {error}
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Tip:</strong> Check for syntax errors, unsupported imports, or undefined variables.
            Make sure your component is exported as AIGeneratedWidget.
          </Typography>
        </Alert>
      )}

      <Paper 
        variant="outlined" 
        sx={{ 
          width: '100%',
          minHeight: 200,
          borderRadius: 1
        }}
      >
        {isLoading ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            color: 'text.secondary'
          }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2">Processing your component...</Typography>
          </Box>
        ) : DynamicComponent ? (
          <Box sx={{ p: 2 }}>
            <ThemeProvider theme={darkTheme}>
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <DynamicComponent />
              </Box>
            </ThemeProvider>
          </Box>
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            color: 'text.secondary',
            p: 2
          }}>
            <Typography variant="h4" sx={{ color: 'primary.main', mb: 2 }}>⚛️</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              No component rendered yet. Click the button above to render your component.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports React components with Material-UI integration!
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DynamicComponentRenderer;