import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
import { useEffect, useState } from 'react';
import type { LecomHook, LecomScanOptions, LecomToggleScan } from './Modules';
const { OS, constants } = Platform;

enum LecomEvents {
  ScanSuccess = 'EventLecomScanSuccess',
}

/**
 * Lecom scanner models matching Platform.constants.Brand.
 */
enum LecomModels {
  N60 = 'N60',
  T80 = 'alps',
}

const LINKING_ERROR = `The package 'react-native-lecom-scan' doesn't seem to be linked. Make sure you rebuilt the app after installing the package`;

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
 * Function used to check if the device is a Lecom scanner.
 * @param model - custom model name override.
 */
const checkLecom = (model?: string): boolean => {
  if (OS === 'android' && constants.Model === 'PDA') {
    return (
      constants.Brand === model ||
      constants.Brand === LecomModels.N60 ||
      constants.Brand === LecomModels.T80
    );
  }

  return false;
};

/**
 * Emitter to listen to the 'EventLecomScanSuccess' event.
 */
const LecomScanEmitter = new NativeEventEmitter(LecomScan);

/**
 * Function used to initialize the scanner.
 */
const init = () => LecomScan.init();

/**
 * Function used to programmatically toggle scan mode.
 */
export const toggleScan: LecomToggleScan = () => LecomScan.toggleScan();

/**
 * (Android only) Hook used for the scanner integration.
 * Initializes the scanner and returns scanned code.
 *
 * @param options
 */
export const useLecomScan: LecomHook = ({
  callback,
  isActive = true,
  model,
}: LecomScanOptions = {}) => {
  const [code, setCode] = useState('');
  const isDevice = checkLecom(model);

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
