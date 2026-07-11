import { v4 as uuidv4 } from 'uuid';
import { PerformanceReport } from '../types';

export class PerformanceTracker {
  private activeTimers: Map<string, { label: string; startTime: number }> = new Map();
  private durations: Map<string, number[]> = new Map();

  startTimer(label: string): string {
    const timerId = uuidv4();
    this.activeTimers.set(timerId, {
      label,
      startTime: Date.now()
    });
    return timerId;
  }

  stopTimer(timerId: string): number {
    const timer = this.activeTimers.get(timerId);
    if (!timer) {
      throw new Error(`Timer with id ${timerId} not found`);
    }

    const duration = Date.now() - timer.startTime;
    this.activeTimers.delete(timerId);

    const list = this.durations.get(timer.label) || [];
    list.push(duration);
    this.durations.set(timer.label, list);

    return duration;
  }

  getReport(): PerformanceReport {
    const report: PerformanceReport = {};
    for (const [label, times] of this.durations.entries()) {
      if (times.length === 0) continue;
      const sum = times.reduce((a, b) => a + b, 0);
      const min = Math.min(...times);
      const max = Math.max(...times);
      const avg = sum / times.length;

      report[label] = {
        avgDuration: avg,
        minDuration: min,
        maxDuration: max,
        count: times.length
      };
    }
    return report;
  }
}
