// Performance monitoring utilities

import type { PerformanceStats } from '../types';

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;
  private fpsHistory: number[] = [];
  private maxHistoryLength = 60;

  public update(): void {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount / deltaTime) * 1000);
      this.fpsHistory.push(this.fps);

      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift();
      }

      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  public getFPS(): number {
    return this.fps;
  }

  public getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  public getStats(): PerformanceStats {
    const memory = (performance as any).memory
      ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
      : 0;

    return {
      fps: this.fps,
      triangles: 0, // Will be updated by renderer
      drawCalls: 0, // Will be updated by renderer
      memory
    };
  }

  public reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 0;
    this.fpsHistory = [];
  }
}
