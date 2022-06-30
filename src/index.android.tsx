import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
import { useEffect, useState } from 'react';
const { OS, constants } = Platform;

enum LecomEvents {
  ScanSuccess = 'EventLecomScanSuccess',
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

const isLecom =
  OS === 'android' && constants.Brand === 'alps' && constants.Model === 'PDA';

/**
 * Emitter to listen to the 'EventLecomScanSuccess' event.
 */
const LecomScanEmitter = new NativeEventEmitter(LecomScan);

const init = () => LecomScan.init();

const toggleScan = () => LecomScan.toggleScan();

const useLecomScan = ({ callback, isActive = true }: LecomScanOptions = {}) => {
  const [code, setCode] = useState('');
  const isDevice = isLecom;

  const onScanSuccess = async (c: string) => {
    if (callback) await callback(c);

    setCode(c);
  };

  useEffect(() => {
    if (isActive && isLecom) init();

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

module.exports = {
  useLecomScan,
  toggleScan,
  init,
};
