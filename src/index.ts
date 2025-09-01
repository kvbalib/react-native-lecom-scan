import type { LecomHook, LecomToggleScan } from './NativeLecomScan'

/**
 * Function used to programmatically toggle scan mode.
 */
export const toggleScan: LecomToggleScan = () => {
  // Do nothing on platforms other than Android.
}

/**
 * (Android only) Initialize the scanner (noop on unsupported platforms).
 */
export const initScanner = () => {}

/**
 * (Android only) Stop the scanner (noop on unsupported platforms).
 */
export const stopScanner = () => {}

/**
 * (Android only) Hook used for the scanner integration.
 * Initializes the scanner and returns scanned code.
 * The hook can be called in an iOS environment, it will stay agnostic and do nothing.
 */
export const useLecomScan: LecomHook = () => {
  // Do nothing on platforms other than Android.
  return {
    code: '',
    isDevice: false,
    model: undefined,
  }
}
