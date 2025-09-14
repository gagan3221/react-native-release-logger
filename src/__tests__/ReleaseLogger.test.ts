import ReleaseLogger from '../ReleaseLogger';
import RNFS from 'react-native-fs';

// Mock RNFS
const mockRNFS = RNFS as jest.Mocked<typeof RNFS>;

describe('ReleaseLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRNFS.exists.mockResolvedValue(true);
    mockRNFS.mkdir.mockResolvedValue(undefined);
    mockRNFS.readDir.mockResolvedValue([]);
    mockRNFS.appendFile.mockResolvedValue(undefined);
    mockRNFS.stat.mockResolvedValue({ size: 0 } as any);
  });

  it('should create a logger instance with default config', () => {
    const logger = new ReleaseLogger();
    expect(logger).toBeInstanceOf(ReleaseLogger);
  });

  it('should create a logger instance with custom config', () => {
    const config = {
      maxFileSize: 1024 * 1024,
      maxFiles: 3,
      filePrefix: 'test-log',
    };
    const logger = new ReleaseLogger(config);
    expect(logger).toBeInstanceOf(ReleaseLogger);
  });

  it('should log messages', () => {
    const logger = new ReleaseLogger();
    
    // These should not throw
    logger.log('test message');
    logger.info('info message');
    logger.warn('warning message');
    logger.error('error message');
    logger.debug('debug message');
  });

  it('should handle getLogs', async () => {
    mockRNFS.readFile.mockResolvedValue('test log content');
    
    const logger = new ReleaseLogger();
    const logs = await logger.getLogs();
    
    expect(logs).toBe('test log content');
  });

  it('should handle clearLogs', async () => {
    mockRNFS.readDir.mockResolvedValue(['app-log-2023-12-07.log']);
    
    const logger = new ReleaseLogger();
    await logger.clearLogs();
    
    expect(mockRNFS.unlink).toHaveBeenCalled();
  });

  it('should handle getLogFiles', async () => {
    const mockFiles = ['app-log-2023-12-07.log', 'other-file.txt'];
    mockRNFS.readDir.mockResolvedValue(mockFiles);
    
    const logger = new ReleaseLogger();
    const files = await logger.getLogFiles();
    
    expect(files).toEqual(mockFiles);
  });

  it('should handle exportLogs', async () => {
    mockRNFS.readDir.mockResolvedValue(['app-log-2023-12-07.log']);
    mockRNFS.readFile.mockResolvedValue('test log content');
    
    const logger = new ReleaseLogger();
    const exportedLogs = await logger.exportLogs();
    
    expect(exportedLogs).toContain('test log content');
  });

  it('should handle errors gracefully', async () => {
    mockRNFS.readFile.mockRejectedValue(new Error('File not found'));
    
    const logger = new ReleaseLogger();
    const logs = await logger.getLogs();
    
    expect(logs).toBe('');
  });
});
