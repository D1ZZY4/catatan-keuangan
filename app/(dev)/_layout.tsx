import { Stack } from 'expo-router';

export default function DevLayout(): React.ReactElement {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ui-check" />
    </Stack>
  );
}
