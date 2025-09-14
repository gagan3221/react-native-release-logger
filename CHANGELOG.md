# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-07

### Added

- Initial release of react-native-release-logger
- File-based logging system for React Native release builds
- Automatic log rotation based on file size and count
- Support for multiple log levels (debug, log, info, warn, error)
- Console method replacement functionality
- TypeScript definitions and full TypeScript support
- Cross-platform support (iOS and Android)
- Log export and management utilities
- Comprehensive documentation and examples
- Example React Native application demonstrating usage
- Jest test suite with mocked dependencies

### Features

- **Core Logging**: Write logs to files with timestamps and log levels
- **Log Rotation**: Automatic file rotation when size limits are reached
- **Console Replacement**: Option to replace console methods to capture existing logs
- **Export Functionality**: Export all logs for debugging and analysis
- **Configurable**: Extensive configuration options for different use cases
- **Performance Optimized**: Asynchronous file writing with queue management
- **Error Handling**: Graceful error handling with fallback mechanisms
- **Stack Traces**: Automatic stack trace capture for error logs
