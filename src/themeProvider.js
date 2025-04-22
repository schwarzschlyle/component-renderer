import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a custom theme based on your provided configuration
const componentTheme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            color: '#FFF',
            cursor: 'not-allowed',
            pointerEvents: 'auto',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            color: '#7F56D9',
            cursor: 'not-allowed',
            pointerEvents: 'auto',
          },
          color: '#7F56D9',
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: '#667085',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&::placeholder': {
            color: '#667085',
          },
          color: '#344054',
        },
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D0D5DD',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#344054',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
  palette: {
    action: {
      disabledBackground: '#E9D7FE',
    },
    background: {
      default: '#FBFAFE',
      paper: '#FFFFFF',
    },
    common: {
      cherry: '#FE6C5F',
      dandelion: '#FF9F39',
      gold: '#F7C768',
      green: '#2EC854',
      lime: '#18CB7F',
      white: '#fff',
    },
    divider: '#5C5FEF22',
    grey: {
      '100': '#F2F4F7',
      '200': '#EAECF0',
      '300': '#D0D5DD',
      '400': '#98A2B3',
      '500': '#667085',
      '600': '#475467',
      '700': '#344054',
      '800': '#1D2939',
      '900': '#101828',
    },
    iris: {
      '100': '#5D5FEF',
    },
    muted: {
      main: '#5c6499',
    },
    primary: {
      contrastText: '#fff',
      main: '#4A00E0',
    },
    secondary: {
      main: '#FE6C5F',
    },
    status: {
      active: '#20A271',
      busy: '#FF9F39',
      hiatus: '#FE6C5F',
      offline: '#757575',
    },
    text: {
      primary: '#344054',
      secondary: '#667085',
    },
  },
  typography: {
    fontWeightBold: 600,
    fontWeightMedium: 500,
    fontWeightRegular: 400,
    h4: {
      marginBottom: '0.5rem',
    },
  },
});

// Helper function to get colors with variations
export const getCustomColors = () => ({
  common: componentTheme.palette.common,
  status: componentTheme.palette.status,
  iris: componentTheme.palette.iris,
});

// Global CSS for consistent styling
const globalStyles = {
  '.app-card': {
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
    transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease',
    '&:hover': {
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.08)',
      transform: 'translateY(-2px)',
    },
  },
  '.app-container': {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  '.status-badge': {
    padding: '4px 8px',
    borderRadius: '16px',
    fontSize: '0.75rem',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
  },
  '.status-active': {
    backgroundColor: 'rgba(32, 162, 113, 0.1)',
    color: '#20A271',
  },
  '.status-busy': {
    backgroundColor: 'rgba(255, 159, 57, 0.1)',
    color: '#FF9F39',
  },
  '.status-hiatus': {
    backgroundColor: 'rgba(254, 108, 95, 0.1)',
    color: '#FE6C5F',
  },
  '.status-offline': {
    backgroundColor: 'rgba(117, 117, 117, 0.1)',
    color: '#757575',
  },
};

// ComponentThemeProvider wraps generated components with the custom theme
export const ComponentThemeProvider = ({ children }) => {
  return (
    <ThemeProvider theme={componentTheme}>
      <CssBaseline />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            ${Object.entries(globalStyles).map(
              ([selector, styles]) => `
              ${selector} {
                ${Object.entries(styles).map(
                  ([property, value]) => `${property}: ${value};`
                ).join('\n')}
              }
            `
            ).join('\n')}
          `,
        }}
      />
      {children}
    </ThemeProvider>
  );
};

export default ComponentThemeProvider;