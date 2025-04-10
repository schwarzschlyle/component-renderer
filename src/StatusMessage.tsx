import React from 'react';

interface StatusMessageProps {
  message: string | null;
  type?: 'success' | 'error';
}

const StatusMessage: React.FC<StatusMessageProps> = ({ message, type = 'success' }) => {
  if (!message) return null;
  
  return (
    <div className={`status-message ${type}`}>
      {message}
    </div>
  );
};

export default StatusMessage;