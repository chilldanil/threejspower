/**
 * Info panel component - displays real-time environment information
 */

import React from 'react';
import type { WeatherCondition } from '../../types/three';

interface InfoPanelProps {
  currentTime: Date;
  weather: WeatherCondition;
  sunAltitude: number;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  currentTime,
  weather,
  sunAltitude
}) => {
  const isDaytime = sunAltitude > 0;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 1000,
      background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(45, 53, 97, 0.85) 100%)',
      backdropFilter: 'blur(20px)',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid rgba(74, 158, 255, 0.3)',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: '13px',
      lineHeight: '1.8',
      minWidth: '220px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: '#4a9eff',
        marginBottom: '12px',
        fontWeight: 700
      }}>
        Live Environment
      </div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ opacity: 0.6 }}>Time:</span>{' '}
        <span style={{ fontWeight: 600 }}>
          {currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </span>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ opacity: 0.6 }}>Location:</span>{' '}
        <span style={{ fontWeight: 600 }}>Munich, DE</span>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ opacity: 0.6 }}>Weather:</span>{' '}
        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
          {weather.type} {isDaytime ? '☀️' : '🌙'}
        </span>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ opacity: 0.6 }}>Sun Alt:</span>{' '}
        <span style={{ fontWeight: 600 }}>
          {(sunAltitude * (180 / Math.PI)).toFixed(1)}°
        </span>
      </div>
      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(74, 158, 255, 0.2)',
        fontSize: '10px',
        opacity: 0.7
      }}>
        Physically accurate sun position & shadows
      </div>
    </div>
  );
};
