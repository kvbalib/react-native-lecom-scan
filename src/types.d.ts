declare module 'react-native-lecom-scan' {
  import type { LecomHook, LecomToggleScan } from '../types'

  export const useLecomScan: LecomHook
  export const toggleScan: LecomToggleScan
}
