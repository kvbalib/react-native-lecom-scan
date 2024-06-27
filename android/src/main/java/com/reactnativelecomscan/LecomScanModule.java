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
  ScanDevice sd = new ScanDevice();
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

  @ReactMethod
  public void init() {
    final Activity activity = getCurrentActivity();
    sd = new ScanDevice();
    sd.setOutScanMode(0);  // Mode-value: 0 broadcast mode
    IntentFilter filter = new IntentFilter();
    filter.addAction(SCAN_ACTION);
    activity.registerReceiver(mScanReceiver, filter);
  }

  @ReactMethod
  public void toggleScan() {
    final Activity activity = getCurrentActivity();
    if (isScanning) {
      sd.stopScan();
      activity.unregisterReceiver(mScanReceiver);
      isScanning = false;
    } else {
      sd.startScan();
      IntentFilter filter = new IntentFilter();
      filter.addAction(SCAN_ACTION);
      activity.registerReceiver(mScanReceiver, filter);
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
