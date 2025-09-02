import { initializeApp } from "firebase/app";
import {initializeAuth, getReactNativePersistence} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import  ReactNativeAsyncStorage  from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBGI9MMrWj04PKi2eWetlJ9FoEIyVX6HlM",
    authDomain: "todoapp-1c714.firebaseapp.com",
    projectId: "todoapp-1c714",
    storageBucket: "todoapp-1c714.firebasestorage.app",
    messagingSenderId: "572282586963",
    appId: "1:572282586963:web:83c9f126911507146703a6"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage);
})

const db = getFirestore(app);

export {app, auth, db}