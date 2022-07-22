package io.cozy.flagship.mobile.httpserver;

import android.text.TextUtils;
import android.util.Log;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;

import fi.iki.elonen.CozySimpleWebServer;
import fi.iki.elonen.NanoHTTPD;

class UrlParts {
  public String SecurityKey;
  public String ResourcePath;

  UrlParts(String securityKey, String resourcePath) {
    this.SecurityKey = securityKey;
    this.ResourcePath = resourcePath;
  }
}

public class HttpServer extends CozySimpleWebServer
{
  private static final String LOGTAG = "WebServer";

  private static final int SECURITY_KEY_LENGTH = 22;
  private static final int CACHE_1_YEAR = 31536000;
  private String securityKey;

  public HttpServer(String localAddr, int port, File wwwroot) throws IOException {
    super(localAddr, port, wwwroot, true, "*");

    mimeTypes().put("xhtml", "application/xhtml+xml");
    mimeTypes().put("opf", "application/oebps-package+xml");
    mimeTypes().put("ncx", "application/xml");
    mimeTypes().put("epub", "application/epub+zip");
    mimeTypes().put("otf", "application/x-font-otf");
    mimeTypes().put("ttf", "application/x-font-ttf");
    mimeTypes().put("js", "application/javascript");
    mimeTypes().put("svg", "image/svg+xml");
  }

  @Override
  protected boolean useGzipWhenAccepted(Response r) {
    return super.useGzipWhenAccepted(r) && r.getStatus() != Response.Status.NOT_MODIFIED;
  }

  @Override
  public Response serve(IHTTPSession session) {
    try {
      UrlParts urlParts = getUrlParts(session.getUri());

      Map<String, String> header = session.getHeaders();

      if (!urlParts.SecurityKey.equals(this.securityKey)) {
        Log.e(LOGTAG, "The given security key is not valid");
        return newFixedLengthResponse(Response.Status.BAD_REQUEST, NanoHTTPD.MIME_HTML, "The given security key is not valid");
      }

      String filePath = urlParts.ResourcePath;

      Response response = super.respond(Collections.unmodifiableMap(header), session, filePath);
      response.addHeader("Cache-Control", "max-age=" + CACHE_1_YEAR + ", public, immutable");
      return response;
    } catch (Exception e) {
      Log.e(LOGTAG, e.getMessage());
      return newFixedLengthResponse(Response.Status.BAD_REQUEST, NanoHTTPD.MIME_HTML, e.getMessage());
    }
  }

  protected boolean isValidSecurityKey(String securityKey) {
    return securityKey.length() == SECURITY_KEY_LENGTH;
  }

  protected UrlParts getUrlParts(String url) throws Exception {
    int securityKeyIndex = 1;
    int pathIndex = 2;

    String[] urlParts = url.split("/");

    if (urlParts.length <= securityKeyIndex) {
      throw new Exception("Wrong URL format. The url should use the following form '/security_key/resource_path'");
    }

    String securityKey = urlParts[securityKeyIndex];

    if (!isValidSecurityKey(securityKey)) {
      throw new Exception("The queried securityKey is not valid");
    }

    String path = "";

    if (urlParts.length > pathIndex) {
      String[] pathParts = Arrays.copyOfRange(urlParts, pathIndex, urlParts.length);
      path = TextUtils.join("/", pathParts);
    }

    return new UrlParts(securityKey, path);
  }

  public void setSecurityKey(String securityKey) {
    this.securityKey = securityKey;
  }
}
