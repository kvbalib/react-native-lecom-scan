import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
import { useEffect, useState } from 'react';

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
  /**
   * Should the device be checked to be a Lecom Scanner PDA before initializing.
   */
  checkDevice?: boolean;
}

enum LecomEvents {
  ScanSuccess = 'EventLecomScanSuccess',
}

const LINKING_ERROR =
  `The package 'react-native-lecom-scan' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const checkModel = (constants: any) =>
  Boolean(
    (constants.Brand && constants.Brand) === 'alps' &&
      (constants.Model && constants.Model) === 'PDA'
  );

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
 * @param checkDevice
 *
 * @return code
 */
export const useLecomScan = ({
  callback,
  isActive = true,
  checkDevice = true,
}: LecomScanOptions = {}) => {
  const [code, setCode] = useState('');
  const isDevice = Boolean(checkDevice && checkModel(Platform.constants));

  const onScanSuccess = async (c: string) => {
    if (callback) await callback(c);

    setCode(c);
  };

  useEffect(() => {
    if (isActive && isDevice) init();

    const subscription = LecomScanEmitter.addListener(
      LecomEvents.ScanSuccess,
      (c) => onScanSuccess(c)
    );

    return () => subscription.remove();
  }, [isActive, isDevice]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    code,
    isDevice,
  };
};
