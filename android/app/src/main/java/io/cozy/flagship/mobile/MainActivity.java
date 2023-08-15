package io.cozy.flagship.mobile;

import android.os.Bundle;
import android.content.Intent;

import com.facebook.react.ReactActivity;
import com.zoontek.rnbootsplash.RNBootSplash;
import com.rnimmersivebars.ImmersiveBars;

import io.cozy.flagship.mobile.sharing.SharingIntentModule;

public class MainActivity extends ReactActivity {

  // Static variable to track if the app was opened via a sharing intent
  public static boolean wasOpenedViaSharing = false;

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "CozyReactNative";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    boolean isDarkMode = true;
    ImmersiveBars.changeBarColors(this, isDarkMode);
    super.onCreate(savedInstanceState);
    RNBootSplash.init(R.drawable.bootsplash, MainActivity.this);

    // Check if the app was opened via a sharing intent
    if (isSharingIntent()) {
      wasOpenedViaSharing = true;
    }
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);

    // Check if the app received a new sharing intent
    if (isSharingIntent()) {
      wasOpenedViaSharing = true;
    }
  }

  @Override
  protected void onResume() {
      super.onResume();
      
      boolean isSharing = isSharingIntent();
      SharingIntentModule.notifyAppResumedWithSharing(isSharing);
  }

  // Utility method to check if the current intent is a sharing intent
  private boolean isSharingIntent() {
    String action = getIntent().getAction();
    String type = getIntent().getType();
    return Intent.ACTION_SEND.equals(action) && type != null;
  }
}
