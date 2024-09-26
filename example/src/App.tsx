import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useLecomScan } from 'react-native-lecom-scan'

export default function App() {
  const [result, setResult] = useState<string | undefined>()
  useLecomScan({
    callback: (code) => setResult(code),
  })

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
})
