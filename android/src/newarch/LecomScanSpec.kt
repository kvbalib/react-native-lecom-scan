package com.lecomscan

import com.facebook.react.bridge.ReactApplicationContext

abstract class LecomScanSpec internal constructor(context: ReactApplicationContext) :
  NativeLecomScanSpec(context) {

    abstract fun addListener(eventName: String)
    abstract fun removeListeners(count: Int)
}
