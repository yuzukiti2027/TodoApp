import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';

export default function MyPageScreen() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ddd" />
      {/* ヘッダー */}
      <View style={styles.headerShadow}>
        <View style={styles.header}>
          <Text style={styles.headerText}>マイページ</Text>
        </View>
      </View>
      {/* タブ */}
      <View style={styles.tabRow}>
        <Text style={styles.tabActive}>勉強時間</Text>
        <Text style={styles.tabInactive}>TODOリスト</Text>
      </View>
      <View style={styles.tabUnderline} />
      {/* グラフエリア */}
      <View style={styles.graphArea}>
        <Text style={styles.graphLabel}>科目別 / 日別</Text>
        <View style={styles.chartRow}>
          {/* 縦軸 */}
          <View style={styles.yAxis}>
            <Text style={styles.yAxisLabel}>10h</Text>
            <View style={styles.yAxisLine} />
          </View>
          {/* 棒グラフ */}
          <ScrollView
            style={{ maxHeight: 260 }}
            contentContainerStyle={{ alignItems: 'flex-start' }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <View>
              {/* 棒の上のラベル */}
              <View style={styles.barLabels}>
                {[...Array(7)].map((_, i) => (
                  <Text key={i} style={styles.barLabel}>
                    国語
                  </Text>
                ))}
              </View>
              <View style={styles.barGraph}>
                {[...Array(7)].map((_, i) => (
                  <React.Fragment key={i}>
                    <View style={styles.bar} />
                    {i < 6 && <View style={styles.barDivider} />}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
      {/* 下部の横線とa */}
      <View style={styles.bottomArea}>
        <View style={styles.bottomLine} />
        <View style={styles.bottomAs}>
          {[...Array(4)].map((_, i) => (
            <Text key={i} style={styles.bottomAText}>
              a
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 90, // 下部固定分の余白
  },
  headerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 6,
    backgroundColor: '#ddd',
    borderBottomWidth: 0,
    // 影を強調し下線を消す
  },
  header: {
    backgroundColor: '#ddd',
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
    borderBottomWidth: 4,
    borderBottomColor: '#ccc', // 下線をheader内に
  },
  headerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111',
    letterSpacing: 1,
    textShadowColor: '#bbb',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 28,
    alignItems: 'flex-end',
    width: '100%',
    justifyContent: 'center',
  },
  tabActive: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  tabInactive: {
    fontSize: 22,
    color: '#ccc', // より薄く
    fontWeight: 'normal',
    letterSpacing: 2,
    flex: 1,
    textAlign: 'center',
  },
  tabUnderline: {
    height: 2,
    backgroundColor: '#ccc',
    marginTop: 8,
    marginBottom: 8,
    marginHorizontal: 0,
    width: '100%',
  },
  graphArea: {
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
    minHeight: 320, // 高さを大きく
  },
  graphLabel: {
    color: '#888',
    fontSize: 15,
    marginBottom: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#eee',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  yAxis: {
    alignItems: 'center',
    marginRight: 6,
    height: 220, // 高さアップ
    justifyContent: 'flex-end',
    width: 32,
  },
  yAxisLabel: {
    color: '#888',
    fontSize: 12,
    position: 'absolute',
    top: 38, // ラベル位置調整
    left: -8,
    fontWeight: 'bold',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  yAxisLine: {
    width: 1.5,
    height: 220, // 高さアップ
    backgroundColor: '#888',
    marginBottom: 0,
  },
  barGraphArea: {
    alignItems: 'flex-start',
    // 横スクロール対応のためminWidth削除
    maxHeight: 260,
  },
  barGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 220, // 高さアップ
    marginBottom: 8,
    justifyContent: 'center',
  },
  bar: {
    width: 24,
    height: 180, // 棒を高く
    backgroundColor: '#ff7300',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barDivider: {
    width: 18,
    height: 180,
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
    marginHorizontal: 2,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: 'auto',
    marginTop: 8,
  },
  barLabel: {
    width: 44,
    textAlign: 'center',
    fontSize: 18,
    color: '#222',
    marginHorizontal: 1,
    marginTop: 2,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#eee',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: 16,
  },
  bottomLine: {
    height: 3,
    backgroundColor: '#000',
    width: '100%',
    marginBottom: 0,
  },
  bottomAs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  bottomAText: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 8,
    letterSpacing: 24, // aの間隔を広げる
  },
});
