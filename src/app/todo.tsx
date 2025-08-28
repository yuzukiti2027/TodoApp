import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Link } from 'expo-router';

export default function TodoScreen() {
  const [items, setItems] = useState(
    [
      '洗濯ものをする',
      '洗濯ものをする',
      '洗濯ものをする',
      '洗濯ものをする',
    ].map((label) => ({ label, done: false }))
  );

  const toggleItem = (index: number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], done: !next[index].done };
      return next;
    });
  };

  const achievedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ddd" />
      <View style={styles.headerShadow}>
        <View style={styles.header}>
          <Text style={styles.headerText}>マイページ</Text>
        </View>
      </View>
      <View style={styles.tabRow}>
        <Link href="/" asChild>
          <TouchableOpacity accessibilityRole="button">
            <Text style={styles.tabInactive}>勉強時間</Text>
          </TouchableOpacity>
        </Link>
        <Text style={styles.tabActive}>TODOリスト</Text>
      </View>
      <View style={styles.tabUnderline} />

      {/* TODO リスト */}
      <View style={styles.listArea}>
        {items.map((item, i) => (
          <View key={i} style={styles.todoRow}>
            <Text style={[styles.todoText, item.done && styles.todoTextDone]}>
              {item.label}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => toggleItem(i)}
              style={[styles.checkbox, item.done && styles.checkboxChecked]}
            >
              <Text style={styles.checkboxMark}>{item.done ? '✓' : ''}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* 下部コントロール */}
      <View style={styles.controlsRow}>
        <Text style={styles.achieveText}>
          達成数　{achievedCount}/{totalCount}
        </Text>
        <TouchableOpacity accessibilityRole="button" style={styles.plusBtn}>
          <Text style={styles.plusText}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* フッター */}
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
  },
  headerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 6,
    backgroundColor: '#ddd',
    borderBottomWidth: 0,
  },
  header: {
    backgroundColor: '#ddd',
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
    borderBottomWidth: 4,
    borderBottomColor: '#ccc',
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
    color: '#ccc',
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
  listArea: {
    marginTop: 24,
    alignItems: 'center',
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 260,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#888',
    backgroundColor: '#fff',
    marginVertical: 6,
  },
  todoText: {
    fontSize: 16,
    color: '#222',
  },
  todoTextDone: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
  },
  checkboxChecked: {
    backgroundColor: '#d1ffd6',
    borderColor: '#2e7d32',
  },
  checkboxMark: {
    fontSize: 16,
    color: '#333',
  },
  controlsRow: {
    position: 'absolute',
    bottom: 86,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  achieveText: {
    fontSize: 16,
    color: '#111',
  },
  plusBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  plusText: {
    fontSize: 24,
    color: '#111',
    lineHeight: 24,
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
    letterSpacing: 24,
  },
});
