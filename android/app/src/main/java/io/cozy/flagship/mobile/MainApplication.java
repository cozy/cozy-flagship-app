package io.cozy.flagship.mobile;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import sk.kedros.playintegrity.RNGooglePlayIntegrityPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.rnfs.RNFSPackage;
import com.reactlibrary.GzipPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.react.flipper.ReactNativeFlipper;
import com.facebook.soloader.SoLoader;
import java.util.List;
import android.webkit.WebView;
import com.rnfs.RNFSPackage;
import com.facebook.react.modules.network.OkHttpClientProvider;

import io.cozy.flagship.mobile.keyboard.KeyboardPackage;
import io.cozy.flagship.mobile.httpserver.HttpServerPackage;
import io.cozy.flagship.mobile.webview.WebViewPackage;

import android.database.CursorWindow;
import java.lang.reflect.Field;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          // packages.add(new RNFSPackage());
          packages.add(new KeyboardPackage());
          packages.add(new HttpServerPackage());
          packages.add(new WebViewPackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return BuildConfig.IS_HERMES_ENABLED;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
    }
    ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());

    WebView.setWebContentsDebuggingEnabled(true);
    OkHttpClientProvider.setOkHttpClientFactory(new UserAgentClientFactory());
  }
}
