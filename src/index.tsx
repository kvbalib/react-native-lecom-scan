import { NativeModules, Platform, NativeEventEmitter } from 'react-native';

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

export const lecomScanEmitter = new NativeEventEmitter(LecomScan);

export function init() {
  return LecomScan.init();
}

export function toggleScan() {
  return LecomScan.toggleScan();
}

