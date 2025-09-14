import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import NativeReleaseLogger, { NativeFileInfo, NativeDeviceInfo } from './NativeReleaseLogger';

export interface PlatformLoggerInterface {
  getDocumentsPath(): Promise<string>;
  writeLogEntry(filePath: string, logEntry: string): Promise<void>;
  getFileSize(filePath: string): Promise<number>;
  readLogFile(filePath: string): Promise<string>;
  deleteLogFile(filePath: string): Promise<void>;
  listLogFiles(directoryPath: string): Promise<string[]>;
  createDirectory(directoryPath: string): Promise<void>;
  fileExists(filePath: string): Promise<boolean>;
  getDeviceInfo(): Promise<NativeDeviceInfo>;
}

class NativePlatformLogger implements PlatformLoggerInterface {
  async getDocumentsPath(): Promise<string> {
    try {
      return await NativeReleaseLogger.getDocumentsPath();
    } catch (error) {
      // Fallback to react-native-fs
      return RNFS.DocumentDirectoryPath;
    }
  }

  async writeLogEntry(filePath: string, logEntry: string): Promise<void> {
    try {
      await NativeReleaseLogger.writeLogEntry(filePath, logEntry);
    } catch (error) {
      // Fallback to react-native-fs
      await RNFS.appendFile(filePath, logEntry, 'utf8');
    }
  }

  async getFileSize(filePath: string): Promise<number> {
    try {
      return await NativeReleaseLogger.getFileSize(filePath);
    } catch (error) {
      // Fallback to react-native-fs
      try {
        const stat = await RNFS.stat(filePath);
        return stat.size;
      } catch {
        return 0;
      }
    }
  }

  async readLogFile(filePath: string): Promise<string> {
    try {
      return await NativeReleaseLogger.readLogFile(filePath);
    } catch (error) {
      // Fallback to react-native-fs
      try {
        return await RNFS.readFile(filePath, 'utf8');
      } catch {
        return '';
      }
    }
  }

  async deleteLogFile(filePath: string): Promise<void> {
    try {
      await NativeReleaseLogger.deleteLogFile(filePath);
    } catch (error) {
      // Fallback to react-native-fs
      try {
        await RNFS.unlink(filePath);
      } catch {
        // File might not exist, ignore error
      }
    }
  }

  async listLogFiles(directoryPath: string): Promise<string[]> {
    try {
      const files = await NativeReleaseLogger.listLogFiles(directoryPath);
      return files.map((file: NativeFileInfo) => file.name);
    } catch (error) {
      // Fallback to react-native-fs
      try {
        const items = await RNFS.readDir(directoryPath);
        return items.map(item => item.name);
      } catch {
        return [];
      }
    }
  }

  async createDirectory(directoryPath: string): Promise<void> {
    try {
      await NativeReleaseLogger.createDirectory(directoryPath);
    } catch (error) {
      // Fallback to react-native-fs
      const exists = await RNFS.exists(directoryPath);
      if (!exists) {
        await RNFS.mkdir(directoryPath);
      }
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      return await NativeReleaseLogger.fileExists(filePath);
    } catch (error) {
      // Fallback to react-native-fs
      return await RNFS.exists(filePath);
    }
  }

  async getDeviceInfo(): Promise<NativeDeviceInfo> {
    try {
      return await NativeReleaseLogger.getDeviceInfo();
    } catch (error) {
      // Fallback device info
      return {
        platform: Platform.OS as 'ios' | 'android',
        model: 'Unknown',
        version: Platform.Version.toString(),
      };
    }
  }
}

class FallbackPlatformLogger implements PlatformLoggerInterface {
  async getDocumentsPath(): Promise<string> {
    return RNFS.DocumentDirectoryPath;
  }

  async writeLogEntry(filePath: string, logEntry: string): Promise<void> {
    await RNFS.appendFile(filePath, logEntry, 'utf8');
  }

  async getFileSize(filePath: string): Promise<number> {
    try {
      const stat = await RNFS.stat(filePath);
      return stat.size;
    } catch {
      return 0;
    }
  }

  async readLogFile(filePath: string): Promise<string> {
    try {
      return await RNFS.readFile(filePath, 'utf8');
    } catch {
      return '';
    }
  }

  async deleteLogFile(filePath: string): Promise<void> {
    try {
      await RNFS.unlink(filePath);
    } catch {
      // File might not exist, ignore error
    }
  }

  async listLogFiles(directoryPath: string): Promise<string[]> {
    try {
      const items = await RNFS.readDir(directoryPath);
      return items.map(item => item.name);
    } catch {
      return [];
    }
  }

  async createDirectory(directoryPath: string): Promise<void> {
    const exists = await RNFS.exists(directoryPath);
    if (!exists) {
      await RNFS.mkdir(directoryPath);
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    return await RNFS.exists(filePath);
  }

  async getDeviceInfo(): Promise<NativeDeviceInfo> {
    return {
      platform: Platform.OS as 'ios' | 'android',
      model: 'Unknown',
      version: Platform.Version.toString(),
    };
  }
}

// Create platform logger instance
let platformLogger: PlatformLoggerInterface;

try {
  // Try to use native implementation first
  platformLogger = new NativePlatformLogger();
} catch (error) {
  // Fallback to react-native-fs implementation
  platformLogger = new FallbackPlatformLogger();
}

export default platformLogger;
