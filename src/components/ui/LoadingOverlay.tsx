/**
 * Loading overlay component - displays loading progress
 */

import React from 'react';

interface LoadingOverlayProps {
  progress: number; // 0-100
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ progress }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #2d3561 100%)',
      color: '#fff',
      zIndex: 1000
    }}>
      <div style={{ fontSize: '28px', marginBottom: '20px', fontWeight: 300 }}>
        Loading your experience...
      </div>
      <div style={{
        width: '400px',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #4a9eff, #7b68ee)',
          transition: 'width 0.3s'
        }} />
      </div>
    </div>
  );
};
