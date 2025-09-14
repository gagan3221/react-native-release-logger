package com.reactnativereleaselogger;

import android.os.Environment;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

@ReactModule(name = ReleaseLoggerModule.NAME)
public class ReleaseLoggerModule extends ReactContextBaseJavaModule {
    public static final String NAME = "ReleaseLogger";
    private static final String TAG = "ReleaseLogger";

    public ReleaseLoggerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void getDocumentsPath(Promise promise) {
        try {
            File documentsDir = getReactApplicationContext().getFilesDir();
            promise.resolve(documentsDir.getAbsolutePath());
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to get documents path", e);
        }
    }

    @ReactMethod
    public void getExternalStoragePath(Promise promise) {
        try {
            File externalDir = Environment.getExternalStorageDirectory();
            if (externalDir != null) {
                promise.resolve(externalDir.getAbsolutePath());
            } else {
                // Fallback to internal storage
                File internalDir = getReactApplicationContext().getFilesDir();
                promise.resolve(internalDir.getAbsolutePath());
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to get external storage path", e);
        }
    }

    @ReactMethod
    public void writeLogEntry(String filePath, String logEntry, Promise promise) {
        try {
            File file = new File(filePath);
            File parentDir = file.getParentFile();
            
            // Create parent directories if they don't exist
            if (parentDir != null && !parentDir.exists()) {
                boolean created = parentDir.mkdirs();
                if (!created) {
                    promise.reject("ERROR", "Failed to create log directory");
                    return;
                }
            }

            // Append log entry to file
            try (BufferedWriter writer = new BufferedWriter(new FileWriter(file, true))) {
                writer.write(logEntry);
                writer.flush();
            }

            promise.resolve(true);
        } catch (IOException e) {
            Log.e(TAG, "Failed to write log entry", e);
            promise.reject("ERROR", "Failed to write log entry", e);
        }
    }

    @ReactMethod
    public void getFileSize(String filePath, Promise promise) {
        try {
            File file = new File(filePath);
            if (file.exists()) {
                promise.resolve((double) file.length());
            } else {
                promise.resolve(0.0);
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to get file size", e);
        }
    }

    @ReactMethod
    public void readLogFile(String filePath, Promise promise) {
        try {
            File file = new File(filePath);
            if (!file.exists()) {
                promise.resolve("");
                return;
            }

            byte[] encoded = Files.readAllBytes(Paths.get(filePath));
            String content = new String(encoded, "UTF-8");
            promise.resolve(content);
        } catch (Exception e) {
            Log.e(TAG, "Failed to read log file", e);
            promise.reject("ERROR", "Failed to read log file", e);
        }
    }

    @ReactMethod
    public void deleteLogFile(String filePath, Promise promise) {
        try {
            File file = new File(filePath);
            if (file.exists()) {
                boolean deleted = file.delete();
                promise.resolve(deleted);
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to delete log file", e);
        }
    }

    @ReactMethod
    public void listLogFiles(String directoryPath, Promise promise) {
        try {
            File directory = new File(directoryPath);
            if (!directory.exists() || !directory.isDirectory()) {
                WritableArray emptyArray = Arguments.createArray();
                promise.resolve(emptyArray);
                return;
            }

            File[] files = directory.listFiles();
            WritableArray fileArray = Arguments.createArray();

            if (files != null) {
                for (File file : files) {
                    if (file.isFile()) {
                        WritableMap fileInfo = Arguments.createMap();
                        fileInfo.putString("name", file.getName());
                        fileInfo.putString("path", file.getAbsolutePath());
                        fileInfo.putDouble("size", file.length());
                        fileInfo.putDouble("lastModified", file.lastModified());
                        fileArray.pushMap(fileInfo);
                    }
                }
            }

            promise.resolve(fileArray);
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to list log files", e);
        }
    }

    @ReactMethod
    public void createDirectory(String directoryPath, Promise promise) {
        try {
            File directory = new File(directoryPath);
            if (!directory.exists()) {
                boolean created = directory.mkdirs();
                promise.resolve(created);
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to create directory", e);
        }
    }

    @ReactMethod
    public void fileExists(String filePath, Promise promise) {
        try {
            File file = new File(filePath);
            promise.resolve(file.exists());
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to check file existence", e);
        }
    }

    @ReactMethod
    public void getDeviceInfo(Promise promise) {
        try {
            WritableMap deviceInfo = Arguments.createMap();
            deviceInfo.putString("platform", "android");
            deviceInfo.putString("manufacturer", android.os.Build.MANUFACTURER);
            deviceInfo.putString("model", android.os.Build.MODEL);
            deviceInfo.putString("version", android.os.Build.VERSION.RELEASE);
            deviceInfo.putInt("sdkVersion", android.os.Build.VERSION.SDK_INT);
            
            promise.resolve(deviceInfo);
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to get device info", e);
        }
    }
}
