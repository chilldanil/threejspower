# House Viewer Guide 🏠

## Quick Start

Your house model viewer is now integrated into the platform! Here's how to use it:

### 1. Add Your House Model

Place your `haus.glb` file in the correct location:

```bash
# Put your model here:
public/models/haus.glb
```

### 2. Access the House Viewer

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`

3. Click the **"🏠 Your House"** button in the header to switch to house view mode

### 3. Navigation Controls

**Mouse Controls:**
- **Left Click + Drag**: Rotate around your house
- **Right Click + Drag**: Pan the view
- **Scroll Wheel**: Zoom in/out

**Keyboard Shortcuts:**
- **R**: Toggle auto-rotate (automatic flythrough)
- **G**: Toggle ground grid visibility
- **F**: Fit camera to house (reset view)
- **A**: Toggle axis helper

### 4. Features

**Professional Lighting:**
- Natural sunlight simulation with warm color temperature
- Sky light for ambient fill
- Backlight for depth and dimension
- High-quality shadow rendering (4096x4096)

**Advanced Rendering:**
- SSAO (Screen Space Ambient Occlusion) for realistic depth
- Optional bloom effect
- ACES tone mapping for cinematic look
- Anti-aliasing for smooth edges

**Architectural Presentation:**
- Sky gradient background (blue to horizon)
- Automatic model centering and scaling
- Ground plane with optional grid
- Optimized camera angles for best views

**Performance:**
- Draco compression support for smaller file sizes
- Efficient rendering pipeline
- Smooth 60 FPS on modern hardware
- Responsive to window resizing

### 5. Model Requirements

**Supported Formats:**
- `.glb` (recommended - binary GLTF)
- `.gltf` (with external textures)

**Best Practices:**
- Keep model under 50MB for web performance
- Use texture compression (Draco) when possible
- Include materials and textures in the .glb file
- Ensure model is properly scaled (real-world units preferred)
- Clean geometry (remove unused vertices, faces)

**Coordinate System:**
- Model should be centered or will be auto-centered
- +Y is up
- Model will be placed on ground automatically

### 6. Customization Options

You can customize the viewer by modifying the `HouseViewer` component props in `App.tsx`:

```tsx
<HouseViewer
  modelPath="/models/haus.glb"    // Change model path
  enableShadows={true}             // Toggle shadows
  enableSSAO={true}                // Toggle SSAO
  enableBloom={false}              // Toggle bloom effect
/>
```

### 7. Loading States

The viewer includes:
- **Loading progress bar** while model loads
- **Percentage indicator** for large files
- **Error handling** with helpful messages
- **Automatic retry** suggestions

### 8. Export Options (Future)

Coming soon:
- Screenshot capture
- 360° turntable video generation
- VR/AR view (WebXR)
- Annotations and measurements
- Material editor
- Lighting presets

---

## Troubleshooting

### Model Not Loading?

**Check:**
1. File is named exactly `haus.glb` (case-sensitive)
2. File is in `public/models/` folder
3. File is valid GLTF/GLB format
4. Browser console for error messages

**Common Issues:**
- **404 Error**: File path is wrong or file doesn't exist
- **Parsing Error**: File is corrupted or not valid GLB
- **Blank Screen**: Model might be too large or offset from origin

### Performance Issues?

**Optimize your model:**
1. Reduce polygon count (use decimation)
2. Optimize textures (resize large images)
3. Use Draco compression
4. Remove hidden geometry
5. Simplify materials

**Tools:**
- [glTF Transform](https://gltf-transform.dev/) - Optimize GLB files
- [Blender](https://www.blender.org/) - Model cleanup and export
- [gltf.report](https://gltf.report/) - Analyze model

### Camera Issues?

- Press **F** to reset camera to fit model
- Check model scale - should be in meters
- Adjust camera limits in code if needed

---

## Advanced Features

### Auto-Rotate for Presentations

Enable auto-rotate mode:
1. Press **R** key
2. Model will slowly rotate 360°
3. Perfect for client presentations
4. Press **R** again to stop

### Custom Camera Positions

Coming soon - save and load preset camera angles for:
- Front view
- Side views
- Aerial view
- Detail shots

### Lighting Presets

Future feature - one-click lighting presets:
- Morning light
- Noon (harsh shadows)
- Golden hour
- Sunset
- Night with interior lights
- Overcast (soft shadows)

---

## Technical Details

**Renderer Settings:**
- Tone Mapping: ACES Filmic
- Color Space: sRGB
- Shadow Quality: PCF Soft
- Max Pixel Ratio: 2x (performance)
- Power Preference: High Performance

**Post-Processing:**
- SSAO kernel radius: 16
- SSAO distance: 0.001 - 0.1
- Bloom strength: 0.3 (if enabled)

**Camera:**
- FOV: 50° (architectural standard)
- Near plane: 0.1m
- Far plane: 1000m
- Min distance: 5m
- Max distance: 100m
- Max polar angle: ~85° (prevents going underground)

---

## Tips for Best Results

1. **Model Preparation:**
   - Export from Blender with "Apply Transforms"
   - Include lighting baked into textures if possible
   - Use PBR materials (roughness/metallic workflow)

2. **Presentation:**
   - Start with auto-rotate for overview
   - Zoom into architectural details
   - Show from multiple angles
   - Highlight special features

3. **Client Meetings:**
   - Practice camera movement beforehand
   - Know keyboard shortcuts
   - Have preset views ready
   - Show both interior and exterior

4. **Screenshots:**
   - Position camera at hero angle
   - Enable SSAO for depth
   - Consider time-of-day lighting
   - Use browser's screenshot tool or F12 dev tools

---

## Next Steps

1. **Add your haus.glb** model to `public/models/`
2. **Test the viewer** - click "🏠 Your House" button
3. **Customize lighting** if needed (edit HouseViewer.tsx)
4. **Share with clients** - deploy to Vercel/Netlify

Enjoy your architectural flythrough! 🚁🏡
