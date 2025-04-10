import React from 'react';

interface SavedComponentListProps {
  savedComponents: string[];
  loadComponent: (code: string) => void;
  deleteComponent: (index: number) => void;
}

const SavedComponentList: React.FC<SavedComponentListProps> = ({ 
  savedComponents, 
  loadComponent, 
  deleteComponent 
}) => {
  if (savedComponents.length === 0) {
    return (
      <div className="empty-list">
        No saved components yet. Save your first component to see it here.
      </div>
    );
  }

  return (
    <div>
      {savedComponents.map((component, index) => {
        // Create a preview by extracting the first non-empty line
        const lines = component.split('\n').filter(line => line.trim());
        const preview = lines.length > 0 
          ? lines[0].substring(0, 25) + (lines[0].length > 25 ? '...' : '') 
          : 'Component ' + (index + 1);
        
        return (
          <div key={index} className="saved-component-item">
            <span>{preview}</span>
            <div>
              <button 
                className="load"
                onClick={() => loadComponent(component)}
                aria-label="Load component"
              >
                Load
              </button>
              <button 
                className="delete"
                onClick={() => deleteComponent(index)}
                aria-label="Delete component"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SavedComponentList;