# React Native Release Logger - Example App

This is a demonstration app showing how to use the `react-native-release-logger` package.

## Features Demonstrated

- Basic logging with different log levels
- Console method replacement
- Log file management
- Log export functionality
- Error logging with stack traces

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. For iOS:
```bash
cd ios && pod install && cd ..
```

3. Run the app:
```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Usage

The example app provides buttons to:

1. **Write Demo Logs** - Creates sample log entries with different levels
2. **Test Console Messages** - Demonstrates console logging
3. **Replace Console** - Toggles console method replacement
4. **Simulate Error** - Creates an error with stack trace
5. **Get Current Logs** - Displays current log file content
6. **List Log Files** - Shows all available log files
7. **Export All Logs** - Shares all logs via the system share dialog
8. **Clear All Logs** - Removes all log files

## Log File Location

Logs are stored in the app's document directory under the `logs` folder:
- iOS: `Documents/logs/`
- Android: `Documents/logs/`

You can access these files through device file managers or by exporting them through the app.

## Testing in Release Mode

To test the logging functionality in release mode:

1. Build a release version of the app
2. Install it on a device
3. Use the app to generate logs
4. Export the logs to verify they're being captured

This is particularly useful since console logs are stripped from release builds, but the file logs will still be captured.
