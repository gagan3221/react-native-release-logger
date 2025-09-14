module.exports = {
  dependencies: {
    'react-native-release-logger': {
      platforms: {
        android: {
          sourceDir: '../android/',
          packageImportPath: 'import com.reactnativereleaselogger.ReleaseLoggerPackage;',
        },
        ios: {
          podspecPath: '../ios/ReleaseLogger.podspec',
        },
      },
    },
  },
};
