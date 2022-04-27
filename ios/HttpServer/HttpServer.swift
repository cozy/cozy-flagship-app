//
//  HttpServer.swift
//  CozyReactNative
//
//  Created by Yannick CHIRON on 22/04/2022.
//

import Foundation

@objc(HttpServer)
class HttpServer: NSObject {
  private var webServer:GCDWebServer
  private var localPath:String = ""
  private var url:String = ""
  private var www_root:String = ""
  private var port:NSNumber = 0
  private var localhostOnly:Bool = false
  private var keepAlive:Bool = false

  override init() {
    webServer = GCDWebServer()
    super.init()
  }

  @objc
  func start(_ port:String, root optroot:String, localonly localhostOnly:Bool, keepalive keepAlive:Bool, resolver resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) {
    var root:String

    if (optroot == "DocumentDir") {
      root = String(format: "%@", NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first!)
    } else if (optroot == "BundleDir") {
      root = String(format:"%@", Bundle.main.bundlePath)
    } else if (optroot.hasPrefix("/")) {
      root = optroot
    } else {
      root = String(format: "%@/%@", NSSearchPathForDirectoriesInDomains(FileManager.SearchPathDirectory.documentDirectory, .userDomainMask, true).first!, optroot)
    }

    if (root.count > 0) {
      self.www_root = root
    }

    if (port.count > 0) {
      let numberFormater = NumberFormatter()
      numberFormater.numberStyle = .decimal
      self.port = numberFormater.number(from: port)!
    } else {
      self.port = -1
    }

    self.keepAlive = keepAlive

    self.localhostOnly = localhostOnly

    if (webServer.isRunning != false) {
      NSLog("HttpServer already running at %@", self.url)
      resolve(self.url)
      return
    }

    let basePath = "/"
    let directoryPath = self.www_root
    let indexFilename = "index.html"
    let cacheAge: UInt = 0
    let allowRangeRequests = true

    webServer.addHandler { requestMethod, requestURL, requestHeaders, urlPath, urlQuery in
      if (requestMethod != "GET") {
        return nil
      }
      if (!urlPath.hasPrefix(basePath)) {
        return nil
      }
      return GCDWebServerRequest.init(method: requestMethod, url: requestURL, headers: requestHeaders, path: urlPath, query: urlQuery)
    } processBlock: { request in
      var response: GCDWebServerResponse?

      do {
        let filePath = NSURL(fileURLWithPath: directoryPath)
          .appendingPathComponent(
            GCDWebServerNormalizePath(
              (request.path as NSString).substring(from:basePath.count)
            )
          )!

        let fileType = try filePath.resourceValues(forKeys: [.fileResourceTypeKey]).fileResourceType

        if (fileType == .directory) {
            let indexPath = filePath.appendingPathComponent(indexFilename)
            let indexType = try indexPath.resourceValues(forKeys: [.fileResourceTypeKey]).fileResourceType

            if (indexType == .regular) {
              response = GCDWebServerFileResponse(file: indexPath.path)
            }
        } else if (fileType == .regular) {
          if (allowRangeRequests) {
            response = GCDWebServerFileResponse(file:filePath.path, byteRange: request.byteRange)
            response?.setValue("bytes", forAdditionalHeader: "Accept-Ranges")
          } else {
            response = GCDWebServerFileResponse(file: filePath.path)
          }
        }

        if (response != nil) {
          response?.cacheControlMaxAge = cacheAge
          response?.setValue("GET", forAdditionalHeader: "Access-Control-Request-Method")
          response?.setValue("OriginX-Requested-With, Content-Type, Accept, Cache-Control, Range,Access-Control-Allow-Origin", forAdditionalHeader: "Access-Control-Request-Headers")
          response?.setValue("*", forAdditionalHeader: "Access-Control-Allow-Origin")
        } else {
          response = GCDWebServerResponse(statusCode: GCDWebServerClientErrorHTTPStatusCode.httpStatusCode_NotFound.rawValue)
        }
      } catch {
        NSLog("Error starting HttpServer: %@", error as NSError)

        response = GCDWebServerResponse(statusCode: GCDWebServerServerErrorHTTPStatusCode.httpStatusCode_InternalServerError.rawValue)
      }

      return response
    }

    var options: [String: Any] = [:]

    NSLog("Started HttpServer on port %@", self.port)

    if (self.port != -1) {
      options[GCDWebServerOption_Port] = self.port
    } else {
      options[GCDWebServerOption_Port] = 8080
    }

    if (self.localhostOnly == true) {
      options[GCDWebServerOption_BindToLocalhost] = true
    }

    if (self.keepAlive == true) {
      options[GCDWebServerOption_AutomaticallySuspendInBackground] = false
      options[GCDWebServerOption_ConnectedStateCoalescingInterval] = 2.0
    }

    do {
      try webServer.start(options: options)

      self.port = NSNumber(value: webServer.port)

      if(webServer.serverURL == nil) {
        reject("server_error", "HttpServer could not start", nil)
      } else {
        let serverURL = webServer.serverURL!

        self.url = String(format: "%@://%@:%i", serverURL.scheme!, serverURL.host!, serverURL.port!)
        NSLog("Started HttpServer at URL %@", self.url)
        resolve(self.url)
      }
    } catch {
      NSLog("Error starting HttpServer: %@", error as NSError)

      reject("server_error", "HttpServer could not start", error)
    }
  }

  @objc
  func stop() {
    webServer.stop()

    NSLog("HttpServer stopped")
  }

  @objc
  func origin(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if (webServer.isRunning == true) {
      resolve(self.url)
    } else {
      resolve("")
    }
  }

  @objc
  func isRunning(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let isRunning = webServer.isRunning == true

    resolve(isRunning)
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
