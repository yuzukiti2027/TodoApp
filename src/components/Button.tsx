import { Text, StyleSheet, Pressable, TouchableOpacity } from "react-native";

type Buttonprops = {
  onPress: () => void; //関数が入るような変数
  label?: string;
};

const Button = ({ onPress, label }: Buttonprops) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.buttonLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default Button;
