package com.reactnativelecomscan;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;

import android.app.Activity;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;

import android.content.DialogInterface;
import android.device.ScanDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

@ReactModule(name = LecomScanModule.NAME)
public class LecomScanModule extends ReactContextBaseJavaModule {
  ScanDevice sm;
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
      byte[] barocode = intent.getByteArrayExtra("barocode");
      int barocodelen = intent.getIntExtra("length", 0);
      byte temp = intent.getByteExtra("barcodeType", (byte) 0);
      byte[] aimid = intent.getByteArrayExtra("aimid");
      String barcodeStr = new String(barocode, 0, barocodelen);
      mContext.getJSModule(RCTNativeAppEventEmitter.class)
        .emit("EventLecomScanSuccess", barcodeStr);
      sm.stopScan();
    }
  };

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @ReactMethod
  public void alert() {
    AlertDialog alertDialog = new AlertDialog.Builder(this.mContext).create();
    alertDialog.setTitle("Alert");
    alertDialog.setMessage("I'm running");
    alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "OK",
      new DialogInterface.OnClickListener() {
        public void onClick(DialogInterface dialog, int which) {
          dialog.dismiss();
        }
      });
    alertDialog.show();
  }

  @ReactMethod
  public void init() {
    final Activity activity = getCurrentActivity();
    sm = new ScanDevice();
    sm.setOutScanMode(0);
    IntentFilter filter = new IntentFilter();
    filter.addAction(SCAN_ACTION);
    activity.registerReceiver(mScanReceiver, filter);
  }

  @ReactMethod
  public void toggleScan() {
    final Activity activity = getCurrentActivity();
    if (isScanning) {
      sm.stopScan();
      activity.unregisterReceiver(mScanReceiver);
      isScanning = false;
    } else {
      sm.startScan();
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
