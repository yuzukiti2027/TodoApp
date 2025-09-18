import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../config';
//ユーザのログイン情報を確認

const Index = () => {
  useEffect(() => {
    //ユーザのログイン情報を確認
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user !== null) {
        router.replace('/screens/StudyTimeScreen');
      } else {
        router.replace('/screens/LoginScreen');
      }
    });

    return () => unsubscribe();
  }, []);
  return <Redirect href="/screens/LoginScreen" />;
};

export default Index;
