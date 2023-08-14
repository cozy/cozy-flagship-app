package io.cozy.flagship.mobile;

import android.os.Bundle;
import android.content.Intent;

import com.facebook.react.ReactActivity;
import com.zoontek.rnbootsplash.RNBootSplash;
import com.rnimmersivebars.ImmersiveBars;

public class MainActivity extends ReactActivity {

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
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
  }
}
