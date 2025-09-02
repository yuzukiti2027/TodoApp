//firebaseの設定

import { initializeApp } from "firebase/app";
import {initializeAuth, getReactNativePersistence} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import  ReactNativeAsyncStorage  from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
//process.envで参照できる(実行結果は変わらないけど、追跡を隠せる(つまりenvにかくと隠ぺいされて〇))
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FB_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FB_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FB_APP_ID
};

//initializeAppでappやauthを初期化して使えるようにしてる
//そして他のファイルで使えるようにexport
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})

const db = getFirestore(app);

export {app, auth, db}