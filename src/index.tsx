import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
import { useEffect, useState } from 'react';

interface LecomScanOptions {
  /**
   * Callback to invoke on a successful scan.
   * @param code
   */
  callback?: (code: string) => void;
  /**
   * Should the scanner be initialized.
   */
  isActive?: boolean;
}

enum LecomEvents {
  ScanSuccess = 'EventLecomScanSuccess',
}

const LINKING_ERROR =
  `The package 'react-native-lecom-scan' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const LecomScan = NativeModules.LecomScan
  ? NativeModules.LecomScan
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/**
 * Emitter to listen to the 'EventLecomScanSuccess' event.
 */
export const LecomScanEmitter = new NativeEventEmitter(LecomScan);

/**
 * Function used to initialize the scanner.
 */
export function init() {
  return LecomScan.init();
}

/**
 * Function used to programmatically toggle scan mode.
 */
export function toggleScan() {
  return LecomScan.toggleScan();
}

/**
 * Hook used for the scanner integration.
 * Initializes the scanner and returns scanned code.
 *
 * @param callback
 * @param isActive
 *
 * @return code
 */
export const useLecomScan = ({
  callback,
  isActive = true,
}: LecomScanOptions = {}) => {
  const [code, setCode] = useState('');
  const isAndroid = Platform.OS === 'android';

  const onScanSuccess = (c: string) => {
    if (callback) callback(c);

    setCode(c);
  };

  useEffect(() => {
    if (isActive && isAndroid) init();

    const subscription = LecomScanEmitter.addListener(
      LecomEvents.ScanSuccess,
      (c) => onScanSuccess(c)
    );

    return () => subscription.remove();
  }, [isActive, isAndroid]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    code,
  };
};
