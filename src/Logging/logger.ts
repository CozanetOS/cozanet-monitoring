import pino from 'pino';
import { LogEntry } from '../types';

export class SystemLogger {
  private pinoLogger: pino.Logger;
  private memoryLogs: LogEntry[] = [];

  constructor() {
    this.pinoLogger = pino({
      level: 'info',
      transport: process.env.NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: { colorize: true }
      } : undefined
    });
  }

  log(level: 'info' | 'warn' | 'error' | 'debug', engineId: string, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const entry: LogEntry = { level, engineId, message, timestamp, meta };
    
    // Maintain brief memory logs limit
    this.memoryLogs.push(entry);
    if (this.memoryLogs.length > 1000) {
      this.memoryLogs.shift();
    }

    // Call pino
    const payload = { engineId, meta, timestamp };
    switch (level) {
      case 'info': this.pinoLogger.info(payload, message); break;
      case 'warn': this.pinoLogger.warn(payload, message); break;
      case 'error': this.pinoLogger.error(payload, message); break;
      case 'debug': this.pinoLogger.debug(payload, message); break;
    }
  }

  getRecentLogs(limit: number = 50): LogEntry[] {
    return this.memoryLogs.slice(-limit);
  }

  exportLogs(): string {
    return JSON.stringify(this.memoryLogs, null, 2);
  }
}
