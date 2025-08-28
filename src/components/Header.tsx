import {View, Text, StyleSheet} from 'react-native'

//いったんこのJSXエラーは無視！！
type HeaderProps = {
    label?: string;
}

const Header = ({label}: HeaderProps) => {
    return (
        <View>
            <Text style={styles.text}>{label}</Text>
        </View>
    )
}

//StyleSheet.createというメソッドがオブジェクトを受け取って、cssを適用するものなので、必須
const styles = StyleSheet.create({
    text: {
        height: 60,
        width: '100%',
        textAlign: 'center',
        color: 'white',
        backgroundColor: 'orange',
        fontSize: 40,
        fontWeight: 'bold',
    }
})

//このままだとこのファイルでしか使えない
//exportすることで、他のファイルでimportができる！！
export default Header
