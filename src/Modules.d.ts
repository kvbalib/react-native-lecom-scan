type Callback = (code: string) => void;

type AsyncCallback = (code: string) => Promise<void>;

export interface LecomScanOptions {
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

export declare type LecomHook = (options?: LecomScanOptions) => {
  code: string;
  isDevice: boolean;
};

export declare type LecomToggleScan = () => void;
