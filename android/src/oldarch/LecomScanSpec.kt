package com.lecomscan

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise

abstract class LecomScanSpec internal constructor(context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  abstract fun init()
  abstract fun stop()
  abstract fun toggleScan()
  abstract fun addListener(eventName: String)
  abstract fun removeListeners(count: Int)
}
