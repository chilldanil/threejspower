/**
 * Scroll sections component - displays content sections with parallax effect
 */

import React from 'react';
import type { CameraKeyframe } from '../../types/three';

interface ScrollSectionsProps {
  keyframes: CameraKeyframe[];
  currentSection: number;
  scrollProgress: number;
}

export const ScrollSections: React.FC<ScrollSectionsProps> = ({
  keyframes,
  currentSection,
  scrollProgress
}) => {
  return (
    <>
      {keyframes.map((keyframe, index) => {
        const parallaxOffset = (scrollProgress - index / keyframes.length) * 50;
        const isActive = currentSection === index;

        return (
          <section
            key={index}
            style={{
              position: 'relative',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
              padding: '0 8%',
              zIndex: 10,
              pointerEvents: 'none'
            }}
          >
            <div style={{
              maxWidth: '600px',
              color: '#fff',
              opacity: isActive ? 1 : 0.2,
              transform: `translateY(${isActive ? 0 : 30}px) translateX(${parallaxOffset}px) scale(${isActive ? 1 : 0.95})`,
              transition: 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
              pointerEvents: 'auto',
              background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.85) 0%, rgba(45, 53, 97, 0.75) 100%)',
              backdropFilter: 'blur(20px)',
              padding: '40px',
              borderRadius: '16px',
              border: '1px solid rgba(74, 158, 255, 0.2)',
              boxShadow: isActive ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(74, 158, 255, 0.1)' : '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '4px',
                color: '#4a9eff',
                marginBottom: '16px',
                opacity: isActive ? 1 : 0.5,
                transition: 'opacity 0.6s ease'
              }}>
                Chapter {String(index + 1).padStart(2, '0')}
                <span style={{
                  margin: '0 12px',
                  opacity: 0.3
                }}>•</span>
                {String(keyframes.length).padStart(2, '0')} Views
              </div>
              <h2 style={{
                fontSize: '56px',
                fontWeight: 800,
                marginBottom: '20px',
                lineHeight: 1.1,
                textShadow: '0 4px 30px rgba(0,0,0,0.7)',
                background: 'linear-gradient(135deg, #ffffff 0%, #4a9eff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {keyframe.label}
              </h2>
              <p style={{
                fontSize: '18px',
                lineHeight: 1.8,
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 300,
                marginBottom: '24px'
              }}>
                {keyframe.description}
              </p>
              <div style={{
                height: '3px',
                width: isActive ? '100%' : '0%',
                background: 'linear-gradient(90deg, #4a9eff, #7b68ee)',
                transition: 'width 0.8s ease',
                borderRadius: '2px',
                opacity: isActive ? 1 : 0
              }} />
            </div>
          </section>
        );
      })}
    </>
  );
};
