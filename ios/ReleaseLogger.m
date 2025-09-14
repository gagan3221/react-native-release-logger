#import "ReleaseLogger.h"
#import <React/RCTLog.h>
#import <UIKit/UIKit.h>

@implementation ReleaseLogger

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

RCT_EXPORT_METHOD(getDocumentsPath:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        NSString *documentsDirectory = [paths objectAtIndex:0];
        resolve(documentsDirectory);
    } @catch (NSException *exception) {
        reject(@"ERROR", @"Failed to get documents path", nil);
    }
}

RCT_EXPORT_METHOD(getExternalStoragePath:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // iOS doesn't have external storage like Android, so return documents path
    [self getDocumentsPath:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(writeLogEntry:(NSString *)filePath
                  logEntry:(NSString *)logEntry
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        
        // Create parent directories if they don't exist
        NSString *parentDir = [filePath stringByDeletingLastPathComponent];
        if (![fileManager fileExistsAtPath:parentDir]) {
            NSError *error;
            BOOL created = [fileManager createDirectoryAtPath:parentDir
                                  withIntermediateDirectories:YES
                                                   attributes:nil
                                                        error:&error];
            if (!created) {
                reject(@"ERROR", @"Failed to create log directory", error);
                return;
            }
        }
        
        // Append log entry to file
        NSData *logData = [logEntry dataUsingEncoding:NSUTF8StringEncoding];
        
        if ([fileManager fileExistsAtPath:filePath]) {
            NSFileHandle *fileHandle = [NSFileHandle fileHandleForWritingAtPath:filePath];
            [fileHandle seekToEndOfFile];
            [fileHandle writeData:logData];
            [fileHandle closeFile];
        } else {
            [logData writeToFile:filePath atomically:YES];
        }
        
        resolve(@YES);
    } @catch (NSException *exception) {
        reject(@"ERROR", @"Failed to write log entry", nil);
    }
}

RCT_EXPORT_METHOD(getFileSize:(NSString *)filePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        
        if ([fileManager fileExistsAtPath:filePath]) {
            NSError *error;
            NSDictionary *attributes = [fileManager attributesOfItemAtPath:filePath error:&error];
            
            if (error) {
                reject(@"ERROR", @"Failed to get file attributes", error);
                return;
            }
            
            NSNumber *fileSize = [attributes objectForKey:NSFileSize];
            resolve(fileSize);
        } else {
            resolve(@0);
        }
    } @catch (NSException *exception) {
        reject(@"ERROR", @"Failed to get file size", nil);
    }
}

RCT_EXPORT_METHOD(readLogFile:(NSString *)filePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        
        if (![fileManager fileExistsAtPath:filePath]) {
            resolve(@"");
            return;
        }
        
        NSError *error;
        NSString *content = [NSString stringWithContentsOfFile:filePath
                                                      encoding:NSUTF8StringEncoding
                                                         error:&error];
        
        if (error) {
            reject(@"ERROR", @"Failed to read log file", error);
            return;
        }
        
        resolve(content);
    } @catch (NSException *exception) {
        reject(@"ERROR", @"Failed to read log file", nil);
    }
}

RCT_EXPORT_METHOD(deleteLogFile:(NSString *)filePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        
        if ([fileManager fileExistsAtPath:filePath]) {
            NSError *error;
            BOOL deleted = [fileManager removeItemAtPath:filePath error:&error];
            
            if (error) {
                reject(@"ERROR", @"Failed to delete log file", error);
                return;
            }
            
            resolve(@(deleted));
        } else {
            resolve(@YES);
        }
    } @catch (NSException *exception) {
        reject(@"ERROR", @"Failed to delete log file", nil);
    }
}

RCT_EXPORT_METHOD(listLogFiles:(NSString *)directoryPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        
        if (![fileManager fileExistsAtPath:directoryPath]) {
            resolve(@[]);
            return;
        }
        
        NSError *error;
        NSArray *files = [fileManager contentsOfDirectoryAtPath:directoryPath error:&error];
        
        if (error) {
            reject(@"ERROR", @"Failed to list log files", error);
            return;
        }
        
        NSMutableArray *fileInfoArray = [[NSMutableArray alloc] init];
        
        for (NSString *fileName in files) {
            NSString *fullPath = [directoryPath stringByAppendingPathComponent:fileName];
            
            BOOL isDirectory;
            if ([fileManager fileExistsAtPath:fullPath isDirectory:&isDirectory] && !isDirectory) {
                NSDictionary *attributes = [fileManager attributesOfItemAtPath:fullPath error:nil];
                
                NSMutableDictionary *fileInfo = [[NSMutableDictionary alloc] init];
                [fileInfo setObject:fileName forKey:@"name"];
                [fileInfo setObject:fullPath forKey:@"path"];
                [fileInfo setObject:[attributes objectForKey:NSFileSize] forKey:@"size"];
                
                NSDate *modificationDate = [attributes objectForKey:NSFileModificationDate];
                NSTimeInterval timestamp = [modificationDate timeIntervalSince1970] * 1000; // Convert to milliseconds
                [fileInfo setObject:@(timestamp) forKey:@"lastModified"];
                
                [fileInfoArray addObject:fileInfo];
            }
        }
        
        resolve(fileInfoArray);
    } @catch (NSException *exception) {
        reject(@"ERROR", @"Failed to list log files", nil);
    }
}

RCT_EXPORT_METHOD(createDirectory:(NSString *)directoryPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        
        if (![fileManager fileExistsAtPath:directoryPath]) {
            NSError *error;
            BOOL created = [fileManager createDirectoryAtPath:directoryPath
                                  withIntermediateDirectories:YES
                                                   attributes:nil
                                                        error:&error];
            
            if (error) {
                reject(@"ERROR", @"Failed to create directory", error);
                return;
            }
            
            resolve(@(created));
        } else {
            resolve(@YES);
        }
    } @catch (NSException *exception) {
        reject(@"ERROR", @"Failed to create directory", nil);
    }
}

RCT_EXPORT_METHOD(fileExists:(NSString *)filePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        BOOL exists = [fileManager fileExistsAtPath:filePath];
        resolve(@(exists));
    } @catch (NSException *exception) {
        reject(@"ERROR", @"Failed to check file existence", nil);
    }
}

RCT_EXPORT_METHOD(getDeviceInfo:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        UIDevice *device = [UIDevice currentDevice];
        
        NSMutableDictionary *deviceInfo = [[NSMutableDictionary alloc] init];
        [deviceInfo setObject:@"ios" forKey:@"platform"];
        [deviceInfo setObject:[device model] forKey:@"model"];
        [deviceInfo setObject:[device systemVersion] forKey:@"version"];
        [deviceInfo setObject:[device systemName] forKey:@"systemName"];
        
        // Get device identifier
        [deviceInfo setObject:[[device identifierForVendor] UUIDString] forKey:@"identifier"];
        
        resolve(deviceInfo);
    } @catch (NSException *exception) {
        reject(@"ERROR", @"Failed to get device info", nil);
    }
}

@end
