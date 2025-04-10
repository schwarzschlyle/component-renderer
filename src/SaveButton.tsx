import React from 'react';

interface SaveButtonProps {
  saveComponent: () => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({ saveComponent }) => {
  return (
    <button 
      className="save-button"
      onClick={saveComponent}
    >
      Save Component
    </button>
  );
};

export default SaveButton;