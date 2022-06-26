# react-native-lecom-scan

React Native implementation of Lecom scanner SDK.

## Installation

```sh
npm install react-native-lecom-scan
```

## Usage

```js
import { init, lecomScanEmitter } from "react-native-lecom-scan";

useEffect(() => {
  if (process.env.REACT_APP_LECOM === '1') {
    LecomScan.init()
  }

  const subscription = lecomScanEmitter.addListener('EventLecomScanSuccess', (code) => onCameraScannerSuccessRN(code))

  return () => {
    subscription.remove()
  }
}, [])
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
