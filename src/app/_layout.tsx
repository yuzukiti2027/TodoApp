import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Layout = () => {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: 'orange',
          },
          headerTintColor: 'white',
          headerTitle: 'Todo App',
          headerBackTitle: 'Back',
          headerTitleStyle: {
            fontSize: 22,
            fontWeight: 'bold',
          },
        }}
      />
    </SafeAreaProvider>
  );
};

export default Layout;
