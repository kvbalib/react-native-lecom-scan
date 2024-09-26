package com.lecomscan

import com.facebook.react.bridge.ReactApplicationContext

abstract class LecomScanSpec internal constructor(context: ReactApplicationContext) :
  NativeLecomScanSpec(context) {

  abstract fun init()
  abstract fun stop()
  abstract fun toggleScan()
}
