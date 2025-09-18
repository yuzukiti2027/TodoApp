import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Layout = () => {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SafeAreaProvider>
  );
};

export default Layout;
