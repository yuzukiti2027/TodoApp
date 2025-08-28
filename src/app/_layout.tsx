import { Slot } from "expo-router";
import {SafeAreaProvider} from 'react-native-safe-area-context';

const Layout = () => {
    return (
        <SafeAreaProvider>
            <Slot />
        </SafeAreaProvider>
    )
}

export default Layout