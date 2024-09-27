import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'

export interface Spec extends TurboModule {
  init(): void
  stop(): void
  toggleScan(): void
}

export default TurboModuleRegistry.getEnforcing<Spec>('LecomScan')

type Callback = (code: string) => void

type AsyncCallback = (code: string) => Promise<void>

export interface LecomScanOptions {
  /**
   * Callback to invoke on a successful scan.
   * @param code
   */
  callback?: Callback | AsyncCallback
  /**
   * Should the scanner be initialized.
   */
  isActive?: boolean
  /**
   * Custom model name override.
   */
  model?: string
}

/**
 * (Android only) Hook used for the scanner integration.
 * Initializes the scanner and returns scanned code.
 */
export type LecomHook = (options?: LecomScanOptions) => {
  code: string
  isDevice: boolean
  model?: string
}

/**
 * Function used to programmatically toggle scan mode.
 */
export type LecomToggleScan = () => void
