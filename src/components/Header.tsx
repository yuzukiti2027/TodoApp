import {View, Text, StyleSheet} from 'react-native'

//いったんこのJSXエラーは無視！！
type HeaderProps = {
    label: string;
}

const Header = ({label}: HeaderProps): JSX.Element => {
    return (
        <View>
            <Text style={styles.text}>{label}</Text>
        </View>
    )
}

//StyleSheet.createというメソッドがオブジェクトを受け取って、cssを適用するものなので、必須
const styles = StyleSheet.create({
    text: {
        flex: 0,
        width: '100%',
        textAlign: 'center',
        color: 'white',
        backgroundColor: 'orange',
        fontSize: 40,
        fontWeight: 'bold',
        paddingTop: 24,
        paddingBottom: 16,
    }
})

//このままだとこのファイルでしか使えない
//exportすることで、他のファイルでimportができる！！
export default Header
