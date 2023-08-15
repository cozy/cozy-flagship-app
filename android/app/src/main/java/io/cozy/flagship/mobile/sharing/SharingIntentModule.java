package io.cozy.flagship.mobile.sharing;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import io.cozy.flagship.mobile.MainActivity;

public class SharingIntentModule extends ReactContextBaseJavaModule {

    private static SharingIntentModule instance;

    public SharingIntentModule(ReactApplicationContext reactContext) {
        super(reactContext);
        instance = this;
    }

    @Override
    public String getName() {
        return "SharingIntentModule";
    }

    @ReactMethod
    public void wasAppOpenedViaSharing(Promise promise) {
        promise.resolve(MainActivity.wasOpenedViaSharing);
    }

    private void sendEvent(String eventName, boolean isSharing) {
        ReactApplicationContext reactContext = getReactApplicationContext();
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, isSharing);
        }
    }

    public static void notifyAppResumedWithSharing(boolean isSharing) {
        if (instance != null) {
            instance.sendEvent("APP_RESUMED_WITH_SHARING", isSharing);
        }
    }
}
