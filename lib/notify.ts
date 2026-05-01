import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
}

export async function notify(title: string, message: string): Promise<void> {
  const script = `display notification "${message.replace(/"/g, '\\"')}" with title "${title.replace(/"/g, '\\"')}"`;

  try {
    execSync(`osascript -e '${script}'`, { stdio: 'ignore' });
  } catch (error) {
    console.warn('Failed to send notification:', error);
  }
}

export async function logToFile(
  logPath: string,
  message: string,
  level: LogEntry['level'] = 'info',
  context?: Record<string, unknown>
): Promise<void> {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && { context }),
  };

  const logLine = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${context ? ` ${JSON.stringify(context)}` : ''}\n`;

  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.appendFileSync(logPath, logLine);
}

export function getLogPath(date: Date = new Date()): string {
  const dateStr = date.toISOString().split('T')[0];
  return path.join(process.cwd(), 'logs', `pipeline-${dateStr}.log`);
}
