# Test Page Guide

## Overview

The Test Page (`/test` route) allows you to test different lighting and weather conditions in real-time without waiting for actual time to pass.

## How to Access

1. **Development mode:** Run `npm run dev` and navigate to `http://localhost:5173/test`
2. **Production build:** After `npm run build`, the test page is available at `/test`

## Features

### 🕐 Time Control

**Current Time Display**
- Shows the current simulated time in large format
- Updates in real-time when playing

**Manual Time Input**
- Use the time picker to set any specific time
- Changes apply instantly to lighting and sun position

**Quick Presets**
- **Midnight** (00:00) - Deep night with stars
- **Sunrise** (06:30) - Dawn colors and golden hour
- **Morning** (09:00) - Early morning light
- **Noon** (12:00) - Full daylight
- **Afternoon** (15:00) - Strong afternoon sun
- **Sunset** (18:30) - Golden hour and warm colors
- **Dusk** (20:00) - Twilight fading
- **Night** (22:00) - Night with moonlight

**Time Speed Slider**
- **1x** - Real-time (1 second = 1 second)
- **60x** - 1 minute per second
- **3600x** - 1 hour per second (fast time-lapse)
- Any value in between for custom speeds

**Play/Pause Button**
- ▶ Play: Time advances automatically at the selected speed
- ⏸ Pause: Freeze time at current moment
- 🔄 Now: Reset to current real-world time

### ☁️ Weather Control

**Weather Types**
- ☀️ **Clear** - Minimal clouds, bright sky
- ☁️ **Cloudy** - Many clouds, reduced lighting
- 🌧️ **Rainy** - Dark clouds + rain particles
- 🌫️ **Foggy** - Low clouds + reduced visibility

Each weather type instantly affects:
- Cloud count and opacity
- Rain particle visibility
- Fog density and range
- Overall lighting intensity
- Sky color saturation

## What Updates in Real-Time

When you change time or weather, these elements update instantly:

✅ **Celestial Objects**
- Sun position and visibility
- Moon position and visibility (opposite to sun)
- Star field opacity (only visible at night)

✅ **Lighting**
- Directional sunlight intensity and color
- Ambient light levels
- Hemisphere light colors
- Shadow intensity

✅ **Sky & Atmosphere**
- Sky gradient colors (top, middle, bottom)
- Fog color and density
- Exposure levels

✅ **Weather Effects**
- Cloud count and distribution
- Rain particles
- Weather-specific colors

## Use Cases

### Testing Lighting Conditions
1. Set time to specific hours to test:
   - Night lighting (00:00 - 05:00)
   - Sunrise colors (06:00 - 07:00)
   - Daylight (09:00 - 17:00)
   - Sunset colors (18:00 - 19:00)
   - Twilight (19:00 - 21:00)

### Testing Weather Effects
1. Switch between weather types to see:
   - Cloud density variations
   - Rain particle system
   - Fog visibility impact
   - Lighting changes in different conditions

### Time-lapse Testing
1. Set time speed to 3600x (1 hour/second)
2. Press Play
3. Watch a full day/night cycle in 24 seconds
4. Observe all lighting transitions

### Finding Perfect Moments
1. Use Play with medium speed (60x-300x)
2. Pause when you find interesting lighting
3. Fine-tune with manual time input
4. Test different weather at that time

## Tips

- **Camera Control**: Scroll the page normally to navigate between camera viewpoints
- **Combine Controls**: Try rainy + sunset, or foggy + night for dramatic effects
- **Performance**: Higher time speeds work best for observing transitions
- **Reset**: Click "🔄 Now" to return to real-world time

## Technical Details

The TestPage works by:
1. Overriding the normal time progression with test values
2. Passing `testMode={true}` to ScrollHouseViewer
3. Using React's reactive props to update the scene
4. Separate useEffect hooks handle instant updates for sun, lighting, and weather

All changes are reactive and apply immediately without page reload!
