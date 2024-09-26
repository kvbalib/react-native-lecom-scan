import type { LecomHook, LecomScanOptions, LecomToggleScan } from './NativeLecomScan'

/**
 * Function used to programmatically toggle scan mode.
 */
export const toggleScan: LecomToggleScan = () => {}

/**
 * (Android only) Hook used for the scanner integration.
 * Initializes the scanner and returns scanned code.
 *
 * @param options
 */
export const useLecomScan: LecomHook = ({}: LecomScanOptions = {}) => ({
  code: '',
  isDevice: false,
})
