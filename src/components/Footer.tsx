import {View, Text, StyleSheet} from 'react-native'

//いったんこのJSXエラーは無視！！
const Footer = (): JSX.Element => {
    return (
        <View>
            <Text style={styles.text}>TodoApp</Text>
        </View>
    )
}

//StyleSheet.createというメソッドがオブジェクトを受け取って、cssを適用するものなので、必須
const styles = StyleSheet.create({
    text: {
        height: 80,
        width: '100%',
        textAlign: 'center',
        color: 'white',
        backgroundColor: 'orange',
        fontSize: 20,
        fontWeight: 'bold',
        paddingTop: 24,
        paddingBottom: 16,
    }
})

//このままだとこのファイルでしか使えない
//exportすることで、他のファイルでimportができる！！
export default Footer
