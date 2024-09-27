package com.lecomscan

import com.facebook.react.bridge.ReactApplicationContext

abstract class LecomScanSpec internal constructor(context: ReactApplicationContext) :
  NativeLecomScanSpec(context) {

  override abstract fun init()
  override abstract fun stop()
  override abstract fun toggleScan()
  override abstract fun addListener(eventName: String)
  override abstract fun removeListeners(count: Double)
}
