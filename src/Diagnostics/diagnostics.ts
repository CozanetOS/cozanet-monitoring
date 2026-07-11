import { DiagnosticsReport } from '../types';
import { HealthMonitor } from '../Health/health';
import { AlertEngine } from '../Alerts/alerts';

export class SystemDiagnostics {
  constructor(
    private healthMonitor: HealthMonitor,
    private alertEngine: AlertEngine
  ) {}

  async runDiagnostics(): Promise<DiagnosticsReport> {
    const activeAlerts = this.alertEngine.listActive();
    const healthChecks = await this.healthMonitor.runChecks();
    
    const engineStatuses: Record<string, boolean> = {};
    for (const check of healthChecks) {
      engineStatuses[check.engineId] = check.status === 'healthy';
    }

    const systemHealthy = this.healthMonitor.isHealthy() && activeAlerts.length === 0;

    return {
      timestamp: Date.now(),
      systemHealthy,
      activeAlertsCount: activeAlerts.length,
      engineStatuses,
      memoryUsage: process.memoryUsage()
    };
  }

  async checkEngines(engineIds: string[]): Promise<Record<string, boolean>> {
    const results = await this.healthMonitor.runChecks();
    const map: Record<string, boolean> = {};
    for (const id of engineIds) {
      const match = results.find(r => r.engineId === id);
      map[id] = match ? match.status === 'healthy' : false;
    }
    return map;
  }
}
