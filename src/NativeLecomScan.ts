import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'

export interface Spec extends TurboModule {
  init(): void
  stop(): void
  toggleScan(): void
  addListener(eventName: string): void
  removeListeners(count: number): void
}

export default TurboModuleRegistry.getEnforcing<Spec>('LecomScan')

export interface LecomScanOptions {
  /**
   * Callback to invoke on a successful scan.
   * @param code
   */
  callback?: ((code: string) => Promise<void>) | ((code: string) => void)
  /**
   * Should the scanner be initialized.
   */
  isActive?: boolean
  /**
   * Custom model name override.
   */
  model?: string
}

export type LecomToggleScan = () => void

export type LecomHook = (options?: LecomScanOptions) => {
  code: string
  isDevice: boolean
  model?: string
}
