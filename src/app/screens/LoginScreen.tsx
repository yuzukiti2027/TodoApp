import {
  Pressable,
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config';
// import Header from "../../components/Header";
// import Footer from "../../components/Footer";

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLoginPress = (email: string, password: string) => {
    //ログイン
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential.user.uid);
        router.replace('../screens/StudyTimeScreen');
      })
      .catch((e) => {
        const { code, message } = e;
        console.log(code, message);
        Alert.alert(message);
      });
  };

  return (
    // ここを <View> から <SafeAreaView> に変更！
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.titleFlame}>
            <Text style={styles.titleText}>勉強アプリ</Text>
            <Text style={styles.titleText}>ログイン</Text>
          </View>
          <View style={styles.inputFlame}>
            <Image
              source={require('../../../assets/kkrn_icon_user_13.png')}
              style={styles.image}
            />
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
            <Image
              source={require('../../../assets/kkrn_icon_kagi_21.png')}
              style={styles.image}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholder="パスワード"
              placeholderTextColor="#999"
              secureTextEntry // パスワード入力用に追記するとより良い
              autoCapitalize="none"
              textContentType="password"
            />
          </View>
          <Button
            onPress={() => {
              handleLoginPress(email, password);
            }}
            title="ログイン"
            size="medium"
            style={{ width: '30%', marginTop: 8 }}
          />
          <View style={styles.ToSignIn}>
            <Text>アカウントをお持ちでないですか？</Text>
            <Link href="../screens/SigninScreen" asChild replace>
              <TouchableOpacity>
                <Text style={styles.SignInLink}>新規登録</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
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
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  ToSignIn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  SignInLink: {
    color: '#5c6bc0',
    fontWeight: '600',
    fontSize: 16,
  },
});

//このままだとこのファイルでしか使えない
//exportすることで、他のファイルでimportができる！！
export default Login;
