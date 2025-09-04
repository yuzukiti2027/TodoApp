import {useRouter} from "expo-router"
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const BottomTab = () => {

    const router = useRouter();
  return (
    <View style={styles.bottomArea}>
      <View style={styles.bottomLine} />
      <View style={styles.bottomAs}>
        <TouchableOpacity style={styles.bottomItem}
        onPress={()=>{router.replace("../app/screens/MypageScreen.tsx")}}>
          <MaterialIcons name="bar-chart" size={40} color="#333" />
          <Text style={styles.bottomLabel}>勉強時間</Text>
        </TouchableOpacity>

        <View style={styles.bottomDivider} />
        <TouchableOpacity style={styles.bottomItem}
        onPress={()=>{router.replace("./MypageScreen.tsx")}}>
          <MaterialIcons name="add-circle-outline" size={40} color="#333" />
          <Text style={styles.bottomLabel}>時間の追加</Text>
        </TouchableOpacity>

        <View style={styles.bottomDivider} />
        <TouchableOpacity style={styles.bottomItem}
        onPress={()=>{router.replace("../app/screens/FriendScreen.tsx")}}>
          <Ionicons name="search" size={40} color="#333" />
          <Text style={styles.bottomLabel}>検索</Text>
        </TouchableOpacity>

        <View style={styles.bottomDivider} />
        <TouchableOpacity style={styles.bottomItem}
        onPress={()=>{router.replace("../app/screens/FriendScreen.tsx")}}>
          <MaterialIcons name="people-outline" size={40} color="#333" />
          <Text style={styles.bottomLabel}>フレンド</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    width: "100%",
    backgroundColor: "orange",
    paddingTop: 0,
  },
  bottomLine: {
    height: 0.5,
    backgroundColor: "#aa5c28ff",
    width: "100%",
    marginBottom: 0,
  },
  bottomAs: {
    flexDirection: "row",
    width: "100%",
    marginTop: 10,
    marginBottom: 8,
    alignItems: "center",
  },
  bottomDivider: {
    width: 1,
    height: 56,
    backgroundColor: "#e0e0e0",
  },
  bottomItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    flex: 1,
  },
  bottomIcon: {
    fontSize: 28,
  },
  bottomLabel: {
    fontSize: 13,
    color: "#333",
  },
});

export default BottomTab;