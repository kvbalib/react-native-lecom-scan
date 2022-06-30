type Callback = (code: string) => void;

type AsyncCallback = (code: string) => Promise<void>;

interface LecomScanOptions {
  /**
   * Callback to invoke on a successful scan.
   * @param code
   */
  callback?: Callback | AsyncCallback;
  /**
   * Should the scanner be initialized.
   */
  isActive?: boolean;
}

/**
 * Hook used for the scanner integration.
 * Initializes the scanner and returns scanned code.
 *
 * @param options
 */
declare function useLecomScan(options?: LecomScanOptions): {
  code: string;
  isDevice: boolean;
};

/**
 * Function used to programmatically toggle scan mode.
 */
declare function toggleScan(): void;

/**
 * Function used to initialize the scanner.
 */
declare function init(): void;
