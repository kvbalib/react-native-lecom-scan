import { useCallback, useEffect, useState } from 'react'
import { NativeEventEmitter, NativeModules, Platform } from 'react-native'
import type { EmitterSubscription } from 'react-native'

import type { LecomHook, LecomScanOptions, LecomToggleScan } from './NativeLecomScan'

const LINKING_ERROR =
  `The package 'react-native-lecom-scan' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n'

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null

const LecomScanModule = isTurboModuleEnabled
  ? require('./NativeLecomScan').default
  : NativeModules.LecomScan

const LecomScan = LecomScanModule
  ? LecomScanModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR)
        },
      }
    )

const { OS, constants } = Platform

enum LecomEvents {
  ScanSuccess = 'EventLecomScanSuccess',
}

/**
 * Lecom scanner models matching Platform.constants.Brand.
 */
enum LecomModels {
  N60 = 'N60',
  T80 = 'alps',
}

/**
 * Function used to check if the device is a Lecom scanner.
 * @param model - custom model name override.
 */
const checkLecom = (model?: string): boolean => {
  if (OS === 'android' && constants.Model === 'PDA') {
    return (
      constants.Brand === model ||
      constants.Brand === LecomModels.N60 ||
      constants.Brand === LecomModels.T80
    )
  }

  return false
}

/**
 * Emitter to listen to the 'EventLecomScanSuccess' event.
 */
const LecomScanEmitter = Platform.OS === 'android' ? new NativeEventEmitter(LecomScan) : null

/**
 * Function used to initialize the scanner.
 */
const init = () => LecomScan.init()

/**
 * Function used to stop the scanner.
 */
const stop = () => LecomScan.stop()

/**
 * Function used to programmatically toggle scan mode.
 */
export const toggleScan: LecomToggleScan = () => LecomScan.toggleScan()

/**
 * (Android only) Hook used for the scanner integration.
 * Initializes the scanner and returns scanned code.
 * The hook can be called in an iOS environment, it will stay agnostic and do nothing.
 */
export const useLecomScan: LecomHook = ({
  callback,
  isActive = true,
  model,
}: LecomScanOptions = {}) => {
  const [code, setCode] = useState('')
  const isDevice = checkLecom(model)

  const onScanSuccess = useCallback(
    async (c: string) => {
      if (callback) await callback(c)

      setCode(c)
    },
    [callback]
  )

  useEffect(() => {
    let subscription: EmitterSubscription | undefined

    if (Platform.OS === 'android' && LecomScanEmitter && isDevice) {
      if (isActive) {
        init()
        subscription = LecomScanEmitter.addListener(LecomEvents.ScanSuccess, (c) =>
          onScanSuccess(c)
        )
      } else {
        stop()
      }
    }

    return () => {
      if (subscription) subscription.remove()
      if (isDevice) stop()
    }
  }, [isActive, isDevice, onScanSuccess])

  return {
    code,
    isDevice,
    model: Platform.OS === 'android' ? Platform.constants.Brand : undefined,
  }
}
