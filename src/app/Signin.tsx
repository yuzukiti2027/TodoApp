import {View, Text, StyleSheet, TextInput, Image, SafeAreaView} from 'react-native'
import {useState} from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

const Signin = (): JSX.Element => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  return (
    // ここを <View> から <SafeAreaView> に変更！
    <SafeAreaView style={styles.container}>
      <Header label="Sign in" />
      <View style={styles.content}>
        <View style={styles.inputFlame}>
        <Image
          source={require('../../assets/kkrn_icon_user_13.png')}
          style={styles.image}
        />
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholder='Username'
        />
        </View>
        <View style={styles.inputFlame}>
        <Image
          source={require('../../assets/kkrn_icon_kagi_21.png')}
          style={styles.image}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholder='Password'
          secureTextEntry // パスワード入力用に追記するとより良い
        />
        </View>
        <View style={styles.button}>
          <Text style={styles.buttonLabel} onPress={() => {}}>新規登録</Text>
        </View>
        <View style={styles.ToLogIn}>
          <Text>アカウントをお持ちですか？</Text>
          <Text style={styles.LogInLink}>ログイン</Text>
        </View>
      </View>
      <Footer />
    </SafeAreaView> // ここも忘れずに変更
  )
}

//StyleSheet.createというメソッドがオブジェクトを受け取って、cssを適用するものなので、必須
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',//先頭の要素を上端に、最後の要素を下端に配置、真ん中の要素はその間に配置
    },
    content:{
        flex: 1,
        gap: 32, // 要素間のスペースを設定
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputFlame: {
        width: '80%',
        flexDirection: 'row',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,//角を丸くする
    },
    image: {
      // borderColor: 'gray',
      // borderWidth: 1,
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 8,
      width: 50,
      height: 50,
    },
    input: {
        // borderColor: 'gray',
        // borderWidth: 1,
        width: '76%',
        height: 66,
        paddingHorizontal: 8,//左右のpadding
        zIndex: 1, // テキスト入力が他の要素の下に隠れないようにする
        fontSize: 20,
    },
    text: {
        color: 'white',
        backgroundColor: 'blue',
        fontSize: 40,
        fontWeight: 'bold',
        padding: 16
    },
    button: {
        width: '30%',
        height: 45,
        borderRadius: 8,
        backgroundColor: 'orange',
        justifyContent: 'center',
        textAlign: 'right',
        position: 'relative',
        bottom: 0, // フッターの上に配置
        left: 95, // 中央に配置
    },
    buttonLabel: {
        textAlign: 'center',
        color: '#0000FF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    debug: { // デバッグ用のスタイル
        borderWidth: 2,
        borderColor: 'red',
    },
    ToLogIn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    LogInLink: {
        color: 'blue',
        textDecorationLine: 'underline', // 下線を引く
    },

})

//このままだとこのファイルでしか使えない
//exportすることで、他のファイルでimportができる！！
export default Signin
