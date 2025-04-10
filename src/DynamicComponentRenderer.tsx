import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface DynamicComponentRendererProps {
  code: string;
}

const DynamicComponentRenderer: React.FC<DynamicComponentRendererProps> = ({ code }) => {
  const [DynamicComponent, setDynamicComponent] = useState<React.FC | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mock implementations of common libraries
  const createMockLibraries = () => {
    // Mock lucide-react icons
    const lucideReact = {
      Clock: (props: any) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      Play: (props: any) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      ),
      Pause: (props: any) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      ),
      Plus: (props: any) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      ),
      X: (props: any) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      ),
      Save: (props: any) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
      ),
    };

    return {
      react: React,
      'react-dom': ReactDOM,
      'lucide-react': lucideReact
    };
  };

  // Create a function to handle imports and convert them to proper variables
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
      // Create mock libraries
      const mockLibraries = createMockLibraries();
      
      // Process imports in the code
      const processedCode = processImports(code);
      
      // Add debugging logs to check the processed code
      console.log("Processed component code:", processedCode);

      // Wrap the processed code to ensure it returns the component
      const wrappedCode = `
        // Initialize mock libraries
        const mockLibraries = {
          'react': React,
          'react-dom': ReactDOM,
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
          
          // Try different ways to find the component
          // First, check for common component names
          if (typeof TimeLogger === 'function') {
            return TimeLogger;
          } else if (typeof SimpleCounter === 'function') {
            return SimpleCounter;
          }
          
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
          
          throw new Error("No React component found in the code. Make sure your component is properly defined.");
        } catch (err) {
          console.error('Error in component code:', err);
          throw err;
        }
      `;

      // Execute the wrapped code
      const Component = new Function('React', 'ReactDOM', wrappedCode)(React, ReactDOM);

      // Check if we got a valid component
      console.log("Generated Component:", Component);

      if (!Component) {
        throw new Error("No React component was found. Make sure your component is properly defined with a capital first letter.");
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
    <div className="renderer-container">
      <button
        className="render-button"
        onClick={renderComponent}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="loading-spinner-small" />
            Rendering...
          </>
        ) : (
          'Render Component'
        )}
      </button>

      {statusMessage && (
        <div className="status-message success">
          ✓ {statusMessage}
        </div>
      )}

      {error && (
        <div className="render-error">
          <div className="error-title">Error:</div>
          <div className="error-message">
            {error}
          </div>
          <div className="error-tip">
            <strong>Tip:</strong> Check for syntax errors, unsupported imports, or undefined variables.
          </div>
        </div>
      )}

      <div className="component-preview">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Processing your component...</p>
          </div>
        ) : DynamicComponent ? (
          <div className="rendered-component">
            <DynamicComponent />
          </div>
        ) : (
          <div className="empty-renderer">
            <div className="react-icon">⚛️</div>
            <p>No component rendered yet. Click the button above to render your component.</p>
            <p className="renderer-hint">
              Supports React components with imports, useState, useEffect, and more!
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        /* These styles are needed for animation, will be moved to App.css */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .renderer-container {
          margin-bottom: 1rem;
        }
        
        .render-button {
          background-color: #3b82f6;
          color: white;
          font-weight: 500;
          padding: 0.625rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          margin-bottom: 1rem;
        }
        
        .render-button:hover:not(:disabled) {
          background-color: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(37, 99, 235, 0.1);
        }
        
        .render-button:disabled {
          background-color: #94a3b8;
          cursor: not-allowed;
        }
        
        .loading-spinner-small {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        
        .error-title {
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .error-message {
          font-family: 'JetBrains Mono', monospace;
          padding: 12px;
          background-color: rgba(0,0,0,0.1);
          border-radius: 6px;
          overflow-x: auto;
          margin-bottom: 8px;
          white-space: pre-wrap;
        }
        
        .error-tip {
          font-size: 13px;
          padding-top: 8px;
        }
        
        .empty-renderer {
          text-align: center;
          color: #64748b;
          padding: 2rem;
        }
        
        .react-icon {
          font-size: 48px;
          margin-bottom: 1rem;
        }
        
        .renderer-hint {
          font-size: 13px;
          color: #94a3b8;
          margin-top: 12px;
        }
        
        .rendered-component {
          width: 100%;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
};

export default DynamicComponentRenderer;