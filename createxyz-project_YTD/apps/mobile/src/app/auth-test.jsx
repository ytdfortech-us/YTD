import React from 'react';
import { Stack } from 'expo-router';
import NeonAuthExample from '@/examples/NeonAuthExample';

export default function AuthTestScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Auth Test', headerShown: true }} />
      <NeonAuthExample />
    </>
  );
}