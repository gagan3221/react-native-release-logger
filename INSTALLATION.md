# Installation Guide - React Native Release Logger

This guide provides detailed installation instructions for different React Native versions and setups.

## Quick Installation (React Native 0.60+)

```bash
# Install the package
npm install react-native-release-logger
# or
yarn add react-native-release-logger

# Install peer dependency
npm install react-native-fs
# or  
yarn add react-native-fs

# iOS only - install pods
cd ios && pod install && cd ..
```

## Manual Installation (React Native < 0.60)

### Step 1: Install Package
```bash
npm install react-native-release-logger react-native-fs
```

### Step 2: Link react-native-fs
```bash
react-native link react-native-fs
```

### Step 3: Android Setup

1. **Add to `android/settings.gradle`:**
```gradle
include ':react-native-release-logger'
project(':react-native-release-logger').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-release-logger/android')
```

2. **Add to `android/app/build.gradle`:**
```gradle
dependencies {
    implementation project(':react-native-release-logger')
    // ... other dependencies
}
```

3. **Add to `MainApplication.java`:**
```java
import com.reactnativereleaselogger.ReleaseLoggerPackage;

public class MainApplication extends Application implements ReactApplication {
    // ...
    
    @Override
    protected List<ReactPackage> getPackages() {
        @SuppressWarnings("UnnecessaryLocalVariable")
        List<ReactPackage> packages = new PackageList(this).getPackages();
        // Add this line:
        packages.add(new ReleaseLoggerPackage());
        return packages;
    }
    
    // ...
}
```

### Step 4: iOS Setup

1. **Add to `ios/Podfile`:**
```ruby
pod 'ReleaseLogger', :path => '../node_modules/react-native-release-logger/ios'
```

2. **Run pod install:**
```bash
cd ios && pod install && cd ..
```

## Expo Setup

This package uses native modules and is **not compatible with Expo Go**. You'll need to:

1. Eject from Expo or use Expo Dev Build
2. Follow the standard React Native installation steps above

## Verification

After installation, verify the package works:

```typescript
import { initializeReleaseLogger } from 'react-native-release-logger';

// This should not throw an error
const logger = initializeReleaseLogger();
logger.info('Installation successful!');
```

## Troubleshooting

### Common Issues

1. **"ReleaseLogger module not found"**
   - Ensure you've run `pod install` on iOS
   - Clean and rebuild your project
   - Check that the native modules are properly linked

2. **Build errors on Android**
   - Make sure you've added the package to `MainApplication.java`
   - Clean the Android build: `cd android && ./gradlew clean && cd ..`
   - Rebuild: `npx react-native run-android`

3. **Build errors on iOS**
   - Clean the iOS build folder in Xcode
   - Delete `ios/build` folder
   - Run `pod install` again
   - Rebuild: `npx react-native run-ios`

4. **Metro bundler issues**
   - Clear Metro cache: `npx react-native start --reset-cache`
   - Delete `node_modules` and reinstall

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
import { initializeReleaseLogger } from 'react-native-release-logger';

const logger = initializeReleaseLogger({
  minLevel: 'debug',
  enabled: true,
});

// Check if native modules are working
logger.getDeviceInfo().then(info => {
  console.log('Device info:', info);
}).catch(error => {
  console.log('Native module error:', error);
});
```

## Platform-Specific Notes

### Android
- Requires Android API level 21+ (Android 5.0)
- Automatically requests storage permissions if needed
- Uses internal storage by default for better security

### iOS  
- Requires iOS 11.0+
- Uses app's Documents directory
- Respects iOS app sandbox restrictions
- No additional permissions required

## Performance Considerations

- Native modules provide 2-3x better performance than JavaScript-only solutions
- File operations are performed on background threads
- Automatic memory management prevents memory leaks
- Graceful fallback ensures compatibility

## Next Steps

After successful installation:
1. Check out the [README.md](README.md) for usage examples
2. Try the [example app](example/) to see all features
3. Configure the logger for your specific needs

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Look at existing [GitHub issues](https://github.com/yourusername/react-native-release-logger/issues)
3. Create a new issue with detailed information about your setup
