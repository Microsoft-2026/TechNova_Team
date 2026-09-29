/**
 * Deal Intelligence Agent - Python ML Service IPC Bridge
 * Executes the Python ML service models and parses structured outputs.
 * Provides caching, failure handling, and auditable telemetry.
 */

import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

const PYTHON_SERVICE_DIR = path.resolve(process.cwd(), 'python-service');
const RUNNER_SCRIPT = path.join(PYTHON_SERVICE_DIR, 'run_inference.py');
const REGISTRY_FILE = path.resolve(process.cwd(), 'models', 'registry.json');

interface MlExecutionOptions {
  task: 'risk' | 'outcome' | 'cycle' | 'similar' | 'simulation' | 'forecast' | 'status' | 'model';
  dealId?: string;
  discount?: number;
  duration?: number;
  product?: string;
  modelName?: string;
  topK?: number;
}

export class PythonMlBridge {
  private static cache = new Map<string, { timestamp: number; data: any }>();
  private static CACHE_TTL_MS = 60 * 1000; // 1 minute cache

  public static async execute<T = any>(options: MlExecutionOptions): Promise<T> {
    const cacheKey = JSON.stringify(options);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data as T;
    }

    const args: string[] = [RUNNER_SCRIPT, '--task', options.task];

    if (options.dealId) {
      args.push('--deal-id', options.dealId);
    }
    if (options.discount !== undefined) {
      args.push('--discount', String(options.discount));
    }
    if (options.duration !== undefined) {
      args.push('--duration', String(options.duration));
    }
    if (options.product) {
      args.push('--product', options.product);
    }
    if (options.modelName) {
      args.push('--model-name', options.modelName);
    }
    if (options.topK !== undefined) {
      args.push('--top-k', String(options.topK));
    }

    return new Promise<T>((resolve, reject) => {
      execFile('python3', args, { cwd: process.cwd(), timeout: 10000 }, (error, stdout, stderr) => {
        if (error) {
          console.error(`[PythonMlBridge] Execution error on task=${options.task}:`, stderr || error.message);
          // Return structured error instead of crashing
          return resolve({
            status: 'MODEL_UNAVAILABLE',
            model: options.task,
            message: `ML model execution unavailable: ${error.message}`,
          } as unknown as T);
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          if (parsed && parsed.status !== 'MODEL_ERROR' && !parsed.error) {
            this.cache.set(cacheKey, { timestamp: Date.now(), data: parsed });
          }
          resolve(parsed as T);
        } catch (parseErr) {
          console.error('[PythonMlBridge] Failed to parse JSON output:', stdout);
          resolve({
            status: 'MODEL_ERROR',
            model: options.task,
            message: 'Invalid output received from Python ML service.',
          } as unknown as T);
        }
      });
    });
  }

  public static getModelRegistry(): any {
    if (fs.existsSync(REGISTRY_FILE)) {
      try {
        const raw = fs.readFileSync(REGISTRY_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {
        console.error('[PythonMlBridge] Error reading registry:', e);
      }
    }
    return {};
  }
}
