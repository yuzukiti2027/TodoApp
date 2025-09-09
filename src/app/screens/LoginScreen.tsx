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
              placeholder="Username"
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
              placeholder="Password"
              secureTextEntry // パスワード入力用に追記するとより良い
              autoCapitalize="none"
              textContentType="password"
            />
          </View>
          <Button
            onPress={() => {
              handleLoginPress(email, password);
            }}
            label="ログイン"
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
    justifyContent: 'space-between', //先頭の要素を上端に、最後の要素を下端に配置、真ん中の要素はその間に配置
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    gap: 32, // 要素間のスペースを設定
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleFlame: {
    marginTop: 56,
  },
  titleText: {
    fontSize: 40,
    textAlign: 'center',
    color: '#8b8b8bff',
  },
  inputFlame: {
    height: 56,
    width: '80%',
    flexDirection: 'row',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8, //角を丸くする
  },
  image: {
    // borderColor: 'gray',
    // borderWidth: 1,
    marginTop: 3,
    marginLeft: 8,
    width: 50,
    height: 50,
  },
  input: {
    // borderColor: 'gray',
    // borderWidth: 1,
    flex: 1,
    width: '72%',
    height: 56,
    paddingHorizontal: 8, //左右のpadding
    fontSize: 20,
  },
  text: {
    color: 'white',
    backgroundColor: 'blue',
    fontSize: 40,
    fontWeight: 'bold',
    padding: 16,
  },
  debug: {
    // デバッグ用のスタイル
    borderWidth: 2,
    borderColor: 'red',
  },
  ToSignIn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  SignInLink: {
    color: 'blue',
    textDecorationLine: 'underline', // 下線を引く
  },
});

//このままだとこのファイルでしか使えない
//exportすることで、他のファイルでimportができる！！
export default Login;
