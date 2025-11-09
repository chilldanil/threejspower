import React, { useState, useEffect, useRef } from 'react';
import { ScrollHouseViewer } from './ScrollHouseViewer';

export const TestPage: React.FC = () => {
  const [testTime, setTestTime] = useState<Date>(new Date());
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [weatherType, setWeatherType] = useState<'clear' | 'cloudy' | 'rainy' | 'foggy'>('clear');
  const [isPlaying, setIsPlaying] = useState(false);
  const lastUpdateRef = useRef<number>(Date.now());

  // Update time when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      setTestTime(prevTime => {
        const acceleratedDelta = deltaMs * timeSpeed;
        return new Date(prevTime.getTime() + acceleratedDelta);
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isPlaying, timeSpeed]);

  const presetTimes = [
    { label: 'Midnight', hours: 0, minutes: 0 },
    { label: 'Sunrise', hours: 6, minutes: 30 },
    { label: 'Morning', hours: 9, minutes: 0 },
    { label: 'Noon', hours: 12, minutes: 0 },
    { label: 'Afternoon', hours: 15, minutes: 0 },
    { label: 'Sunset', hours: 18, minutes: 30 },
    { label: 'Dusk', hours: 20, minutes: 0 },
    { label: 'Night', hours: 22, minutes: 0 },
  ];

  const setPresetTime = (hours: number, minutes: number) => {
    const newTime = new Date(testTime);
    newTime.setHours(hours, minutes, 0, 0);
    setTestTime(newTime);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Test Controls Panel */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 2000,
        background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        padding: '24px',
        borderRadius: '16px',
        border: '2px solid rgba(74, 158, 255, 0.4)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        minWidth: '380px',
        maxHeight: '80vh',
        overflowY: 'auto',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          marginBottom: '20px',
          color: '#4a9eff',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          borderBottom: '2px solid rgba(74, 158, 255, 0.3)',
          paddingBottom: '10px'
        }}>
          🧪 Environment Test Controls
        </div>

        {/* Time Controls */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#aaa' }}>
            TIME CONTROL
          </div>

          {/* Current Time Display */}
          <div style={{
            padding: '12px',
            background: 'rgba(74, 158, 255, 0.1)',
            borderRadius: '8px',
            marginBottom: '12px',
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: 'monospace',
            color: '#4a9eff'
          }}>
            {testTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>

          {/* Time Input */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', opacity: 0.8 }}>
              Manual Time
            </label>
            <input
              type="time"
              value={`${String(testTime.getHours()).padStart(2, '0')}:${String(testTime.getMinutes()).padStart(2, '0')}`}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const newTime = new Date(testTime);
                newTime.setHours(hours, minutes, 0, 0);
                setTestTime(newTime);
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid rgba(74, 158, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Preset Times */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', opacity: 0.8 }}>
              Quick Presets
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px'
            }}>
              {presetTimes.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setPresetTime(preset.hours, preset.minutes)}
                  style={{
                    padding: '8px 4px',
                    background: 'rgba(74, 158, 255, 0.2)',
                    border: '1px solid rgba(74, 158, 255, 0.3)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: 600
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(74, 158, 255, 0.4)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(74, 158, 255, 0.2)'}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Speed */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', opacity: 0.8 }}>
              Time Speed: {timeSpeed === 1 ? 'Real-time' : `${timeSpeed}x`}
            </label>
            <input
              type="range"
              min="1"
              max="3600"
              step="1"
              value={timeSpeed}
              onChange={(e) => setTimeSpeed(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#4a9eff'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              opacity: 0.6,
              marginTop: '4px'
            }}>
              <span>1x</span>
              <span>60x (1min/sec)</span>
              <span>3600x (1hr/sec)</span>
            </div>
          </div>

          {/* Play/Pause */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                flex: 1,
                padding: '12px',
                background: isPlaying ? 'rgba(255, 107, 74, 0.3)' : 'rgba(74, 255, 158, 0.3)',
                border: `1px solid ${isPlaying ? 'rgba(255, 107, 74, 0.5)' : 'rgba(74, 255, 158, 0.5)'}`,
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              onClick={() => setTestTime(new Date())}
              style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(74, 158, 255, 0.2)',
                border: '1px solid rgba(74, 158, 255, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🔄 Now
            </button>
          </div>
        </div>

        {/* Weather Controls */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#aaa' }}>
            WEATHER
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {(['clear', 'cloudy', 'rainy', 'foggy'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setWeatherType(type)}
                style={{
                  padding: '12px',
                  background: weatherType === type
                    ? 'rgba(74, 158, 255, 0.4)'
                    : 'rgba(74, 158, 255, 0.1)',
                  border: `2px solid ${weatherType === type
                    ? 'rgba(74, 158, 255, 0.8)'
                    : 'rgba(74, 158, 255, 0.2)'}`,
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {type === 'clear' && '☀️ '}
                {type === 'cloudy' && '☁️ '}
                {type === 'rainy' && '🌧️ '}
                {type === 'foggy' && '🌫️ '}
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{
          padding: '12px',
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '8px',
          fontSize: '11px',
          lineHeight: '1.6',
          opacity: 0.9
        }}>
          <div style={{ fontWeight: 600, marginBottom: '4px', color: '#ffc107' }}>
            ℹ️ Test Mode Active
          </div>
          Manipulate time and weather to test lighting conditions. Scroll the page normally to navigate camera views.
        </div>

        {/* Back to Main */}
        <a
          href="/"
          style={{
            display: 'block',
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            textAlign: 'center',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          ← Back to Main Page
        </a>
      </div>

      {/* Render ScrollHouseViewer with test props */}
      <ScrollHouseViewer
        testMode={true}
        testTime={testTime}
        testWeather={{ type: weatherType, intensity: 0.7 }}
        onTimeUpdate={setTestTime}
      />
    </div>
  );
};
