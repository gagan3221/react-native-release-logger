import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import {
  initializeReleaseLogger,
  getReleaseLogger,
  replaceConsole,
  restoreConsole,
} from 'react-native-release-logger';

const App = () => {
  const [logger, setLogger] = useState<any>(null);
  const [logs, setLogs] = useState<string>('');
  const [logFiles, setLogFiles] = useState<string[]>([]);
  const [consoleReplaced, setConsoleReplaced] = useState(false);

  useEffect(() => {
    // Initialize the logger when the app starts
    const loggerInstance = initializeReleaseLogger({
      maxFileSize: 1024 * 1024, // 1MB for demo purposes
      maxFiles: 3,
      filePrefix: 'demo-log',
      minLevel: 'debug',
    });
    
    setLogger(loggerInstance);
    
    // Log app startup
    loggerInstance.info('App started successfully');
  }, []);

  const handleLogDemo = () => {
    if (!logger) return;
    
    logger.log('Demo log message', { timestamp: Date.now() });
    logger.info('Demo info message', { user: 'demo-user' });
    logger.warn('Demo warning message');
    logger.error('Demo error message', new Error('Demo error'));
    logger.debug('Demo debug message', { debugData: true });
    
    Alert.alert('Success', 'Demo logs have been written to file!');
  };

  const handleConsoleDemo = () => {
    console.log('This is a console.log message');
    console.info('This is a console.info message');
    console.warn('This is a console.warn message');
    console.error('This is a console.error message');
    
    Alert.alert('Success', 'Console messages logged!');
  };

  const handleReplaceConsole = () => {
    if (consoleReplaced) {
      restoreConsole();
      setConsoleReplaced(false);
      Alert.alert('Console Restored', 'Original console methods restored');
    } else {
      replaceConsole({
        maxFileSize: 1024 * 1024,
        maxFiles: 3,
        filePrefix: 'console-log',
      });
      setConsoleReplaced(true);
      Alert.alert('Console Replaced', 'Console methods now log to files');
    }
  };

  const handleGetLogs = async () => {
    if (!logger) return;
    
    try {
      const currentLogs = await logger.getLogs();
      setLogs(currentLogs);
    } catch (error) {
      Alert.alert('Error', 'Failed to get logs');
    }
  };

  const handleGetLogFiles = async () => {
    if (!logger) return;
    
    try {
      const files = await logger.getLogFiles();
      setLogFiles(files);
    } catch (error) {
      Alert.alert('Error', 'Failed to get log files');
    }
  };

  const handleExportLogs = async () => {
    if (!logger) return;
    
    try {
      const allLogs = await logger.exportLogs();
      if (allLogs) {
        Share.share({
          message: allLogs,
          title: 'Application Logs',
        });
      } else {
        Alert.alert('No Logs', 'No logs available to export');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export logs');
    }
  };

  const handleClearLogs = async () => {
    if (!logger) return;
    
    try {
      await logger.clearLogs();
      setLogs('');
      setLogFiles([]);
      Alert.alert('Success', 'All logs cleared');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear logs');
    }
  };

  const handleSimulateError = () => {
    if (!logger) return;
    
    try {
      // Simulate an error
      throw new Error('Simulated application error for testing');
    } catch (error) {
      logger.error('Caught application error:', error);
      Alert.alert('Error Logged', 'Simulated error has been logged to file');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.title}>React Native Release Logger</Text>
          <Text style={styles.subtitle}>Demo Application</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logging Actions</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleLogDemo}>
            <Text style={styles.buttonText}>Write Demo Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleConsoleDemo}>
            <Text style={styles.buttonText}>Test Console Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, consoleReplaced && styles.buttonActive]} 
            onPress={handleReplaceConsole}
          >
            <Text style={styles.buttonText}>
              {consoleReplaced ? 'Restore Console' : 'Replace Console'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSimulateError}>
            <Text style={styles.buttonText}>Simulate Error</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log Management</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleGetLogs}>
            <Text style={styles.buttonText}>Get Current Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleGetLogFiles}>
            <Text style={styles.buttonText}>List Log Files</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleExportLogs}>
            <Text style={styles.buttonText}>Export All Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearLogs}>
            <Text style={styles.buttonText}>Clear All Logs</Text>
          </TouchableOpacity>
        </View>

        {logFiles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Log Files ({logFiles.length})</Text>
            {logFiles.map((file, index) => (
              <Text key={index} style={styles.fileItem}>
                📄 {file}
              </Text>
            ))}
          </View>
        )}

        {logs && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Log Content</Text>
            <ScrollView style={styles.logsContainer} horizontal>
              <Text style={styles.logsText}>{logs}</Text>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#4CAF50',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fileItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  logsContainer: {
    maxHeight: 200,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
});

export default App;
