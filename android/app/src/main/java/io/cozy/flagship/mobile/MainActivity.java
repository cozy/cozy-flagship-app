package io.cozy.flagship.mobile;

import android.os.Bundle;
import android.content.Intent;

import com.facebook.react.ReactActivity;
import com.zoontek.rnbootsplash.RNBootSplash;
import com.rnimmersivebars.ImmersiveBars;

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
    super.onCreate(null);
    RNBootSplash.init(R.drawable.bootsplash, MainActivity.this);
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
  }

  @Override
  protected void onResume() {
      super.onResume();
  }

  @Override
  protected void onPause() {
      super.onPause();
      MainActivity.wasOpenedViaSharing = false;
  }
}
