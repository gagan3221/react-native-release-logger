// Mock react-native-fs for testing
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  ExternalStorageDirectoryPath: '/mock/external',
  exists: jest.fn(),
  mkdir: jest.fn(),
  readDir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  appendFile: jest.fn(),
  unlink: jest.fn(),
  stat: jest.fn(),
}));
