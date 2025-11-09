/**
 * Progress bar component - shows scroll progress at the top of the page
 */

import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-1
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '4px',
      background: 'rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        height: '100%',
        background: 'linear-gradient(90deg, #4a9eff 0%, #7b68ee 50%, #ff6b9d 100%)',
        width: `${progress * 100}%`,
        transition: 'width 0.1s ease-out',
        boxShadow: '0 0 20px rgba(74, 158, 255, 0.6)'
      }} />
    </div>
  );
};
