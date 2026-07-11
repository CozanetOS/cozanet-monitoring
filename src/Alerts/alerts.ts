import EventEmitter from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { Metric, Alert } from '../types';

export class AlertEngine extends EventEmitter {
  readonly id = 'monitoring:alerts';
  private activeAlerts: Map<string, Alert> = new Map();
  private allAlerts: Alert[] = [];

  createAlert(metric: Metric, threshold: number): void {
    const id = uuidv4();
    const severity = metric.value > threshold * 1.5 ? 'critical' : 'high';
    const alert: Alert = {
      id,
      severity,
      message: `Metric ${metric.name} exceeded threshold ${threshold}. Current: ${metric.value}${metric.unit || ''}`,
      engineId: metric.engineId,
      triggeredAt: Date.now()
    };

    this.activeAlerts.set(id, alert);
    this.allAlerts.push(alert);
    this.emit('alert', alert);
  }

  onAlert(handler: (alert: Alert) => void): void {
    this.on('alert', handler);
  }

  resolveAlert(id: string): void {
    const alert = this.activeAlerts.get(id);
    if (alert) {
      alert.resolvedAt = Date.now();
      this.activeAlerts.delete(id);
      this.emit('resolved', alert);
    }
  }

  listActive(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }
}
