# React Native Release Logger

A powerful logging solution for React Native applications that captures and stores console logs in release builds for debugging purposes. Unlike development builds where console logs are visible, release builds strip out console statements, making debugging production issues challenging. This package solves that problem by writing logs to files that can be retrieved and analyzed later.

## Features

- 📝 **File-based Logging**: Stores logs in text files on device storage
- 🔄 **Log Rotation**: Automatic file rotation based on size and count limits
- 🎯 **Multiple Log Levels**: Support for log, info, warn, error, and debug levels
- 📱 **Cross-platform**: Works on both iOS and Android with native optimizations
- 🚀 **Native Performance**: Platform-specific native modules for optimal file I/O
- 🔧 **TypeScript Support**: Full TypeScript definitions included
- 🎛️ **Configurable**: Extensive configuration options for different use cases
- 📤 **Export Functionality**: Easy log export for debugging and analysis
- 🔄 **Console Replacement**: Option to replace console methods automatically
- 🛡️ **Fallback Support**: Graceful fallback to JavaScript implementation if native modules fail

## Installation

```bash
npm install react-native-release-logger
# or
yarn add react-native-release-logger
```

### Additional Setup

This package depends on `react-native-fs` for file system operations. If you haven't already installed it:

```bash
npm install react-native-fs
# or
yarn add react-native-fs
```

For React Native 0.60+, run:
```bash
cd ios && pod install
```

For older versions, you may need to manually link the library.

### Android Setup

The package includes native Android modules for optimized performance. No additional setup is required for React Native 0.60+.

For manual linking (RN < 0.60):
1. Add to `android/settings.gradle`:
```gradle
include ':react-native-release-logger'
project(':react-native-release-logger').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-release-logger/android')
```

2. Add to `android/app/build.gradle`:
```gradle
dependencies {
    implementation project(':react-native-release-logger')
}
```

3. Add to `MainApplication.java`:
```java
import com.reactnativereleaselogger.ReleaseLoggerPackage;

@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new ReleaseLoggerPackage() // Add this line
    );
}
```

### iOS Setup

The package includes native iOS modules. For React Native 0.60+, CocoaPods will handle the integration automatically.

For manual linking (RN < 0.60), add the iOS files to your Xcode project.

## Quick Start

### Basic Usage

```typescript
import { initializeReleaseLogger } from 'react-native-release-logger';

// Initialize the logger
const logger = initializeReleaseLogger();

// Use it like console
logger.log('Application started');
logger.info('User logged in', { userId: 123 });
logger.warn('Low memory warning');
logger.error('API request failed', error);
logger.debug('Debug information', { data: someData });
```

### Replace Console Methods

```typescript
import { replaceConsole } from 'react-native-release-logger';

// Replace console methods with file logging
replaceConsole({
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 3,
});

// Now all console.log, console.error, etc. will be saved to files
console.log('This will be saved to a file!');
console.error('Errors are captured too!');
```

## Configuration

```typescript
import { initializeReleaseLogger, ReleaseLoggerConfig } from 'react-native-release-logger';

const config: ReleaseLoggerConfig = {
  maxFileSize: 5 * 1024 * 1024,    // 5MB per file (default)
  maxFiles: 5,                      // Keep 5 log files (default)
  logDirectory: undefined,          // Custom directory (optional)
  filePrefix: 'app-log',           // Log file prefix (default)
  enabled: true,                   // Enable/disable logging (default: true)
  minLevel: 'log',                 // Minimum log level (default: 'log')
  includeStackTrace: true,         // Include stack trace for errors (default: true)
};

const logger = initializeReleaseLogger(config);
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxFileSize` | number | 5MB | Maximum file size before rotation |
| `maxFiles` | number | 5 | Maximum number of log files to keep |
| `logDirectory` | string | `DocumentDirectoryPath/logs` | Custom log directory path |
| `filePrefix` | string | `'app-log'` | Prefix for log file names |
| `enabled` | boolean | `true` | Enable or disable logging |
| `minLevel` | LogLevel | `'log'` | Minimum log level to capture |
| `includeStackTrace` | boolean | `true` | Include stack traces for errors |

### Log Levels

The package supports five log levels in order of severity:
- `debug` (lowest)
- `log`
- `info`
- `warn`
- `error` (highest)

## API Reference

### Logger Instance Methods

