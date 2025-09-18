import {
  Pressable,
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { createUserWithEmailAndPassword } from 'firebase/auth'; //登録するやつ
import { auth } from '../../config'; //登録するやつ
import Button from '../../components/Button';

//useNavigationは

const Signin = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSignInPress = (email: string, password: string) => {
    console.log(email, password);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential.user.uid);
        router.replace('../screens/StudyTimeScreen'); //ここにメインメニュー,スタックの中をこれで上書きする(これだけで上書きする)
      })
      .catch((e) => {
        const { code, message } = e;
        console.log(code, message);
        Alert.alert(message);
      });
  }; //新規登録チェック

  return (
    // ここを <View> から <SafeAreaView> に変更！
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleFlame}>
          <Text style={styles.titleText}>勉強アプリ</Text>
          <Text style={styles.titleText}>新規登録</Text>
        </View>
        <View style={styles.inputFlame}>
          <MaterialIcons name="account-circle" size={24} style={styles.image} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="ユーザーネーム"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        </View>
        <View style={styles.inputFlame}>
          <MaterialIcons name="lock" size={24} style={styles.image} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="パスワード"
            placeholderTextColor="#999"
            secureTextEntry // パスワード入力用に追記するとより良い(隠すやつ)
            autoCapitalize="none"
            textContentType="password"
          />
        </View>
        <Button
          title="新規登録"
          onPress={() => handleSignInPress(email, password)}
          size="medium"
          style={{ width: '30%', marginTop: 8 }}
        />
        {/* onPressの中には、関数というよりもこれを実行するっていうのを置いてるだけなので、引数を渡せない */}
        <View style={styles.ToLogIn}>
          <Text>アカウントをお持ちですか？</Text>
          <Link href={'../screens/LoginScreen'} asChild>
            <TouchableOpacity>
              <Text style={styles.LogInLink}>ログイン</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView> // ここも忘れずに変更
  );
};

//StyleSheet.createというメソッドがオブジェクトを受け取って、cssを適用するものなので、必須
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    alignItems: 'center',
  },
  titleFlame: {
    marginBottom: 48,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  inputFlame: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 24,
    height: 24,
    marginRight: 12,
    color: '#666',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  ToLogIn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  LogInLink: {
    color: '#5c6bc0',
    fontWeight: '600',
    fontSize: 16,
  },
});

//このままだとこのファイルでしか使えない
//exportすることで、他のファイルでimportができる！！
export default Signin;
