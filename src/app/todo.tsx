import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

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

  const [isModalVisible, setModalVisible] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [actionIndex, setActionIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const openAddModal = () => {
    setNewLabel('');
    setModalVisible(true);
  };

  const cancelAdd = () => {
    setModalVisible(false);
  };

  const confirmAdd = () => {
    const label = newLabel.trim();
    if (label.length === 0) {
      setModalVisible(false);
      return;
    }
    setItems((prev) => [...prev, { label, done: false }]);
    setModalVisible(false);
  };
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ddd" />
      <View style={styles.headerShadow}>
        <View style={styles.header}>
          <Text style={styles.headerText}>マイページ</Text>
        </View>
      </View>
      <View style={styles.tabRow}>
        <View style={styles.tabContainer}>
          <Link href="/" asChild>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.tabButtonInactive}
            >
              <Text style={styles.tabInactive}>勉強時間</Text>
            </TouchableOpacity>
          </Link>
          <View style={styles.tabButtonActive}>
            <Text style={styles.tabActive}>TODOリスト</Text>
          </View>
        </View>
      </View>

      {/* TODO リスト（スクロール可） */}
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={styles.listArea}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.todoRow}
            activeOpacity={0.8}
            onPress={() => setActionIndex(i)}
            onLongPress={() => setDeleteIndex(i)}
            delayLongPress={400}
          >
            <Text style={[styles.todoText, item.done && styles.todoTextDone]}>
              {item.label}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => toggleItem(i)}
              style={[styles.checkbox, item.done && styles.checkboxChecked]}
            >
              <Text
                style={[
                  styles.checkboxMark,
                  item.done && styles.checkboxMarkChecked,
                ]}
              >
                {item.done ? '✓' : ''}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        {/* 下部固定UIに重ならない余白 */}
        <View style={{ height: 180 }} />
      </ScrollView>

      {/* 下部コントロール */}
      <View style={styles.controlsRow}>
        <Text style={styles.achieveText}>
          達成数　{achievedCount}/{totalCount}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.plusBtn}
          onPress={openAddModal}
        >
          <Text style={styles.plusText}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* 追加用モーダル */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelAdd}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>新しい項目名</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="項目名を入力"
              value={newLabel}
              onChangeText={setNewLabel}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={confirmAdd}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={cancelAdd}
              >
                <Text style={styles.modalBtnText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalBtn, styles.modalConfirm]}
                onPress={confirmAdd}
              >
                <Text style={[styles.modalBtnText, styles.modalConfirmText]}>
                  追加
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        visible={deleteIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteIndex(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>この項目を削除しますか？</Text>
            {deleteIndex !== null && (
              <Text style={{ marginBottom: 8 }}>
                {items[deleteIndex].label}
              </Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={() => setDeleteIndex(null)}
              >
                <Text style={styles.modalBtnText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalBtn, styles.modalDanger]}
                onPress={() => {
                  if (deleteIndex === null) return;
                  setItems((prev) =>
                    prev.filter((_, idx) => idx !== deleteIndex)
                  );
                  setDeleteIndex(null);
                }}
              >
                <Text style={[styles.modalBtnText, styles.modalDangerText]}>
                  削除
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* アクション選択モーダル（名前変更・削除） */}
      <Modal
        visible={actionIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActionIndex(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>項目の操作</Text>
            {actionIndex !== null && (
              <Text style={{ marginBottom: 8 }}>
                {items[actionIndex].label}
              </Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalBtn]}
                onPress={() => {
                  if (actionIndex === null) return;
                  setEditIndex(actionIndex);
                  setEditLabel(items[actionIndex].label);
                  setActionIndex(null);
                }}
              >
                <Text style={styles.modalBtnText}>名前を変更</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalBtn, styles.modalDanger]}
                onPress={() => {
                  if (actionIndex === null) return;
                  setDeleteIndex(actionIndex);
                  setActionIndex(null);
                }}
              >
                <Text style={[styles.modalBtnText, styles.modalDangerText]}>
                  削除
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={() => setActionIndex(null)}
              >
                <Text style={styles.modalBtnText}>閉じる</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 名前変更モーダル */}
      <Modal
        visible={editIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditIndex(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>名前を変更</Text>
            <TextInput
              style={styles.modalInput}
              value={editLabel}
              onChangeText={setEditLabel}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => {
                if (editIndex === null) return;
                const label = editLabel.trim();
                if (label.length === 0) {
                  setEditIndex(null);
                  return;
                }
                setItems((prev) =>
                  prev.map((it, idx) =>
                    idx === editIndex ? { ...it, label } : it
                  )
                );
                setEditIndex(null);
              }}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={() => setEditIndex(null)}
              >
                <Text style={styles.modalBtnText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalBtn, styles.modalConfirm]}
                onPress={() => {
                  if (editIndex === null) return;
                  const label = editLabel.trim();
                  if (label.length === 0) {
                    setEditIndex(null);
                    return;
                  }
                  setItems((prev) =>
                    prev.map((it, idx) =>
                      idx === editIndex ? { ...it, label } : it
                    )
                  );
                  setEditIndex(null);
                }}
              >
                <Text style={[styles.modalBtnText, styles.modalConfirmText]}>
                  保存
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* フッター */}
      <View style={styles.bottomArea}>
        <View style={styles.bottomLine} />
        <View style={styles.bottomAs}>
          <View style={styles.bottomItem}>
            <MaterialIcons name="bar-chart" size={28} color="#333" />
            <Text style={styles.bottomLabel}>勉強時間</Text>
          </View>
          <View style={styles.bottomDivider} />
          <View style={styles.bottomItem}>
            <MaterialIcons name="add-circle-outline" size={28} color="#333" />
            <Text style={styles.bottomLabel}>時間の追加</Text>
          </View>
          <View style={styles.bottomDivider} />
          <View style={styles.bottomItem}>
            <Ionicons name="search" size={28} color="#333" />
            <Text style={styles.bottomLabel}>検索</Text>
          </View>
          <View style={styles.bottomDivider} />
          <View style={styles.bottomItem}>
            <MaterialIcons name="people-outline" size={28} color="#333" />
            <Text style={styles.bottomLabel}>フレンド</Text>
          </View>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    backgroundColor: '#f8f9fb',
    borderBottomWidth: 0,
  },
  header: {
    backgroundColor: '#f8f9fb',
    paddingTop: 26,
    paddingBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 84,
    borderBottomWidth: 0,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f1f1f',
    letterSpacing: 0.5,
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#eef1f6',
    padding: 4,
    borderRadius: 999,
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: '#5c6bc0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  tabButtonInactive: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  tabActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  tabInactive: {
    fontSize: 14,
    color: '#5f6368',
    fontWeight: '600',
  },
  listArea: {
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 300,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: '#fff',
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  todoText: {
    fontSize: 16,
    color: '#222',
  },
  todoTextDone: {
    color: '#9aa0a6',
    textDecorationLine: 'line-through',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: '#5c6bc0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8eaf6',
    borderRadius: 6,
  },
  checkboxChecked: {
    backgroundColor: '#5c6bc0',
    borderColor: '#5c6bc0',
  },
  checkboxMark: {
    fontSize: 16,
    color: '#5c6bc0',
    fontWeight: 'bold',
  },
  checkboxMarkChecked: {
    color: '#fff',
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
    fontSize: 15,
    color: '#5f6368',
  },
  plusBtn: {
    width: 52,
    height: 52,
    borderWidth: 0,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5c6bc0',
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  plusText: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 28,
    fontWeight: 'bold',
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  bottomLine: {
    height: 2,
    backgroundColor: '#000',
    width: '100%',
    marginBottom: 0,
  },
  bottomAs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bottomDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#e0e0e0',
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
  },
  bottomIcon: {
    fontSize: 28,
  },
  bottomLabel: {
    fontSize: 13,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f1f1f',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
    borderRadius: 8,
  },
  modalButtons: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    marginLeft: 8,
  },
  modalCancel: {},
  modalConfirm: {
    backgroundColor: '#1f1f1f',
    borderColor: '#1f1f1f',
  },
  modalDanger: {
    backgroundColor: '#e53935',
    borderColor: '#e53935',
  },
  modalBtnText: {
    color: '#1f1f1f',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmText: {
    color: '#fff',
  },
  modalDangerText: {
    color: '#fff',
  },
});
