// src/test/ZustandTestComponent.js
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import useTestStore from './zustandTest'

export default function ZustandTestComponent() {
  const { count, increment } = useTestStore()
  
  return (
    <View style={{ padding: 20 }}>
      <Text>Count: {count}</Text>
      <TouchableOpacity onPress={increment}>
        <Text>Increment</Text>
      </TouchableOpacity>
    </View>
  )
}