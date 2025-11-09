/**
 * Scroll indicator component - shows a hint to start scrolling
 */

import React from 'react';

interface ScrollIndicatorProps {
  visible: boolean;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ visible }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      color: '#fff',
      fontSize: '13px',
      textAlign: 'center',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.5s',
      pointerEvents: 'none'
    }}>
      <div style={{
        marginBottom: '12px',
        fontWeight: 400,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        fontSize: '11px',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        Begin Your Journey
      </div>
      <div style={{
        width: '2px',
        height: '50px',
        background: 'linear-gradient(180deg, transparent, #4a9eff, transparent)',
        margin: '0 auto',
        animation: 'scroll-bounce 2.5s ease-in-out infinite',
        boxShadow: '0 0 20px rgba(74, 158, 255, 0.5)'
      }} />
      <style>{`
        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
      `}</style>
    </div>
  );
};
