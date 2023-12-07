package io.cozy.flagship.mobile;

import android.os.Bundle;
import android.content.Intent;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

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

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    boolean isDarkMode = true;
    ImmersiveBars.changeBarColors(this, isDarkMode);
    super.onCreate(null);
    RNBootSplash.init(R.drawable.bootsplash, MainActivity.this);

    /**
     * We want to prevent the app from opening inside another app's task.
     * Some apps (like Google Files) will open the app inside their own task, even if the app is already running,
     * And ignore the launchMode="singleTask" in the AndroidManifest.xml.
     *
     * See:
     * https://stackoverflow.com/questions/57750124/launchmode-being-overriden-by-google-files-app-when-sharing-new-instance-of-a-s
     * https://github.com/facebook/react-native/issues/39553
     * https://developer.android.com/guide/components/activities/tasks-and-back-stack#IntentFlagsForTasks
     * */
    if (!isTaskRoot()) {
        Intent newIntent = new Intent(getIntent());
        newIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(newIntent);
        finish();
    }
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
