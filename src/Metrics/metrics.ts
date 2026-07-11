import { v4 as uuidv4 } from 'uuid';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Metric } from '../types';

export class MetricsCollector {
  readonly id = 'monitoring:metrics';
  private metrics: Metric[] = [];
  private supabase: SupabaseClient | null = null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_API_KEY;
    if (url && key) {
      this.supabase = createClient(url, key);
    }
  }

  record(engineId: string, name: string, value: number, unit?: string): void {
    const metric: Metric = {
      id: uuidv4(),
      engineId,
      name,
      value,
      unit,
      timestamp: Date.now()
    };
    this.metrics.push(metric);
  }

  getMetrics(engineId?: string, since?: number): Metric[] {
    return this.metrics.filter(m => {
      const matchEngine = !engineId || m.engineId === engineId;
      const matchSince = !since || m.timestamp >= since;
      return matchEngine && matchSince;
    });
  }

  aggregate(name: string): { avg: number; min: number; max: number; count: number } {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    const values = filtered.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = sum / values.length;

    return { avg, min, max, count: values.length };
  }

  async flush(): Promise<void> {
    if (!this.supabase || this.metrics.length === 0) {
      return;
    }

    const payload = this.metrics.map(m => ({
      metric_id: m.id,
      engine_id: m.engineId,
      name: m.name,
      value: m.value,
      unit: m.unit || null,
      timestamp: new Date(m.timestamp).toISOString()
    }));

    const { error } = await this.supabase
      .from('metrics')
      .insert(payload);

    if (error) {
      console.error('Failed to flush metrics to Supabase:', error.message);
    } else {
      this.metrics = []; // clear after successful flush
    }
  }
}
