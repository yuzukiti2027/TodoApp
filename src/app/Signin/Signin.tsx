import {
  Pressable,
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";

import Button from "../../components/Button";

//useNavigationは

const Signin = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSignInPress = () => {
    router.replace('/')//ここにメインメニューなるほどね、スタックの中をこれで上書きするんだ
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
          <MaterialIcons name="account-circle" size={40} style={styles.image} />
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholder="Username"
          />
        </View>
        <View style={styles.inputFlame}>
          <FontAwesome6 name="key" size={30} style={styles.image} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="Password"
            secureTextEntry // パスワード入力用に追記するとより良い(隠すやつ)
          />
        </View>
        <Button label="新規登録" />
        <View style={styles.ToLogIn}>
          <Text>アカウントをお持ちですか？</Text>
          <Link href={"../Login/Login"} asChild>
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
    justifyContent: "space-between", //先頭の要素を上端に、最後の要素を下端に配置、真ん中の要素はその間に配置
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    gap: 32, // 要素間のスペースを設定
    alignItems: "center",
    justifyContent: "flex-start",
  },
  titleFlame: {
    marginTop: 56,
  },
  titleText: {
    fontSize: 40,
    textAlign: "center",
    color: "#8b8b8bff",
  },
  inputFlame: {
    height: 56,
    width: "80%",
    flexDirection: "row",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8, //角を丸くする
  },
  image: {
    // borderColor: 'gray',
    // borderWidth: 1,
    marginTop: 8,
    marginLeft: 8,
  },
  input: {
    // borderColor: 'gray',
    // borderWidth: 1,
    width: "72%",
    height: 56,
    paddingHorizontal: 8, //左右のpadding
    fontSize: 20,
  },
  text: {
    color: "white",
    backgroundColor: "blue",
    fontSize: 40,
    fontWeight: "bold",
    padding: 16,
  },
  button: {
    width: "30%",
    height: 45,
    borderRadius: 8,
    backgroundColor: "orange",
    justifyContent: "center",
    textAlign: "right",
    position: "relative",
    bottom: 0, // フッターの上に配置
    left: 95, // 中央に配置
  },
  buttonLabel: {
    textAlign: "center",
    color: "#0000FF",
    fontSize: 20,
    fontWeight: "bold",
  },
  debug: {
    // デバッグ用のスタイル
    borderWidth: 2,
    borderColor: "red",
  },
  ToLogIn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  LogInLink: {
    color: "blue",
    textDecorationLine: "underline", // 下線を引く
  },
});

//このままだとこのファイルでしか使えない
//exportすることで、他のファイルでimportができる！！
export default Signin;
