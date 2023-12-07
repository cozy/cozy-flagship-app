// Needed for UniversalLink
#import <React/RCTLinkingManager.h>

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTHTTPRequestHandler.h>

#import <TSBackgroundFetch/TSBackgroundFetch.h>

#import "RNBootSplash.h" // <- add the header import
#import "RNCConfig.h"

#import <Firebase.h>

static void SetCustomNSURLSessionConfiguration() {
  RCTSetCustomNSURLSessionConfigurationProvider(^NSURLSessionConfiguration *{
    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];

    NSString * appVersionString = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"];
    NSString * userAgentNamespace = [RNCConfig envFor:@"USER_AGENT"];
    NSString * userAgent = [NSString stringWithFormat:@"%@-%@", userAgentNamespace, appVersionString];
    configuration.HTTPAdditionalHeaders = @{ @"User-Agent": userAgent };

    return configuration;
  });
}

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];

  self.moduleName = @"CozyReactNative";

  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  SetCustomNSURLSessionConfiguration();

  [RNBootSplash initWithStoryboard:@"BootSplash" rootView:rootView]; // danger

  [[TSBackgroundFetch sharedInstance] didFinishLaunching]; // danger

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// customSchema
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

// UniversalLink
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
 return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}

@end
