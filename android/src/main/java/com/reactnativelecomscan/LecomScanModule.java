package com.reactnativelecomscan;

import androidx.annotation.NonNull;
import android.app.Activity;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import android.device.ScanDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

@ReactModule(name = LecomScanModule.NAME)
public class LecomScanModule extends ReactContextBaseJavaModule {
  ScanDevice sd;
  public static final String NAME = "LecomScan";
  private static final String SCAN_ACTION = "scan.rcv.message";
  private Boolean isScanning = false;
  private final ReactApplicationContext mContext;

  public LecomScanModule(ReactApplicationContext reactContext) {
    super(reactContext);
    mContext = reactContext;
  }

  private final BroadcastReceiver mScanReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();
      if (SCAN_ACTION.equals(action)) {
        byte[] barcode = intent.getByteArrayExtra("barocode");
        int barcodeLen = intent.getIntExtra("length", 0);
        String temp = intent.getStringExtra("barcodeType");
        String aimID = intent.getStringExtra("aimid");
        String barcodeStr = new String(barcode, 0, barcodeLen);
        mContext.getJSModule(RCTNativeAppEventEmitter.class)
          .emit("EventLecomScanSuccess", barcodeStr);
        sd.stopScan();
      }
    }
  };

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  private void registerReceiver() {
    final Activity activity = getCurrentActivity();
    if (activity != null) {
      IntentFilter filter = new IntentFilter();
      filter.addAction(SCAN_ACTION);
      activity.registerReceiver(mScanReceiver, filter);
    }
  }

  private void unregisterReceiver() {
    final Activity activity = getCurrentActivity();
    if (activity != null) {
      activity.unregisterReceiver(mScanReceiver);
    }
  }

  @ReactMethod
  public void init() {
    sd = new ScanDevice();
    sd.setOutScanMode(0);  // Mode-value: 0 broadcast mode
    registerReceiver();
  }

  @ReactMethod
  public void stop() {
    sd.stopScan();
    unregisterReceiver();
    isScanning = false;
  }

  @ReactMethod
  public void toggleScan() {
    if (isScanning) {
      stop();
    } else {
      sd.startScan();
      registerReceiver();
      isScanning = true;
    }
  }

  // Required for rn built in EventEmitter Calls.
  @ReactMethod
  public void addListener(String eventName) {
  }

  @ReactMethod
  public void removeListeners(Integer count) {
  }
}
