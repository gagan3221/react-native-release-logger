declare module 'react-native-fs' {
  export interface StatResult {
    name: string;
    path: string;
    size: number;
    mode: number;
    ctime: Date;
    mtime: Date;
    originalFilepath: string;
    isFile(): boolean;
    isDirectory(): boolean;
  }

  export interface ReadDirItem {
    ctime: Date | null;
    mtime: Date | null;
    name: string;
    path: string;
    size: string;
    isFile(): boolean;
    isDirectory(): boolean;
  }

  export const DocumentDirectoryPath: string;
  export const ExternalStorageDirectoryPath: string;
  export const TemporaryDirectoryPath: string;
  export const CachesDirectoryPath: string;
  export const ExternalCachesDirectoryPath: string;

  export function exists(filepath: string): Promise<boolean>;
  export function mkdir(filepath: string, options?: { NSURLIsExcludedFromBackupKey?: boolean }): Promise<void>;
  export function readDir(dirpath: string): Promise<ReadDirItem[]>;
  export function readFile(filepath: string, encoding?: string): Promise<string>;
  export function writeFile(filepath: string, contents: string, encoding?: string): Promise<void>;
  export function appendFile(filepath: string, contents: string, encoding?: string): Promise<void>;
  export function unlink(filepath: string): Promise<void>;
  export function stat(filepath: string): Promise<StatResult>;
  export function moveFile(filepath: string, destPath: string): Promise<void>;
  export function copyFile(filepath: string, destPath: string): Promise<void>;
}
