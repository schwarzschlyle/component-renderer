import React, { useState, useEffect } from 'react';
import BabelLoader from './BabelLoader';
import DynamicComponentRenderer from './DynamicComponentRenderer';
import SavedComponentList from './SavedComponentList';
import SaveButton from './SaveButton';
import StatusMessage from './StatusMessage';
import AIComponentGenerator from './AIComponentGenerator';
import './App.css'; // Import the CSS file

const SAVED_COMPONENTS_KEY = 'savedComponents';

const App = () => {
  // Fetch the saved components from localStorage
  const [savedComponents, setSavedComponents] = useState(() => {
    const stored = localStorage.getItem(SAVED_COMPONENTS_KEY);
    try {
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // State to hold the code in the textarea
  const [code, setCode] = useState(savedComponents.length > 0 ? savedComponents[0] : "");
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('success');
  const [showGeneratorPanel, setShowGeneratorPanel] = useState(false);

  // Save the current component code to localStorage
  const saveComponent = () => {
    // Prevent saving empty code
    if (!code.trim()) {
      setStatusMessage('Cannot save empty component.');
      setStatusType('error');
      return;
    }
    
    // Prevent duplicates
    if (savedComponents.includes(code)) {
      setStatusMessage('This component is already saved.');
      setStatusType('error');
      return;
    }
    
    const newList = [...savedComponents, code];
    setSavedComponents(newList);
    localStorage.setItem(SAVED_COMPONENTS_KEY, JSON.stringify(newList));
    setStatusMessage('Component saved successfully.');
    setStatusType('success');
  };

  // Load the saved component code into the textarea
  const loadComponent = (savedCode) => {
    setCode(savedCode);
    setStatusMessage('Component code loaded successfully. Render it below');
    setStatusType('success');
  };
  
  // Delete a component from localStorage
  const deleteComponent = (index) => {
    const newList = [...savedComponents];
    newList.splice(index, 1);
    setSavedComponents(newList);
    localStorage.setItem(SAVED_COMPONENTS_KEY, JSON.stringify(newList));
    
    // If we're currently viewing the deleted component, clear the editor
    if (code === savedComponents[index]) {
      setCode('');
    }
    
    setStatusMessage('Component deleted successfully.');
    setStatusType('success');
  };

  // Handle generated code from AI Component Generator
  const handleGeneratedCode = (generatedCode) => {
    setCode(generatedCode);
    setStatusMessage('Component generated successfully! You can now render it below.');
    setStatusType('success');
    // Automatically close the generator panel
    setShowGeneratorPanel(false);
  };

  // Clear the status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  return (
    <BabelLoader>
      {(isLoaded) => (
        <div className="app-container">
          {/* Left Sidebar with saved components */}
          <div className="sidebar">
            <h2>Saved Components</h2>
            <SavedComponentList 
              savedComponents={savedComponents} 
              loadComponent={loadComponent}
              deleteComponent={deleteComponent}
            />
          </div>

          {/* Main Content Area */}
          <div className="main-content">
            {/* Header */}
            <header>
              <h1>Dynamic React Component Renderer</h1>
            </header>

            {!isLoaded ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading Babel...</p>
              </div>
            ) : (
              <div style={{ padding: '32px' }}>
                {/* AI Generator Toggle Button */}
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowGeneratorPanel(!showGeneratorPanel)}
                    style={{
                      background: showGeneratorPanel ? '#475569' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M12 8V4H8"></path>
                      <rect x="2" y="2" width="20" height="8" rx="2"></rect>
                      <path d="M2 14h20"></path>
                      <path d="M2 20h20"></path>
                    </svg>
                    {showGeneratorPanel ? 'Hide AI Generator' : 'Generate Component with AI'}
                  </button>
                </div>
                
                {/* AI Component Generator */}
                {showGeneratorPanel && (
                  <div style={{ marginBottom: '24px' }}>
                    <AIComponentGenerator onGenerateCode={handleGeneratedCode} />
                  </div>
                )}
                
                {/* Code Editor Section */}
                <div className="code-editor-section">
                  <h2>Component Code</h2>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Write your component code here or use the AI generator..."
                  />
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <SaveButton saveComponent={saveComponent} />
                    <StatusMessage message={statusMessage} type={statusType} />
                  </div>
                </div>
                
                {/* Divider */}
                <hr />
                
                {/* Output Preview Section */}
                <div className="output-section">
                  <h2>Rendered Component</h2>
                  
                  <div className="component-preview">
                    <DynamicComponentRenderer code={code} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </BabelLoader>
  );
};

export default App;