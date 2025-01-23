package io.cozy.flagship.mobile.webview;

import android.net.Uri;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import androidx.annotation.Nullable;

import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.reactnativecommunity.webview.RNCWebView;
import com.reactnativecommunity.webview.RNCWebViewClient;
import com.reactnativecommunity.webview.RNCWebViewManager;
import com.reactnativecommunity.webview.RNCWebViewWrapper;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

/**
 * This is a custom WebView that can be injected into react-native-webview
 * by setting :
 * <WebView
 * source={{ uri }}
 * nativeConfig={{ component: IndexInjectionWebView }}
 * injectedHtml={html} />
 * <p>
 * When doing so, the WebView will intercept all request to `/` or to `/index.html`
 * and then replace the HTTP response with `injectedHtml` content
 */
@ReactModule(name = IndexInjectionWebViewManager.REACT_CLASS)
public class IndexInjectionWebViewManager extends RNCWebViewManager {
  protected static final String REACT_CLASS = "RCTIndexInjectionWebView";
  private static final String TAG = "IndexInjectionWebView";

  @Override
  public RNCWebViewWrapper createViewInstance(ThemedReactContext reactContext) {
    return super.createViewInstance(reactContext, new IndexInjectionWebView(reactContext));
  }

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  protected void addEventEmitters(ThemedReactContext reactContext, RNCWebViewWrapper view) {
    view.getWebView().setWebViewClient(new IndexInjectionWebViewClient());
  }

  @ReactProp(name = "injectedIndex")
  public void setInjectedIndex(RNCWebViewWrapper view, String url) {
    ((IndexInjectionWebView) view.getWebView()).setInjectedIndex(url);
  }

  protected static class IndexInjectionWebViewClient extends RNCWebViewClient {
    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
      Uri uri = request.getUrl();

      String path = uri.getPath();
      String refreshTokenParam = uri.getQueryParameter("refreshToken");
      if ((path != null && (path.equals("/") || path.equals("/index.html"))) && refreshTokenParam == null) {
        String htmlToInject = ((IndexInjectionWebView) view).getInjectedIndex();

        if (htmlToInject == null) {
          return null;
        }

        Log.d(TAG, "Intercepted index.html content");

        InputStream injectedStream = new ByteArrayInputStream(htmlToInject.getBytes());

        return new WebResourceResponse("text/html", "UTF-8", injectedStream);
      }

      return null;
    }
  }

  protected static class IndexInjectionWebView extends RNCWebView {
    protected @Nullable String mInjectedIndex;

    public IndexInjectionWebView(ThemedReactContext reactContext) {
      super(reactContext);
    }

    public String getInjectedIndex() {
      return mInjectedIndex;
    }

    public void setInjectedIndex(String injectedIndex) {
      mInjectedIndex = injectedIndex;
    }
  }
}

