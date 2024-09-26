package com.lecomscan

import com.facebook.react.bridge.ReactApplicationContext

abstract class LecomScanSpec internal constructor(context: ReactApplicationContext) :
  NativeLecomScanSpec(context) {

  abstract override fun init()
  abstract override fun stop()
  abstract override fun toggleScan()
}
