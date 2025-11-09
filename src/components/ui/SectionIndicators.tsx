/**
 * Section indicators component - shows dots on the right side indicating current section
 */

import React from 'react';

interface SectionIndicatorsProps {
  sectionCount: number;
  currentSection: number;
}

export const SectionIndicators: React.FC<SectionIndicatorsProps> = ({
  sectionCount,
  currentSection
}) => {
  return (
    <div style={{
      position: 'fixed',
      right: '30px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {Array.from({ length: sectionCount }).map((_, index) => (
        <div
          key={index}
          style={{
            width: currentSection === index ? '40px' : '8px',
            height: '3px',
            background: currentSection === index
              ? 'linear-gradient(90deg, #4a9eff, #7b68ee)'
              : 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
            transition: 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
            boxShadow: currentSection === index ? '0 0 10px rgba(74, 158, 255, 0.5)' : 'none'
          }}
        />
      ))}
    </div>
  );
};
