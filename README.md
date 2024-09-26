# react-native-lecom-scan

React Native implementation of the Lecom scanner SDK. Tested with Lecom T80 and N60 scanners.

Current native Lecom SDK version: 2.2.1

## Installation

```sh
npm install react-native-lecom-scan

# or

yarn add react-native-lecom-scan

# or

expo install react-native-lecom-scan
```

## Usage

```ts
import { useLecomScan, toggleScan } from 'react-native-lecom-scan';

const MyComponent = () => {
  const { code, isDevice } = useLecomScan({
    callback: (scannedCode) => {
      console.log('Scanned Code:', scannedCode);
    },
    isActive: true,
  });

  return (
    <View>
      {isDevice ? (
        <Text>Scanned Code: {code}</Text>
      ) : (
        <Text>Lecom Scanner is not available on this device.</Text>
      )}
      <Button title="Toggle Scan" onPress={toggleScan} />
  </View>
);

export default MyComponent;
```

## API

### `useLecomScan(options: LecomScanOptions): LecomHook`

Hook to use the Lecom scanner.

#### Options (optional)

| Option   | Type       | Description                                         |
|----------|------------|-----------------------------------------------------|
| callback | `function` | A function that gets called with the scanned code.  |
| isActive | `boolean`  | Boolean to control if the scanner should be active (default: true). |
| model    | `string`   | Optional custom model name override.                |

*model* - The library was tested with T80 and N60 models. If you have a different model, you can pass the model name as a string to the `model` option.
The model name for your device can be obtained from the react-native's Platform module.

```ts
import { Platform } from 'react-native';

console.log(Platform.constants.Brand);
```

### toggleScan(): void

Function to toggle the scanning state programmatically.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
