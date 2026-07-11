import { z } from 'zod';

export const MetricSchema = z.object({
  id: z.string(),
  engineId: z.string(),
  name: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  timestamp: z.number()
});

export type Metric = z.infer<typeof MetricSchema>;

export const HealthCheckSchema = z.object({
  engineId: z.string(),
  status: z.enum(['healthy', 'degraded', 'down']),
  latency: z.number(),
  checkedAt: z.number()
});

export type HealthCheck = z.infer<typeof HealthCheckSchema>;

export const AlertSchema = z.object({
  id: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  message: z.string(),
  engineId: z.string(),
  triggeredAt: z.number(),
  resolvedAt: z.number().optional()
});

export type Alert = z.infer<typeof AlertSchema>;

export interface LogEntry {
  level: string;
  engineId: string;
  message: string;
  timestamp: string;
  meta?: any;
}

export interface PerformanceReport {
  [label: string]: {
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    count: number;
  };
}

export interface DiagnosticsReport {
  timestamp: number;
  systemHealthy: boolean;
  activeAlertsCount: number;
  engineStatuses: Record<string, boolean>;
  memoryUsage: NodeJS.MemoryUsage;
}
