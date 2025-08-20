import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
//Expo routers 最近の主流(ExpoNavigationと比較して、フォルダの中身をすべてページと認識してくれる(Navigationは1つずつ設定が必要))

import Login from './src/app/Login';

// htmlをjsxで、cssとjsをそのままjsxとして書くことで、jsだけで全部やるみたいな
//tsxというのはReactのTypeScript、jsxはReactのJavaScript
  const App = (): JSX.Element => {

//機能
//Viewタグはdivタグ
//Textタグはpタグのようなもの
//Helloコンポーネントは子要素を受け取るものじゃないので、1つで完結<コンポーネント名/>
    return (
      <View style={styles.container}>
        <Login/>
      </View>
    );
  }

//基本はflexbox(初期からflexbox)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',//キャメルケース(_ではない)
    paddingTop: 20, // ステータスバーの高さを考慮
    // alignItems: 'center', // 水平方向の中央揃え
    // justifyContent: 'center', // 垂直方向の中央揃え
  },
});

export default App

