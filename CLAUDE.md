# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`react-native-lecom-scan` is a thin React Native wrapper around the vendored Lecom Android scanner SDK (`android/libs/LecomScan_SDK_release_v2.2.1.jar`). It targets Lecom T80 (`Platform.constants.Brand === 'alps'`) and N60 (`Brand === 'N60'`) PDAs. **iOS is intentionally not supported** — it was removed in commit `1f511cd` and the JS surface degrades to noops on every non-Android platform.

The package is published to npm and uses Yarn workspaces (Yarn 3, Berry — `npm` will not work). The example app under `example/` is a `react-native-test-app` host used for manual verification on real hardware.

## Commands

Always use `yarn`, never `npm`. The `.nvmrc` pins Node.

```sh
yarn                  # install (root + example workspace)
yarn typecheck        # tsc, no emit
yarn lint             # eslint
yarn lint --fix       # autofix
yarn test             # jest (currently a single it.todo placeholder)
yarn prepare          # bob build — runs on install; regenerate lib/ after src/ changes
yarn clean            # delete lib/ and example build folders
yarn release          # release-it (conventional-changelog, publishes to npm + GitHub)
```

Run a single Jest test: `yarn test -t "<name pattern>"` or `yarn test path/to/file.test.tsx`.

Example app (must be run on a real Lecom device — emulators won't have `android.device.ScanDevice`):

```sh
yarn example start
yarn example android
ORG_GRADLE_PROJECT_newArchEnabled=true yarn example android   # new arch (Fabric/Turbo)
```

Pre-commit hooks (`lefthook.yml`) run `yarn lint --quiet` and `tsc` in parallel; `commit-msg` runs commitlint with the conventional-commits config. Commit prefixes: `fix`, `feat`, `refactor`, `docs`, `test`, `chore`.

## Architecture

### Platform split (the non-obvious part)

There are two entry points selected by Metro at bundle time:

- `src/index.ts` — default/fallback. Every export is a noop or returns `{ code: '', isDevice: false, model: undefined }`. This is what iOS, web, and any non-Android platform get.
- `src/index.android.ts` — the real implementation. Wires up `NativeModules.LecomScan` (or the TurboModule via `require('./NativeLecomScan').default` when `global.__turboModuleProxy` is present) and a `NativeEventEmitter`.

Public API: `useLecomScan(options)`, `toggleScan()`, `initScanner()`, `stopScanner()`. Types live in `src/NativeLecomScan.ts` and are shared between both entry points.

### New arch / old arch dual support

The module compiles for both Bridge and TurboModule architectures from one source tree:

- `src/NativeLecomScan.ts` is the codegen spec (`TurboModuleRegistry.getEnforcing<Spec>('LecomScan')`). `package.json#codegenConfig` emits Java into `android/generated/` with package `com.lecomscan` and library name `RNLecomScanSpec`.
- `android/src/newarch/LecomScanSpec.kt` extends the codegen-generated `NativeLecomScanSpec` (TurboModule path).
- `android/src/oldarch/LecomScanSpec.kt` is the bridge-era equivalent.
- `android/build.gradle` swaps `srcDirs` between `src/newarch` + `generated/{java,jni}` and `src/oldarch` based on `newArchEnabled`. `BuildConfig.IS_NEW_ARCHITECTURE_ENABLED` flows into `LecomScanPackage` so `ReactModuleInfo.isTurboModule` is set correctly.
- `LecomScanModule.kt` extends whichever `LecomScanSpec` is on the classpath and works under both arches.

When changing the spec (`src/NativeLecomScan.ts`), both Kotlin Spec stubs must be updated in lockstep, and consumers will need a clean rebuild because `android/generated/` is regenerated.

### Native scan flow

`LecomScanModule` (`android/src/main/java/com/lecomscan/LecomScanModule.kt`) is the heart of the integration:

1. `init()` instantiates `android.device.ScanDevice`, calls `setOutScanMode(0)` (broadcast mode), and registers a `BroadcastReceiver` for the action `scan.rcv.message`.
2. The receiver reads the `barocode` byte array (note: SDK typo — do not "fix" it) and `length` int from the intent, decodes to a String, and emits `EventLecomScanSuccess` to JS via `RCTNativeAppEventEmitter`. Emission is posted to the main `Handler` because the receiver fires on a binder thread.
3. `toggleScan()` flips `isScanning`; on transition to active it calls `sd.startScan()` (the trigger), otherwise `stop()`.
4. `LifecycleEventListener` pauses/resumes the scan with the host activity and tears everything down on destroy. `onCatalystInstanceDestroy` is overridden as a deprecated-but-still-called safety net.

`IS_SCAN_DEVICE_AVAILABLE` is a static `Class.forName("android.device.ScanDevice")` probe so the module is safe to load on non-Lecom Android devices (returns false → `init()` becomes a noop).

### React hook contract

`useLecomScan` (in `src/index.android.ts`):

- `isDevice` is computed from `Platform.constants.Model === 'PDA'` AND `Platform.constants.Brand` matching `N60`, `alps`, or a caller-supplied `model` override. Anything else → noop hook.
- The hook deduplicates consecutive identical scans via `lastCodeRef` before calling `callback` and `setCode`. If you need every trigger pull (including repeats), this dedup is the thing to revisit.
- The effect calls `init()` when `isActive && isDevice`, subscribes to `EventLecomScanSuccess`, and always calls `stop()` on cleanup.

## Things to know before changing native code

- Do not rename the intent extra `barocode` — that key is defined by the Lecom SDK, not by us.
- The vendored JAR is the only source of `android.device.ScanDevice`; don't try to mock or shim it for unit tests, just gate on `IS_SCAN_DEVICE_AVAILABLE`.
- `RCTNativeAppEventEmitter` is used directly (not `DeviceEventManagerModule`) — JS subscribes via `NativeEventEmitter(LecomScan)`. `addListener`/`removeListeners` exist on the spec only to satisfy the JS-side EventEmitter contract; they are intentional noops.
- `react-native-builder-bob` outputs to `lib/` (commonjs + ESM module + d.ts). `lib/` is gitignored but shipped in the npm tarball; never edit it by hand.
