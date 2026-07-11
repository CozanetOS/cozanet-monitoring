import { HealthCheck } from '../types';

export class HealthMonitor {
  readonly id = 'monitoring:health';
  private checks: Map<string, () => Promise<boolean>> = new Map();
  private lastChecks: Map<string, HealthCheck> = new Map();

  registerCheck(engineId: string, checkFn: () => Promise<boolean>): void {
    this.checks.set(engineId, checkFn);
  }

  async runChecks(): Promise<HealthCheck[]> {
    const results: HealthCheck[] = [];
    for (const [engineId, checkFn] of this.checks.entries()) {
      const start = Date.now();
      let status: 'healthy' | 'degraded' | 'down' = 'healthy';
      let latency = 0;

      try {
        const healthy = await checkFn();
        latency = Date.now() - start;
        if (!healthy) {
          status = 'degraded';
        }
      } catch (error) {
        latency = Date.now() - start;
        status = 'down';
      }

      const check: HealthCheck = {
        engineId,
        status,
        latency,
        checkedAt: Date.now()
      };
      this.lastChecks.set(engineId, check);
      results.push(check);
    }
    return results;
  }

  getStatus(engineId: string): HealthCheck | null {
    return this.lastChecks.get(engineId) || null;
  }

  isHealthy(): boolean {
    if (this.lastChecks.size === 0) return true;
    for (const check of this.lastChecks.values()) {
      if (check.status === 'down') {
        return false;
      }
    }
    return true;
  }
}
