#import "FPStaticServer.h"

@implementation FPStaticServer

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (instancetype)init {
    if((self = [super init])) {

        [GCDWebServer self];
        _webServer = [[GCDWebServer alloc] init];
    }
    return self;
}

- (void)dealloc {

    if(_webServer.isRunning == YES) {
        [_webServer stop];
    }
    _webServer = nil;

}

- (dispatch_queue_t)methodQueue
{
    return dispatch_queue_create("com.futurepress.staticserver", DISPATCH_QUEUE_SERIAL);
}


RCT_EXPORT_METHOD(start: (NSString *)port
                  root:(NSString *)optroot
                  localOnly:(BOOL *)localhost_only
                  keepAlive:(BOOL *)keep_alive
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSLog(@"🐬 start method");

    NSString * root;

    if( [optroot isEqualToString:@"DocumentDir"] ){
        NSLog(@"🐬 if 1");
        root = [NSString stringWithFormat:@"%@", [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0] ];
    } else if( [optroot isEqualToString:@"BundleDir"] ){
        NSLog(@"🐬 if 2");
        root = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] bundlePath] ];
    } else if([optroot hasPrefix:@"/"]) {
        NSLog(@"🐬 if 3");
        root = optroot;
    } else {
        NSLog(@"🐬 if 4");
        root = [NSString stringWithFormat:@"%@/%@", [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0], optroot ];
    }


    if(root && [root length] > 0) {
        NSLog(@"🐬 if 5");
        self.www_root = root;
    }

    if(port && [port length] > 0) {
        NSLog(@"🐬 if 6");
        NSNumberFormatter *f = [[NSNumberFormatter alloc] init];
        f.numberStyle = NSNumberFormatterDecimalStyle;
        self.port = [f numberFromString:port];
    } else {
        NSLog(@"🐬 if 7");
        self.port = [NSNumber numberWithInt:-1];
    }


    self.keep_alive = keep_alive;

    self.localhost_only = localhost_only;

    if(_webServer.isRunning != NO) {
        NSLog(@"🐬 if 8");
        NSLog(@"StaticServer already running at %@", self.url);
        resolve(self.url);
        return;
    }

    //[_webServer addGETHandlerForBasePath:@"/" directoryPath:self.www_root indexFilename:@"index.html" cacheAge:3600 allowRangeRequests:YES];
    NSString *basePath = @"/";
    NSString *directoryPath = self.www_root;
    NSString *indexFilename = @"index.html";
    NSUInteger cacheAge = 3600;
    BOOL allowRangeRequests = YES;

    [_webServer addHandlerWithMatchBlock:^GCDWebServerRequest*(NSString* requestMethod, NSURL* requestURL, NSDictionary<NSString*, NSString*>* requestHeaders, NSString* urlPath, NSDictionary<NSString*, NSString*>* urlQuery) {
        NSLog(@"🐬 addHandlerWithMatchBlock");
        if (![requestMethod isEqualToString:@"GET"]) {
          NSLog(@"🐬 addHandlerWithMatchBlock if not get");
          return nil;
        }
        if (![urlPath hasPrefix:basePath]) {
          NSLog(@"🐬 addHandlerWithMatchBlock if not basepath");
          return nil;
        }
        NSLog(@"🐬 addHandlerWithMatchBlock else initWithMethod");
        return [[GCDWebServerRequest alloc] initWithMethod:requestMethod url:requestURL headers:requestHeaders path:urlPath query:urlQuery];
      }

      processBlock:^GCDWebServerResponse*(GCDWebServerRequest* request) {
        NSLog(@"🐬 processBlock after");
        GCDWebServerResponse* response = nil;
        NSString* filePath = [directoryPath stringByAppendingPathComponent:GCDWebServerNormalizePath([request.path substringFromIndex:basePath.length])];
        NSString* fileType = [[[NSFileManager defaultManager] attributesOfItemAtPath:filePath error:NULL] fileType];
        if (fileType) {
          NSLog(@"🐬 processBlock fileType");
          if ([fileType isEqualToString:NSFileTypeDirectory]) {
            NSLog(@"🐬 processBlock fileType NSFileTypeDirectory");
            if (indexFilename) {
              NSLog(@"🐬 processBlock fileType indexFilename");
              NSString* indexPath = [filePath stringByAppendingPathComponent:indexFilename];
              NSString* indexType = [[[NSFileManager defaultManager] attributesOfItemAtPath:indexPath error:NULL] fileType];
              if ([indexType isEqualToString:NSFileTypeRegular]) {
                NSLog(@"🐬🏆🏆🏆🏆🏆🏆🏆 processBlock fileType NSFileTypeRegular");
                response = [GCDWebServerFileResponse responseWithFile:indexPath];

                // First I want to read this response in the index.html
                NSData* dataFromIndexHTML = [response readData:nil];
                NSLog(@"🐬🏆🏆🏆🏆🏆🏆🏆 1. dataFromIndexHTML");

                // Second I want to update  and save this NSData file
                // some snippets https://cocoadev.github.io/NSDataAndResourceForksCode/

                // 2a) trying to make a NSMutableData
                NSMutableData* mutableDataFromIndexHtml = [dataFromIndexHTML.mutableCopy(with:)];
                NSLog(@"🐬🏆🏆🏆🏆🏆🏆🏆 2. mutableDataFromIndexHtml");

                // 2b) need to update the index.html by adding "coucou"

                // 2c) need to send the answer in response

              }
              NSLog(@"🐬 processBlock fileType AFTER NOT NSFileTypeRegular");
            } else {
              NSLog(@"🐬 processBlock fileType NOT indexFilename");
              response = [GCDWebServerResponse responseWithStatusCode:kGCDWebServerHTTPStatusCode_NotFound];
            }
          } else if ([fileType isEqualToString:NSFileTypeRegular]) {
            NSLog(@"🐬 processBlock fileType NOT NSFileTypeDirectory");
            if (allowRangeRequests) {
              NSLog(@"🐬 processBlock fileType allowRangeRequests");
              response = [GCDWebServerFileResponse responseWithFile:filePath byteRange:request.byteRange];
              [response setValue:@"bytes" forAdditionalHeader:@"Accept-Ranges"];
            } else {
              NSLog(@"🐬 processBlock fileType NOT allowRangeRequests");
              response = [GCDWebServerFileResponse responseWithFile:filePath];
            }
          }
        }

        NSLog(@"processBlock RESPONSE BEFORE");
        if (response) {
           NSLog(@"processBlock RESPONSE");
          response.cacheControlMaxAge = cacheAge;
          [response setValue:@"GET" forAdditionalHeader:@"Access-Control-Request-Method"];
          [response setValue:@"OriginX-Requested-With, Content-Type, Accept, Cache-Control, Range,Access-Control-Allow-Origin"  forAdditionalHeader:@"Access-Control-Request-Headers"];
          [response setValue: @"*" forAdditionalHeader:@"Access-Control-Allow-Origin"];
        } else {
           NSLog(@" processBlock NOT RESPONSE");
          response = [GCDWebServerResponse responseWithStatusCode:kGCDWebServerHTTPStatusCode_NotFound];
        }
         NSLog(@" processBlock RESPONSE TO RETURN");
        return response;
      }];

    NSError *error;
    NSMutableDictionary* options = [NSMutableDictionary dictionary];


    NSLog(@"Started StaticServer on port %@", self.port);

    if (![self.port isEqualToNumber:[NSNumber numberWithInt:-1]]) {
        [options setObject:self.port forKey:GCDWebServerOption_Port];
    } else {
        [options setObject:[NSNumber numberWithInteger:8080] forKey:GCDWebServerOption_Port];
    }

    if (self.localhost_only == YES) {
        [options setObject:@(YES) forKey:GCDWebServerOption_BindToLocalhost];
    }

    if (self.keep_alive == YES) {
        [options setObject:@(NO) forKey:GCDWebServerOption_AutomaticallySuspendInBackground];
        [options setObject:@2.0 forKey:GCDWebServerOption_ConnectedStateCoalescingInterval];
    }


    if([_webServer startWithOptions:options error:&error]) {
        NSNumber *listenPort = [NSNumber numberWithUnsignedInteger:_webServer.port];
        self.port = listenPort;

        if(_webServer.serverURL == NULL) {
            reject(@"server_error", @"StaticServer could not start", error);
        } else {
            self.url = [NSString stringWithFormat: @"%@://%@:%@", [_webServer.serverURL scheme], [_webServer.serverURL host], [_webServer.serverURL port]];
            NSLog(@"Started StaticServer at URL %@", self.url);
            resolve(self.url);
        }
    } else {
        NSLog(@"Error starting StaticServer: %@", error);

        reject(@"server_error", @"StaticServer could not start", error);

    }

}

RCT_EXPORT_METHOD(stop) {
    if(_webServer.isRunning == YES) {

        [_webServer stop];

        NSLog(@"StaticServer stopped");
    }
}

RCT_EXPORT_METHOD(origin:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    if(_webServer.isRunning == YES) {
        resolve(self.url);
    } else {
        resolve(@"");
    }
}

RCT_EXPORT_METHOD(isRunning:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    bool isRunning = _webServer != nil &&_webServer.isRunning == YES;
    resolve(@(isRunning));
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end
