package com.futurepress.staticserver;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;

import fi.iki.elonen.SimpleWebServer;
import android.net.Uri;
import android.util.Log;
import android.util.Base64;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.ServiceLoader;
import java.util.StringTokenizer;

import fi.iki.elonen.InternalRewrite;
import fi.iki.elonen.NanoHTTPD;
import fi.iki.elonen.NanoHTTPD.Response.IStatus;
import fi.iki.elonen.util.ServerRunner;

// https://github.com/NanoHttpd/nanohttpd/blob/2260799a6234a07c3f3e475214fcfd39ba8091a5/webserver/src/main/java/fi/iki/elonen/SimpleWebServer.java

public class WebServer extends SimpleWebServer {
  private static final String LOGTAG = "WebServer";
  private File wwwroot;

  public WebServer(String localAddr, int port, File wwwroot) throws IOException {
    super(localAddr, port, wwwroot, true, "*");
    this.wwwroot = wwwroot;

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
    Log.d(LOGTAG, "🌠🧑‍💻🧑‍💻🧑‍💻🧑‍💻 serve");

    if (session.getUri().equals("/")) {
      try {
        File indexFile = new File(this.wwwroot, "index.html");
        FileInputStream indexStream = new FileInputStream(indexFile);
        StringBuffer fileContent = new StringBuffer("");
        byte[] buffer = new byte[1024];
        BufferedReader r = new BufferedReader(new InputStreamReader(indexStream));
        for (String line; (line = r.readLine()) != null; ) {
          fileContent.append(line).append('\n');
        }

        String content = fileContent.toString()
          .replace("{{.CozyClientJS}}", "COUCOU CCJS")
          .replace("{{.ThemeCSS}}", "COUCOU THEME")
          .replace("{{.Favicon}}", "COUCOU FAV");

        return newFixedLengthResponse(Response.Status.OK, NanoHTTPD.MIME_HTML, content);
      } catch(Exception exception) {
        return newFixedLengthResponse(Response.Status.OK, NanoHTTPD.MIME_HTML, "SNIF c'est cassé");
      }
    } else {
      return super.serve(session);
    }
  }
}