```typescript
// Logging methods
logger.log(...args: any[]): void
logger.info(...args: any[]): void
logger.warn(...args: any[]): void
logger.error(...args: any[]): void
logger.debug(...args: any[]): void

// Utility methods
logger.getLogs(): Promise<string>           // Get current log file content
logger.clearLogs(): Promise<void>           // Clear all log files
logger.getLogFiles(): Promise<string[]>     // Get list of log files
logger.exportLogs(): Promise<string>        // Export all logs as single string
```

### Global Functions

```typescript
// Initialize logger with config
initializeReleaseLogger(config?: ReleaseLoggerConfig): LoggerInstance

// Get global logger instance
getReleaseLogger(): LoggerInstance

// Replace console methods
replaceConsole(config?: ReleaseLoggerConfig): void

// Restore original console methods
restoreConsole(): void
```

## Native Optimizations

This package includes platform-specific native modules that provide significant performance improvements over pure JavaScript implementations:

### Android Native Features
- **Optimized File I/O**: Direct file operations using Java NIO for better performance
- **Background Processing**: File operations don't block the JavaScript thread
- **Memory Efficient**: Streaming writes for large log files
- **Device Information**: Access to detailed Android device information
- **Storage Management**: Intelligent handling of internal vs external storage

### iOS Native Features  
- **Core Foundation Integration**: Uses native iOS file system APIs
- **Memory Management**: Automatic memory management for large files
- **Background Safety**: File operations are thread-safe
- **Device Information**: Access to iOS device details and identifiers
- **Sandbox Compliance**: Respects iOS app sandbox restrictions

### Fallback Mechanism
If native modules fail to load or encounter errors, the package automatically falls back to the JavaScript implementation using `react-native-fs`, ensuring your app continues to function normally.

## Advanced Usage

### Custom Log Directory

```typescript
import RNFS from 'react-native-fs';
import { initializeReleaseLogger } from 'react-native-release-logger';

const logger = initializeReleaseLogger({
  logDirectory: `${RNFS.ExternalStorageDirectoryPath}/MyAppLogs`,
  filePrefix: 'production-log',
  maxFileSize: 2 * 1024 * 1024, // 2MB files
  maxFiles: 10, // Keep 10 files
});
```

### Conditional Logging

```typescript
import { initializeReleaseLogger } from 'react-native-release-logger';

const logger = initializeReleaseLogger({
  enabled: !__DEV__, // Only enable in release builds
  minLevel: 'warn',  // Only log warnings and errors
});
```

### Exporting Logs for Analysis

```typescript
import { Share } from 'react-native';
import { getReleaseLogger } from 'react-native-release-logger';

const exportLogs = async () => {
  const logger = getReleaseLogger();
  const logs = await logger.exportLogs();
  
  if (logs) {
    Share.share({
      message: logs,
      title: 'Application Logs',
    });
  }
};
```

### Error Boundary Integration

```typescript
import React from 'react';
import { getReleaseLogger } from 'react-native-release-logger';

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: any) {
    const logger = getReleaseLogger();
    logger.error('React Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    // Error UI
  }
}
```

## File Format

Log files are stored in a human-readable format:

```
[2023-12-07T10:30:45.123Z] [LOG] Application started
[2023-12-07T10:30:46.456Z] [INFO] User logged in | Args: [{"userId":123}]
[2023-12-07T10:30:47.789Z] [WARN] Low memory warning
[2023-12-07T10:30:48.012Z] [ERROR] API request failed | Args: [{"message":"Network error"}] | Stack: Error: Network error
    at fetch (http://localhost:8081/index.bundle:12345:67)
    at ApiService.get (http://localhost:8081/index.bundle:23456:78)
```

## Best Practices

1. **Initialize Early**: Initialize the logger as early as possible in your app lifecycle
2. **Use Appropriate Log Levels**: Use different log levels appropriately (debug for development info, error for actual errors)
3. **Monitor File Size**: Configure appropriate file sizes based on your app's logging volume
4. **Regular Cleanup**: Implement a mechanism to periodically clean up or export old logs
5. **Privacy Considerations**: Be mindful of logging sensitive user data
6. **Performance**: The logger is designed to be performant, but avoid excessive logging in tight loops

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Ensure the logger is initialized and enabled
2. **Permission errors**: Make sure your app has storage permissions
3. **File not found**: Check if the log directory exists and is accessible

### Debug Mode

```typescript
// Enable debug logging to see logger internal messages
const logger = initializeReleaseLogger({
  minLevel: 'debug',
});

// Check if logs are being written
logger.getLogFiles().then(files => {
  console.log('Log files:', files);
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on the [GitHub repository](https://github.com/yourusername/react-native-release-logger/issues).
