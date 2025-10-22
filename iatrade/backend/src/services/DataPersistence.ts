import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger.js';

interface AITrader {
  name: string;
  balance: number;
  status: 'analyzing' | 'trading' | 'waiting';
  strategy: string;
  winRate: number;
  trades: number;
  totalPnL: number;
  color: string;
}

interface ChartDataPoint {
  time: string;
  [key: string]: number | string;
}

interface TradeMessage {
  trader: string;
  message: string;
  timestamp: string;
}

interface AppData {
  aiTraders: AITrader[];
  chartData: ChartDataPoint[];
  messages: TradeMessage[];
  timeElapsed: number;
  lastUpdate: string;
}

export class DataPersistence {
  private dataPath: string;
  private saveInterval: NodeJS.Timeout | null = null;
  private pendingSave: boolean = false;
  private currentData: AppData | null = null;

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'trading-data.json');
  }

  async initialize(): Promise<void> {
    try {
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(this.dataPath);
      await fs.mkdir(dataDir, { recursive: true });

      // Try to load existing data
      await this.load();

      logger.info('Data persistence initialized');
    } catch (error) {
      logger.error('Error initializing data persistence:', error);
    }
  }

  async load(): Promise<AppData | null> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      this.currentData = JSON.parse(data);
      logger.info('Data loaded from disk');
      return this.currentData;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.info('No existing data file found, starting fresh');
        this.currentData = null;
        return null;
      }
      logger.error('Error loading data:', error);
      return null;
    }
  }

  async save(data: AppData): Promise<void> {
    try {
      this.currentData = data;
      this.pendingSave = true;

      // Debounce: save after a short delay to avoid too frequent writes
      if (!this.saveInterval) {
        this.saveInterval = setTimeout(async () => {
          if (this.pendingSave && this.currentData) {
            await this.performSave(this.currentData);
            this.pendingSave = false;
          }
          this.saveInterval = null;
        }, 1000); // Save 1 second after last update
      }
    } catch (error) {
      logger.error('Error queuing save:', error);
    }
  }

  private async performSave(data: AppData): Promise<void> {
    try {
      const dataToSave = {
        ...data,
        lastUpdate: new Date().toISOString()
      };

      await fs.writeFile(
        this.dataPath,
        JSON.stringify(dataToSave, null, 2),
        'utf-8'
      );

      logger.debug('Data saved to disk');
    } catch (error) {
      logger.error('Error saving data to disk:', error);
    }
  }

  async forceSave(): Promise<void> {
    if (this.saveInterval) {
      clearTimeout(this.saveInterval);
      this.saveInterval = null;
    }

    if (this.currentData) {
      await this.performSave(this.currentData);
      this.pendingSave = false;
    }
  }

  getCurrentData(): AppData | null {
    return this.currentData;
  }
}
