package com.cozyreactnative;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
<<<<<<< HEAD
import com.zoontek.rnbootsplash.RNBootSplash;
=======
import com.documentscanner.DocumentScannerPackage;
>>>>>>> feat: [wip] document scanner

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
    super.onCreate(savedInstanceState);
    RNBootSplash.init(R.drawable.bootsplash, MainActivity.this);
  }
}
