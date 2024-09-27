package com.lecomscan

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.device.ScanDevice
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.RCTNativeAppEventEmitter

@ReactModule(name = LecomScanModule.NAME)
class LecomScanModule internal constructor(private val mContext: ReactApplicationContext) :
  LecomScanSpec(mContext), LifecycleEventListener {

  private var sd: ScanDevice? = null
  private val SCAN_ACTION = "scan.rcv.message"
  private var isScanning = false
  private var isReceiverRegistered = false

  init {
    mContext.addLifecycleEventListener(this)
  }

  private val handler = Handler(Looper.getMainLooper())

  // BroadcastReceiver to handle scan results
  private val mScanReceiver: BroadcastReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
      val action = intent.action
      if (SCAN_ACTION == action) {
        val barcode = intent.getByteArrayExtra("barocode")
        val barcodeStr = barcode?.let {
          val barcodeLen = intent.getIntExtra("length", 0)
          String(it, 0, barcodeLen)
        }
        barcodeStr?.let {
          handler.post {
            val emitter = mContext.getJSModule(RCTNativeAppEventEmitter::class.java)
            emitter.emit("EventLecomScanSuccess", barcodeStr)
          }
        }
        sd?.stopScan()
        isScanning = false
      }
    }
  }

  override fun getName(): String {
    return NAME
  }

  // Register BroadcastReceiver for scan results
  private fun registerReceiver() {
    if (!isReceiverRegistered) {
      val filter = IntentFilter()
      filter.addAction(SCAN_ACTION)
      mContext.registerReceiver(mScanReceiver, filter)
      isReceiverRegistered = true
    }
  }

  // Unregister BroadcastReceiver for scan results
  private fun unregisterReceiver() {
    if (isReceiverRegistered) {
      try {
        mContext.unregisterReceiver(mScanReceiver)
      } catch (e: IllegalArgumentException) {
        // Handle the case where the receiver was not registered
      }
      isReceiverRegistered = false
    }
  }

  private fun isScanDeviceAvailable(): Boolean {
    return try {
      Class.forName("android.device.ScanDevice")
      true
    } catch (e: ClassNotFoundException) {
      false
    }
  }

  // Initialize the ScanDevice and register the receiver
  @ReactMethod
  override fun init() {
    try {
      if (isScanDeviceAvailable()) {
        if (sd == null) {
          sd = ScanDevice()
          sd?.setOutScanMode(0)  // Mode-value: 0 for broadcast mode
        }
        registerReceiver()
      } else {
        // Optionally, emit an event or log that the ScanDevice is not available
      }
    } catch (e: Exception) {
      Log.e("LecomScanModule", "Error initializing scanner: $e")
    }
  }

  // Stop the ScanDevice and unregister the receiver
  @ReactMethod
  override fun stop() {
    sd?.stopScan()
    sd = null
    unregisterReceiver()
    isScanning = false
  }

  // Toggle scanning: Start or stop based on current state
  @ReactMethod
  override fun toggleScan() {
    if (isScanning) {
      stop()
    } else {
      if (sd == null) {
        sd = ScanDevice()
        sd?.setOutScanMode(0)
      }
      sd?.startScan()
      isScanning = true
    }
  }

  // Required for rn built-in EventEmitter Calls
  @ReactMethod
  override fun addListener(eventName: String) {
    // No operation needed here, just for consistency with JS EventEmitter
  }

  @ReactMethod
  override fun removeListeners(count: Double) {
    // No operation needed here, just for consistency with JS EventEmitter
  }

  override fun onHostResume() {
    if (isScanning) {
      sd?.startScan()
    }
  }

  override fun onHostPause() {
    if (isScanning) {
      sd?.stopScan()
    }
  }

  override fun onHostDestroy() {
    // Activity has been destroyed
    stop()
  }

  override fun onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy()
    stop()
    mContext.removeLifecycleEventListener(this)
  }

  companion object {
    const val NAME = "LecomScan"
  }
}
