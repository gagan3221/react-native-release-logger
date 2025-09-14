import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-release-logger' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'cd ios && pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const ReleaseLoggerNative = NativeModules.ReleaseLogger
  ? NativeModules.ReleaseLogger
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export interface NativeFileInfo {
  name: string;
  path: string;
  size: number;
  lastModified: number;
}

export interface NativeDeviceInfo {
  platform: 'ios' | 'android';
  model: string;
  version: string;
  manufacturer?: string;
  sdkVersion?: number;
  systemName?: string;
  identifier?: string;
}

export interface NativeReleaseLoggerInterface {
  getDocumentsPath(): Promise<string>;
  getExternalStoragePath(): Promise<string>;
  writeLogEntry(filePath: string, logEntry: string): Promise<boolean>;
  getFileSize(filePath: string): Promise<number>;
  readLogFile(filePath: string): Promise<string>;
  deleteLogFile(filePath: string): Promise<boolean>;
  listLogFiles(directoryPath: string): Promise<NativeFileInfo[]>;
  createDirectory(directoryPath: string): Promise<boolean>;
  fileExists(filePath: string): Promise<boolean>;
  getDeviceInfo(): Promise<NativeDeviceInfo>;
}

export default ReleaseLoggerNative as NativeReleaseLoggerInterface;
