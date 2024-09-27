import { Platform } from 'react-native'

import type { LecomHook, LecomToggleScan } from './NativeLecomScan'

export const toggleScan: LecomToggleScan = () => {}

/**
 * (Android only) Hook used for the scanner integration.
 * Initializes the scanner and returns scanned code.
 */
export const useLecomScan: LecomHook = () => {
  console.log('using ios useLecomScan')
  return {
    code: '',
    isDevice: false,
    model: Platform.OS === 'android' ? Platform.constants.Brand : undefined,
  }
}
