package io.cozy.flagship.mobile.keyboard;
 
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;
import com.facebook.react.ReactActivity;

import android.app.Activity;
import android.view.inputmethod.InputMethodManager;
import android.content.Context;
import android.util.Log;
 
public class KeyboardModule extends ReactContextBaseJavaModule {
  public KeyboardModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() { 
    return "Keyboard";
  }

  @ReactMethod
  public void forceKeyboard() {
    try {
      Activity activity = getCurrentActivity();

      InputMethodManager inputMethodManager = (InputMethodManager)activity.getSystemService(Context.INPUT_METHOD_SERVICE);

      inputMethodManager.toggleSoftInputFromWindow(activity.getCurrentFocus().getWindowToken(), InputMethodManager.SHOW_FORCED, 0);
    } catch (Exception e) {
      Log.w("Keyboard", "Error on opening the keyboard");
    }
  }
}
