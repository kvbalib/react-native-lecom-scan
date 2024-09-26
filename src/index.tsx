import { Platform } from 'react-native'

import type { LecomHook, LecomScanOptions, LecomToggleScan } from './NativeLecomScan'

/**
 * Function used to programmatically toggle scan mode.
 */
const toggleScan: LecomToggleScan = () => {}

/**
 * (Android only) Hook used for the scanner integration.
 * Initializes the scanner and returns scanned code.
 *
 * @param options
 */
const useLecomScan: LecomHook = ({}: LecomScanOptions = {}) => ({
  code: '',
  isDevice: false,
  deviceModel: Platform.OS === 'android' ? Platform.constants.Brand : undefined,
})

export { toggleScan, useLecomScan }
