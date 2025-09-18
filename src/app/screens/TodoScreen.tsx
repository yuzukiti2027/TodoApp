import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config';
import BottomNavigation from '../../components/BottomNavigation';
import Header from '../../components/Header';
import {
  todoHelpers,
  achievementHelpers,
  TodoItem,
  Achievement,
} from '../../utils/firebaseHelpers';

export default function TodoScreen() {
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>(
    'daily'
  );
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [items, setItems] = useState<TodoItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ユーザー認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadUserData(user.uid);
      } else {
        setItems([]);
        setAchievements([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ユーザーデータを読み込み
  const loadUserData = async (userId: string) => {
    try {
      setLoading(true);
      const [todos, userAchievements] = await Promise.all([
        todoHelpers.getUserTodos(userId),
        achievementHelpers.getUserAchievements(userId),
      ]);

      setItems(todos);
      setAchievements(userAchievements);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('エラー', 'データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (index: number) => {
    if (!currentUser) return;

    const item = items[index];
    const wasDone = item.done;
    const newDoneState = !item.done;

    try {
      // FirebaseでTodoアイテムを更新
      if (item.id) {
        await todoHelpers.updateTodoItem(item.id, { done: newDoneState });
      }

      // ローカル状態を更新
      setItems((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], done: newDoneState };
        return next;
      });

      // 項目が完了状態になった場合、達成記録を追加
      if (!wasDone && newDoneState) {
        const currentPeriod = getCurrentPeriod(
          item.category as 'daily' | 'weekly' | 'monthly'
        );

        const achievementData = {
          itemId: item.id || '',
          itemLabel: item.label,
          category: item.category as 'daily' | 'weekly' | 'monthly',
          achievedAt: new Date().toISOString(),
          period: currentPeriod,
          userId: currentUser.uid,
        };

        const achievementId = await achievementHelpers.addAchievement(
          achievementData
        );

        setAchievements((prevAchievements) => [
          ...prevAchievements,
          {
            id: achievementId,
            ...achievementData,
          },
        ]);
      }
    } catch (error) {
      console.error('Error toggling item:', error);
      Alert.alert('エラー', 'Todoの更新に失敗しました');
    }
  };

  // カテゴリに基づいてTODOをフィルタリング
  const getFilteredItems = () => {
    switch (viewMode) {
      case 'daily':
        return items.filter((item) => item.category === 'daily');
      case 'weekly':
        return items.filter((item) => item.category === 'weekly');
      case 'monthly':
        return items.filter((item) => item.category === 'monthly');
      default:
        return items;
    }
  };

  const filteredItems = getFilteredItems();
  const achievedCount = filteredItems.filter((i) => i.done).length;
  const totalCount = filteredItems.length;

  // 期間を計算するヘルパー関数
  const getCurrentPeriod = (category: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();

    switch (category) {
      case 'daily':
        return `${year}-${month.toString().padStart(2, '0')}-${date
          .toString()
          .padStart(2, '0')}`;
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekNumber = Math.ceil((weekStart.getDate() + 6) / 7);
        return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
      case 'monthly':
        return `${year}-${month.toString().padStart(2, '0')}`;
      default:
        return '';
    }
  };

  // 達成記録を期間別にグループ化
  const getGroupedAchievements = () => {
    const grouped = achievements.reduce((acc, achievement) => {
      const period = achievement.period;
      if (!acc[period]) {
        acc[period] = [];
      }
      acc[period].push(achievement);
      return acc;
    }, {} as Record<string, typeof achievements>);

    // 期間でソート（新しい順）
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  };

  // 期間の表示名を取得
  const getPeriodDisplayName = (period: string) => {
    if (period.includes('-W')) {
      // 週別: 2024-W01 -> 2024年第1週
      const [year, week] = period.split('-W');
      return `${year}年第${parseInt(week)}週`;
    } else if (period.includes('-') && period.split('-').length === 3) {
      // 日別: 2024-01-15 -> 2024/1/15
      const [year, month, day] = period.split('-');
      return `${year}/${parseInt(month)}/${parseInt(day)}`;
    } else if (period.includes('-') && period.split('-').length === 2) {
      // 月別: 2024-01 -> 2024年1月
      const [year, month] = period.split('-');
      return `${year}年${parseInt(month)}月`;
    }
    return period;
  };

  // 優先度に基づくスタイル
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return styles.todoRowHigh;
      case 'medium':
        return styles.todoRowMedium;
      case 'low':
        return styles.todoRowLow;
      default:
        return {};
    }
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>(
    'medium'
  );
  const [newCategory, setNewCategory] = useState<
    'daily' | 'weekly' | 'monthly'
  >('daily');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [actionIndex, setActionIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [showPastAchievements, setShowPastAchievements] = useState(false);

  const openAddModal = () => {
    setNewLabel('');
    setNewPriority('medium');
    setNewCategory('daily');
    setModalVisible(true);
  };

  const cancelAdd = () => {
    setModalVisible(false);
  };

  const confirmAdd = async () => {
    if (!currentUser) return;

    const label = newLabel.trim();
    if (label.length === 0) {
      setModalVisible(false);
      return;
    }

    try {
      const newTodoData = {
        label,
        done: false,
        priority: newPriority,
        category: newCategory,
        userId: currentUser.uid,
      };

      const todoId = await todoHelpers.addTodoItem(newTodoData);

      setItems((prev) => [
        ...prev,
        {
          id: todoId,
          ...newTodoData,
        },
      ]);
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding todo item:', error);
      Alert.alert('エラー', 'Todoの追加に失敗しました');
    }
  };
  return (
    <View style={styles.root}>
      <Header title="TODO" />
      <View style={styles.tabRow}>
        <View style={styles.tabContainer}>
          <Link href="/screens/StudyTimeScreen" asChild>
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

      {/* 表示モード切り替え */}
      <View style={styles.viewModeSelector}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'daily' && styles.viewModeButtonActive,
          ]}
          onPress={() => setViewMode('daily')}
        >
          <Text
            style={[
              styles.viewModeButtonText,
              viewMode === 'daily' && styles.viewModeButtonTextActive,
            ]}
          >
            日別
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'weekly' && styles.viewModeButtonActive,
          ]}
          onPress={() => setViewMode('weekly')}
        >
          <Text
            style={[
              styles.viewModeButtonText,
              viewMode === 'weekly' && styles.viewModeButtonTextActive,
            ]}
          >
            週別
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'monthly' && styles.viewModeButtonActive,
          ]}
          onPress={() => setViewMode('monthly')}
        >
          <Text
            style={[
              styles.viewModeButtonText,
              viewMode === 'monthly' && styles.viewModeButtonTextActive,
            ]}
          >
            月別
          </Text>
        </TouchableOpacity>
      </View>

      {/* TODO リスト（スクロール可） */}
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={styles.listArea}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.map((item, i) => {
          const originalIndex = items.findIndex(
            (originalItem) => originalItem === item
          );

          return (
            <TouchableOpacity
              key={i}
              style={[styles.todoRow, getPriorityStyle(item.priority)]}
              activeOpacity={0.8}
              onPress={() => setActionIndex(originalIndex)}
              onLongPress={() => setDeleteIndex(originalIndex)}
              delayLongPress={400}
            >
              <View style={styles.todoContent}>
                <Text
                  style={[styles.todoText, item.done && styles.todoTextDone]}
                >
                  {item.label}
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => toggleItem(originalIndex)}
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
          );
        })}
        {/* 下部固定UIに重ならない余白 */}
        <View style={{ height: 180 }} />
      </ScrollView>

      {/* 下部コントロール */}
      <View style={styles.controlsRow}>
        <Text style={styles.achieveText}>
          達成数　{achievedCount}/{totalCount}
        </Text>
        <TouchableOpacity
          style={styles.pastAchievementsButton}
          onPress={() => setShowPastAchievements(true)}
        >
          <MaterialIcons name="history" size={20} color="#5c6bc0" />
          <Text style={styles.pastAchievementsButtonText}>過去の達成記録</Text>
        </TouchableOpacity>
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
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>新しい項目</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="項目名を入力"
              value={newLabel}
              onChangeText={setNewLabel}
              autoFocus
            />
            <View style={styles.categorySelector}>
              <Text style={styles.categoryLabel}>カテゴリ:</Text>
              <View style={styles.categoryButtons}>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    newCategory === 'daily' && styles.categoryButtonActive,
                  ]}
                  onPress={() => setNewCategory('daily')}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      newCategory === 'daily' &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    日別
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    newCategory === 'weekly' && styles.categoryButtonActive,
                  ]}
                  onPress={() => setNewCategory('weekly')}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      newCategory === 'weekly' &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    週別
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    newCategory === 'monthly' && styles.categoryButtonActive,
                  ]}
                  onPress={() => setNewCategory('monthly')}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      newCategory === 'monthly' &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    月別
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.prioritySelector}>
              <Text style={styles.priorityLabel}>優先度:</Text>
              <View style={styles.priorityButtons}>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    newPriority === 'high' && styles.priorityButtonActive,
                  ]}
                  onPress={() => setNewPriority('high')}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      newPriority === 'high' && styles.priorityButtonTextActive,
                    ]}
                  >
                    高
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    newPriority === 'medium' && styles.priorityButtonActive,
                  ]}
                  onPress={() => setNewPriority('medium')}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      newPriority === 'medium' &&
                        styles.priorityButtonTextActive,
                    ]}
                  >
                    中
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    newPriority === 'low' && styles.priorityButtonActive,
                  ]}
                  onPress={() => setNewPriority('low')}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      newPriority === 'low' && styles.priorityButtonTextActive,
                    ]}
                  >
                    低
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
        </KeyboardAvoidingView>
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
                onPress={async () => {
                  if (deleteIndex === null) return;

                  const itemToDelete = items[deleteIndex];

                  try {
                    // Firebaseから削除
                    if (itemToDelete.id) {
                      await todoHelpers.deleteTodoItem(itemToDelete.id);
                    }

                    // ローカル状態から削除
                    setItems((prev) =>
                      prev.filter((_, idx) => idx !== deleteIndex)
                    );
                    setDeleteIndex(null);
                  } catch (error) {
                    console.error('Error deleting todo item:', error);
                    Alert.alert('エラー', 'Todoの削除に失敗しました');
                  }
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
          <View style={styles.actionModalCard}>
            <Text style={styles.modalTitle}>項目の操作</Text>
            {actionIndex !== null && (
              <View style={styles.actionItemInfo}>
                <Text style={styles.actionItemLabel}>
                  {items[actionIndex].label}
                </Text>
                <Text style={styles.actionItemCategory}>
                  {items[actionIndex].category === 'daily' && '日別'}
                  {items[actionIndex].category === 'weekly' && '週別'}
                  {items[actionIndex].category === 'monthly' && '月別'}
                </Text>
              </View>
            )}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.actionButton, styles.actionEditButton]}
                onPress={() => {
                  if (actionIndex === null) return;
                  setEditIndex(actionIndex);
                  setEditLabel(items[actionIndex].label);
                  setActionIndex(null);
                }}
              >
                <MaterialIcons name="edit" size={20} color="#5c6bc0" />
                <Text style={styles.actionButtonText}>名前を変更</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.actionButton, styles.actionDeleteButton]}
                onPress={() => {
                  if (actionIndex === null) return;
                  setDeleteIndex(actionIndex);
                  setActionIndex(null);
                }}
              >
                <MaterialIcons name="delete" size={20} color="#d32f2f" />
                <Text
                  style={[styles.actionButtonText, styles.actionDeleteText]}
                >
                  削除
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              style={[styles.actionCancelButton]}
              onPress={() => setActionIndex(null)}
            >
              <Text style={styles.actionCancelText}>閉じる</Text>
            </TouchableOpacity>
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

      {/* 達成記録表示モーダル */}
      <Modal
        visible={showPastAchievements}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPastAchievements(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.achievementsModal}>
            <View style={styles.achievementsHeader}>
              <Text style={styles.achievementsTitle}>過去の達成記録</Text>
              <TouchableOpacity
                onPress={() => setShowPastAchievements(false)}
                style={styles.achievementsCloseButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.achievementsContent}>
              {getGroupedAchievements().map(([period, periodAchievements]) => (
                <View key={period} style={styles.achievementPeriodGroup}>
                  <Text style={styles.achievementPeriodTitle}>
                    {getPeriodDisplayName(period)}
                  </Text>
                  <View style={styles.achievementPeriodStats}>
                    <Text style={styles.achievementPeriodCount}>
                      {periodAchievements.length}件達成
                    </Text>
                  </View>
                  {periodAchievements.map((achievement) => (
                    <View key={achievement.id} style={styles.achievementItem}>
                      <View style={styles.achievementItemContent}>
                        <Text style={styles.achievementItemLabel}>
                          {achievement.itemLabel}
                        </Text>
                        <Text style={styles.achievementItemCategory}>
                          {achievement.category === 'daily' && '日別'}
                          {achievement.category === 'weekly' && '週別'}
                          {achievement.category === 'monthly' && '月別'}
                        </Text>
                      </View>
                      <Text style={styles.achievementItemTime}>
                        {new Date(achievement.achievedAt).toLocaleString(
                          'ja-JP',
                          {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
              {achievements.length === 0 && (
                <Text style={styles.noAchievementsText}>
                  まだ達成記録がありません
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomNavigation activeTab="search" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalCancel: {
    backgroundColor: '#f5f5f5',
  },
  modalConfirm: {
    backgroundColor: '#5c6bc0',
  },
  modalDanger: {
    backgroundColor: '#ffebee',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  modalConfirmText: {
    color: '#fff',
  },
  modalDangerText: {
    color: '#d32f2f',
  },
  achievementsModal: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  achievementsCloseButton: {
    padding: 4,
  },
  // アクション選択モーダルのスタイル
  actionModalCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  actionItemInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#5c6bc0',
  },
  actionItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1f1f',
    marginBottom: 4,
  },
  actionItemCategory: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionEditButton: {
    backgroundColor: '#f0f4ff',
    borderColor: '#5c6bc0',
  },
  actionDeleteButton: {
    backgroundColor: '#ffebee',
    borderColor: '#d32f2f',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    color: '#1f1f1f',
  },
  actionDeleteText: {
    color: '#d32f2f',
  },
  actionCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  actionCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  viewModeSelector: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#5c6bc0',
  },
  viewModeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  viewModeButtonTextActive: {
    color: '#fff',
  },
  todoContent: {
    flex: 1,
    marginRight: 12,
  },
  todoDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  todoRowHigh: {
    borderLeftWidth: 4,
    borderLeftColor: '#e53935',
  },
  todoRowMedium: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  todoRowLow: {
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  prioritySelector: {
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f1f1f',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: '#5c6bc0',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  priorityButtonTextActive: {
    color: '#fff',
  },
  calendarContainer: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 20,
  },
  calendarScrollView: {
    flex: 1,
  },
  calendarContent: {
    gap: 8,
  },
  calendarDay: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  calendarDayToday: {
    borderColor: '#5c6bc0',
    borderWidth: 2,
    backgroundColor: '#f3f4ff',
  },
  calendarDayPast: {
    opacity: 0.6,
    backgroundColor: '#f8f9fa',
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  calendarDayTextToday: {
    color: '#5c6bc0',
  },
  calendarDayTextPast: {
    color: '#666',
  },
  calendarDayStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarDayCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  calendarDayCountToday: {
    color: '#5c6bc0',
  },
  calendarDayCountPast: {
    color: '#999',
  },
  calendarDayProgress: {
    height: 4,
    backgroundColor: '#5c6bc0',
    borderRadius: 2,
    flex: 1,
    marginLeft: 12,
  },
  dateDetailModal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  dateDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dateDetailCloseButton: {
    padding: 4,
  },
  dateDetailContent: {
    maxHeight: 400,
    padding: 16,
  },
  noTodosText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  // モーダル関連のスタイル
  modalButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  // カテゴリ選択のスタイル
  categorySelector: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f1f1f',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#5c6bc0',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  // 過去の達成記録ボタンのスタイル
  pastAchievementsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  pastAchievementsButtonText: {
    fontSize: 12,
    color: '#5c6bc0',
    fontWeight: '500',
  },
  // 達成記録表示のスタイル
  achievementsContent: {
    maxHeight: 400,
    padding: 20,
  },
  achievementPeriodGroup: {
    marginBottom: 24,
  },
  achievementPeriodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  achievementPeriodStats: {
    marginBottom: 12,
  },
  achievementPeriodCount: {
    fontSize: 14,
    color: '#666',
  },
  achievementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  achievementItemContent: {
    flex: 1,
  },
  achievementItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  achievementItemCategory: {
    fontSize: 12,
    color: '#5c6bc0',
    backgroundColor: '#e8eaf6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  achievementItemTime: {
    fontSize: 12,
    color: '#666',
  },
  noAchievementsText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 40,
  },
});
