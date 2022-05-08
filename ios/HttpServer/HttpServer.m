//
//  HttpServer.m
//  CozyReactNative
//
//  Created by Yannick CHIRON on 22/04/2022.
//

#import <Foundation/Foundation.h>

#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(HttpServer, NSObject)

RCT_EXTERN_METHOD(start:(NSString *)port
                  root:(NSString *)root
                  localonly:(BOOL *)localonly
                  keepalive:(BOOL *)keepalive
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(stop)

RCT_EXTERN_METHOD(origin:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(isRunning:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

@end
