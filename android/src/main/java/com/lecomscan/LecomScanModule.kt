package com.lecomscan

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.device.ScanDevice
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import com.facebook.react.bridge.Promise
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = LecomScanModule.NAME)
class LecomScanModule internal constructor(context: ReactApplicationContext) : LecomScanSpec(context) {

  private var sd: ScanDevice? = null
  private val SCAN_ACTION = "scan.rcv.message"
  private var isScanning = false
  private val mContext: ReactApplicationContext = context

  // BroadcastReceiver to handle scan results
  private val mScanReceiver: BroadcastReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
      val action = intent.action
      if (SCAN_ACTION == action) {
        val barcode = intent.getByteArrayExtra("barocode")
        val barcodeLen = intent.getIntExtra("length", 0)
        val barcodeStr = String(barcode!!, 0, barcodeLen)
        val emitter = mContext.getJSModule(RCTNativeAppEventEmitter::class.java)
        emitter.emit("EventLecomScanSuccess", barcodeStr)
        sd?.stopScan()
      }
    }
  }

  override fun getName(): String {
    return NAME
  }

  // Register BroadcastReceiver for scan results
  private fun registerReceiver() {
    val activity: Activity? = currentActivity
    activity?.let {
      val filter = IntentFilter()
      filter.addAction(SCAN_ACTION)
      it.registerReceiver(mScanReceiver, filter)
    }
  }

  // Unregister BroadcastReceiver for scan results
  private fun unregisterReceiver() {
    val activity: Activity? = currentActivity
    activity?.unregisterReceiver(mScanReceiver)
  }

  // Initialize the ScanDevice and register the receiver
  @ReactMethod
  override fun init() {
    sd = ScanDevice()
    sd?.setOutScanMode(0)  // Mode-value: 0 for broadcast mode
    registerReceiver()
  }

  // Stop the ScanDevice and unregister the receiver
  @ReactMethod
  override fun stop() {
    sd?.stopScan()
    unregisterReceiver()
    isScanning = false
  }

  // Toggle scanning: Start or stop based on current state
  @ReactMethod
  override fun toggleScan() {
    if (isScanning) {
      stop()
    } else {
      sd?.startScan()
      registerReceiver()
      isScanning = true
    }
  }

  // Required for rn built-in EventEmitter Calls
  @ReactMethod
  fun addListener(eventName: String) {
    // No operation needed here, just for consistency with JS EventEmitter
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // No operation needed here, just for consistency with JS EventEmitter
  }

  companion object {
    const val NAME = "LecomScan"
  }
}
