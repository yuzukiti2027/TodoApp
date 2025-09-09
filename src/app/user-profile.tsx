import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { Link, useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config';
import BottomNavigation from '../components/BottomNavigation';
import Header from '../components/Header';
import Card from '../components/Card';
import { userProfileHelpers, UserProfile } from '../utils/firebaseHelpers';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'study' | 'todo'>('study');
  const [studyViewMode, setStudyViewMode] = useState<'subject' | 'daily'>(
    'subject'
  );
  const [todoViewMode, setTodoViewMode] = useState<
    'monthly' | 'weekly' | 'daily'
  >('daily');
  const [addFriendVisible, setAddFriendVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
  });

  // ユーザー認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ユーザープロフィールを読み込み
  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      const profile = await userProfileHelpers.getUserProfile(userId);
      setUserProfile(profile);

      if (profile) {
        setEditForm({
          displayName: profile.displayName,
          bio: profile.bio || '',
        });
      } else {
        // プロフィールが存在しない場合はデフォルト値で初期化
        setEditForm({
          displayName: currentUser?.displayName || '',
          bio: '',
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('エラー', 'プロフィールの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // プロフィールを更新
  const updateProfile = async () => {
    if (!currentUser) return;

    try {
      const profileData = {
        userId: currentUser.uid,
        displayName: editForm.displayName.trim(),
        email: currentUser.email || '',
        bio: editForm.bio.trim(),
      };

      await userProfileHelpers.upsertUserProfile(profileData);

      setUserProfile({
        id: '',
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setEditProfileVisible(false);
      Alert.alert('成功', 'プロフィールを更新しました');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('エラー', 'プロフィールの更新に失敗しました');
    }
  };

  // サンプルユーザーデータ（実際のアプリではAPIから取得）
  const userData = {
    '1': {
      id: '1',
      name: '田中 太郎',
      username: '@tanaka_taro',
      avatar: null,
      studyHours: 45,
      subjects: ['数学', '物理', '化学'],
      isOnline: true,
      lastActive: '2分前',
      bio: '理系大学を目指している高校3年生です。数学と物理が得意です。',
      mutualFriends: 3,
      studyRecords: [
        {
          date: '2024-01-15',
          hours: 5,
          subject: '数学',
          content: '二次関数のグラフ',
        },
        {
          date: '2024-01-16',
          hours: 3,
          subject: '物理',
          content: '力学の基礎',
        },
        {
          date: '2024-01-17',
          hours: 4,
          subject: '化学',
          content: '有機化学の反応',
        },
        {
          date: '2024-01-18',
          hours: 6,
          subject: '数学',
          content: '微分積分の応用',
        },
        {
          date: '2024-01-19',
          hours: 2,
          subject: '物理',
          content: '電磁気学の復習',
        },
      ],
      todoList: [
        {
          id: '1',
          title: '数学の過去問を解く',
          completed: false,
          priority: 'high',
          category: 'daily',
        },
        {
          id: '2',
          title: '物理の実験レポート作成',
          completed: true,
          priority: 'medium',
          category: 'weekly',
        },
        {
          id: '3',
          title: '化学の暗記項目を整理',
          completed: false,
          priority: 'low',
          category: 'daily',
        },
        {
          id: '4',
          title: '英語の単語帳を進める',
          completed: false,
          priority: 'medium',
          category: 'monthly',
        },
        {
          id: '5',
          title: '国語の古典を読む',
          completed: true,
          priority: 'low',
          category: 'weekly',
        },
      ],
    },
    '2': {
      id: '2',
      name: '佐藤 花子',
      username: '@sato_hanako',
      avatar: null,
      studyHours: 38,
      subjects: ['国語', '英語', '社会'],
      isOnline: false,
      lastActive: '1時間前',
      bio: '文系志望の高校2年生。読書と英語学習が趣味です。',
      mutualFriends: 1,
      studyRecords: [
        {
          date: '2024-01-15',
          hours: 4,
          subject: '国語',
          content: '現代文の読解練習',
        },
        {
          date: '2024-01-16',
          hours: 3,
          subject: '英語',
          content: '英作文の練習',
        },
        {
          date: '2024-01-17',
          hours: 2,
          subject: '社会',
          content: '日本史の年表整理',
        },
        {
          date: '2024-01-18',
          hours: 5,
          subject: '国語',
          content: '古文の文法復習',
        },
        {
          date: '2024-01-19',
          hours: 3,
          subject: '英語',
          content: 'リスニング練習',
        },
      ],
      todoList: [
        {
          id: '1',
          title: '英語の長文読解を解く',
          completed: false,
          priority: 'high',
          category: 'daily',
        },
        {
          id: '2',
          title: '国語の漢字練習',
          completed: true,
          priority: 'medium',
          category: 'weekly',
        },
        {
          id: '3',
          title: '社会の資料集を読む',
          completed: false,
          priority: 'low',
          category: 'monthly',
        },
        {
          id: '4',
          title: '古文の単語を覚える',
          completed: false,
          priority: 'medium',
          category: 'daily',
        },
        {
          id: '5',
          title: '英単語の復習',
          completed: true,
          priority: 'high',
          category: 'weekly',
        },
      ],
    },
  };

  const user = userData[userId as keyof typeof userData];

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>ユーザーが見つかりませんでした</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 勉強時間の集計
  const studyStats = useMemo(() => {
    const totalHours = user.studyRecords.reduce(
      (sum, record) => sum + record.hours,
      0
    );
    const subjectStats = user.studyRecords.reduce((acc, record) => {
      acc[record.subject] = (acc[record.subject] || 0) + record.hours;
      return acc;
    }, {} as Record<string, number>);

    return { totalHours, subjectStats };
  }, [user.studyRecords]);

  // 日別データの計算
  const dailyStats = useMemo(() => {
    const dateMap = new Map();

    user.studyRecords.forEach((record) => {
      const date = record.date;
      if (dateMap.has(date)) {
        dateMap.set(date, dateMap.get(date) + record.hours);
      } else {
        dateMap.set(date, record.hours);
      }
    });

    // 今月の1日から今日までのデータを作成
    const dailyData = [];
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    for (
      let d = new Date(firstDayOfMonth);
      d <= today;
      d.setDate(d.getDate() + 1)
    ) {
      const dateString = d.toISOString().split('T')[0];
      const totalHours = dateMap.get(dateString) || 0;
      dailyData.push({ date: dateString, totalHours });
    }

    return dailyData;
  }, [user.studyRecords]);

  // TODOの統計
  const todoStats = useMemo(() => {
    const total = user.todoList.length;
    const completed = user.todoList.filter((todo) => todo.completed).length;
    const pending = total - completed;

    return { total, completed, pending };
  }, [user.todoList]);

  const handleAddFriend = () => {
    setAddFriendVisible(true);
  };

  const confirmAddFriend = () => {
    Alert.alert('友達追加', `${user.name}さんに友達申請を送信しました！`, [
      { text: 'OK', onPress: () => setAddFriendVisible(false) },
    ]);
  };

  const renderStudyTab = () => (
    <View style={styles.tabContent}>
      {/* 勉強時間サマリー */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>勉強時間サマリー</Text>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{studyStats.totalHours}</Text>
            <Text style={styles.statLabel}>総勉強時間</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.subjects.length}</Text>
            <Text style={styles.statLabel}>学習科目数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.studyRecords.length}</Text>
            <Text style={styles.statLabel}>記録日数</Text>
          </View>
        </View>
      </View>

      {/* 表示モード切り替え */}
      <View style={styles.viewModeSelector}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            studyViewMode === 'subject' && styles.viewModeButtonActive,
          ]}
          onPress={() => setStudyViewMode('subject')}
        >
          <Text
            style={[
              styles.viewModeButtonText,
              studyViewMode === 'subject' && styles.viewModeButtonTextActive,
            ]}
          >
            科目別
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            studyViewMode === 'daily' && styles.viewModeButtonActive,
          ]}
          onPress={() => setStudyViewMode('daily')}
        >
          <Text
            style={[
              styles.viewModeButtonText,
              studyViewMode === 'daily' && styles.viewModeButtonTextActive,
            ]}
          >
            日別
          </Text>
        </TouchableOpacity>
      </View>

      {/* 科目別勉強時間グラフ */}
      {studyViewMode === 'subject' && (
        <View style={styles.subjectCard}>
          <Text style={styles.cardTitle}>科目別勉強時間</Text>
          <View style={styles.chartRow}>
            {/* 縦軸 */}
            <View style={styles.yAxis}>
              {(() => {
                const maxHours = Math.max(
                  ...Object.values(studyStats.subjectStats)
                );

                // 最大値に基づいて適切なステップを計算
                let step;
                if (maxHours <= 10) {
                  step = 2;
                } else if (maxHours <= 50) {
                  step = 10;
                } else if (maxHours <= 100) {
                  step = 20;
                } else if (maxHours <= 200) {
                  step = 50;
                } else {
                  step = Math.ceil(maxHours / 5 / 50) * 50;
                }

                // 最大値をステップの倍数に調整
                const maxYAxisHours = Math.ceil(maxHours / step) * step;

                // 0から最大値までステップごとの値を生成
                const values = [];
                for (let i = 0; i <= maxYAxisHours; i += step) {
                  values.push(i);
                }

                return values.map((value, index) => (
                  <View
                    key={index}
                    style={[
                      styles.yAxisLabelContainer,
                      { top: (value / maxYAxisHours) * 200 },
                    ]}
                  >
                    <Text style={styles.yAxisLabel}>{value}h</Text>
                  </View>
                ));
              })()}
            </View>
            {/* 棒グラフ */}
            <ScrollView
              style={styles.barGraphArea}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.barGraph}>
                {Object.entries(studyStats.subjectStats).map(
                  ([subject, hours], index) => {
                    const maxHours = Math.max(
                      ...Object.values(studyStats.subjectStats)
                    );

                    // Y軸と同じロジックで最大値を計算
                    let step;
                    if (maxHours <= 10) {
                      step = 2;
                    } else if (maxHours <= 50) {
                      step = 10;
                    } else if (maxHours <= 100) {
                      step = 20;
                    } else if (maxHours <= 200) {
                      step = 50;
                    } else {
                      step = Math.ceil(maxHours / 5 / 50) * 50;
                    }
                    const maxYAxisHours = Math.ceil(maxHours / step) * step;

                    const height =
                      maxYAxisHours > 0 ? (hours / maxYAxisHours) * 200 : 0;
                    return (
                      <View key={subject} style={styles.barGroup}>
                        <Text style={styles.barHours}>{hours}h</Text>
                        <View
                          style={[styles.bar, { height: Math.max(2, height) }]}
                        />
                        <Text style={styles.barLabel}>{subject}</Text>
                      </View>
                    );
                  }
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* 日別勉強時間グラフ */}
      {studyViewMode === 'daily' && (
        <View style={styles.subjectCard}>
          <Text style={styles.cardTitle}>日別勉強時間</Text>
          <View style={styles.chartRow}>
            {/* 縦軸 */}
            <View style={styles.yAxis}>
              {(() => {
                const maxHours = Math.max(
                  ...dailyStats.map((d) => d.totalHours)
                );
                const step = maxHours / 5;
                const values = [
                  0,
                  step,
                  step * 2,
                  step * 3,
                  step * 4,
                  maxHours,
                ];
                return values.map((value, index) => (
                  <View
                    key={index}
                    style={[
                      styles.yAxisLabelContainer,
                      { top: (value / maxHours) * 200 },
                    ]}
                  >
                    <Text style={styles.yAxisLabel}>{Math.round(value)}h</Text>
                  </View>
                ));
              })()}
            </View>
            {/* 棒グラフ */}
            <ScrollView
              style={styles.barGraphArea}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.barGraph}>
                {dailyStats.map((day, index) => {
                  const maxHours = Math.max(
                    ...dailyStats.map((d) => d.totalHours)
                  );
                  const height =
                    maxHours > 0 ? (day.totalHours / maxHours) * 200 : 0;
                  const dateObj = new Date(day.date);
                  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][
                    dateObj.getDay()
                  ];
                  const dateLabel = `${
                    dateObj.getMonth() + 1
                  }/${dateObj.getDate()}(${dayOfWeek})`;

                  return (
                    <View key={day.date} style={styles.barGroup}>
                      <Text style={styles.barHours}>{day.totalHours}h</Text>
                      <View
                        style={[styles.bar, { height: Math.max(2, height) }]}
                      />
                      <Text style={styles.barLabel}>{dateLabel}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* 最近の勉強記録 */}
      <View style={styles.recordsCard}>
        <Text style={styles.cardTitle}>最近の勉強記録</Text>
        {user.studyRecords.slice(0, 5).map((record, index) => (
          <View key={index} style={styles.recordItem}>
            <View style={styles.recordInfo}>
              <Text style={styles.recordDate}>{record.date}</Text>
              <Text style={styles.recordSubject}>{record.subject}</Text>
            </View>
            <View style={styles.recordDetails}>
              <Text style={styles.recordHours}>{record.hours}時間</Text>
              <Text style={styles.recordContent}>{record.content}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // カテゴリに基づいてTODOをフィルタリング
  const getFilteredTodos = () => {
    switch (todoViewMode) {
      case 'daily':
        return user.todoList.filter((todo) => todo.category === 'daily');
      case 'weekly':
        return user.todoList.filter((todo) => todo.category === 'weekly');
      case 'monthly':
        return user.todoList.filter((todo) => todo.category === 'monthly');
      default:
        return user.todoList;
    }
  };

  const renderTodoTab = () => {
    const filteredTodos = getFilteredTodos();
    const completedCount = filteredTodos.filter(
      (todo) => todo.completed
    ).length;
    const totalCount = filteredTodos.length;

    return (
      <View style={styles.tabContent}>
        {/* TODOサマリー */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>TODOサマリー</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalCount}</Text>
              <Text style={styles.statLabel}>総タスク数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>完了済み</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {totalCount - completedCount}
              </Text>
              <Text style={styles.statLabel}>未完了</Text>
            </View>
          </View>
        </View>

        {/* 表示モード切り替え */}
        <View style={styles.viewModeSelector}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              todoViewMode === 'daily' && styles.viewModeButtonActive,
            ]}
            onPress={() => setTodoViewMode('daily')}
          >
            <Text
              style={[
                styles.viewModeButtonText,
                todoViewMode === 'daily' && styles.viewModeButtonTextActive,
              ]}
            >
              日別
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              todoViewMode === 'weekly' && styles.viewModeButtonActive,
            ]}
            onPress={() => setTodoViewMode('weekly')}
          >
            <Text
              style={[
                styles.viewModeButtonText,
                todoViewMode === 'weekly' && styles.viewModeButtonTextActive,
              ]}
            >
              週別
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              todoViewMode === 'monthly' && styles.viewModeButtonActive,
            ]}
            onPress={() => setTodoViewMode('monthly')}
          >
            <Text
              style={[
                styles.viewModeButtonText,
                todoViewMode === 'monthly' && styles.viewModeButtonTextActive,
              ]}
            >
              月別
            </Text>
          </TouchableOpacity>
        </View>

        {/* TODOリスト */}
        <View style={styles.todoCard}>
          <Text style={styles.cardTitle}>TODOリスト</Text>
          {filteredTodos.map((todo) => {
            return (
              <View key={todo.id} style={styles.todoItem}>
                <View style={styles.todoInfo}>
                  <MaterialIcons
                    name={
                      todo.completed ? 'check-circle' : 'radio-button-unchecked'
                    }
                    size={24}
                    color={todo.completed ? '#4caf50' : '#ccc'}
                  />
                  <Text
                    style={[
                      styles.todoTitle,
                      todo.completed && styles.todoTitleCompleted,
                    ]}
                  >
                    {todo.title}
                  </Text>
                </View>
                <View
                  style={[
                    styles.priorityTag,
                    {
                      backgroundColor:
                        todo.priority === 'high'
                          ? '#ffebee'
                          : todo.priority === 'medium'
                          ? '#fff3e0'
                          : '#f3e5f5',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      {
                        color:
                          todo.priority === 'high'
                            ? '#d32f2f'
                            : todo.priority === 'medium'
                            ? '#f57c00'
                            : '#7b1fa2',
                      },
                    ]}
                  >
                    {todo.priority === 'high'
                      ? '高'
                      : todo.priority === 'medium'
                      ? '中'
                      : '低'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <Header
        title="プロフィール"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      {/* ユーザー情報 */}
      <View style={styles.userInfoCard}>
        <View style={styles.userHeader}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={32} color="#666" />
              </View>
            )}
            {user.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>
                {userProfile?.displayName || user.name}
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={() => setEditProfileVisible(true)}
                >
                  <MaterialIcons name="edit" size={20} color="#5c6bc0" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addFriendButton}
                  onPress={handleAddFriend}
                >
                  <MaterialIcons name="person-add" size={20} color="#5c6bc0" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.lastActive}>
              {user.isOnline ? 'オンライン' : `${user.lastActive}にアクティブ`}
            </Text>
          </View>
        </View>
        <Text style={styles.bio}>{userProfile?.bio || user.bio}</Text>
      </View>

      {/* タブ切り替え */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'study' && styles.activeTab]}
          onPress={() => setActiveTab('study')}
        >
          <MaterialIcons
            name="schedule"
            size={20}
            color={activeTab === 'study' ? '#5c6bc0' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'study' && styles.activeTabText,
            ]}
          >
            勉強時間
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'todo' && styles.activeTab]}
          onPress={() => setActiveTab('todo')}
        >
          <MaterialIcons
            name="assignment"
            size={20}
            color={activeTab === 'todo' ? '#5c6bc0' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'todo' && styles.activeTabText,
            ]}
          >
            TODOリスト
          </Text>
        </TouchableOpacity>
      </View>

      {/* タブコンテンツ */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'study' ? renderStudyTab() : renderTodoTab()}
      </ScrollView>

      {/* 友達追加モーダル */}
      <Modal
        visible={addFriendVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddFriendVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>友達追加</Text>
            <Text style={styles.modalText}>
              {user.name}さんに友達申請を送信しますか？
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddFriendVisible(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmAddFriend}
              >
                <Text style={styles.confirmButtonText}>送信</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* プロフィール編集モーダル */}
      <Modal
        visible={editProfileVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditProfileVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>プロフィールを編集</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="表示名"
              value={editForm.displayName}
              onChangeText={(text) =>
                setEditForm((prev) => ({ ...prev, displayName: text }))
              }
            />

            <TextInput
              style={[styles.modalInput, styles.bioInput]}
              placeholder="自己紹介"
              value={editForm.bio}
              onChangeText={(text) =>
                setEditForm((prev) => ({ ...prev, bio: text }))
              }
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={() => setEditProfileVisible(false)}
              >
                <Text style={styles.modalBtnText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirm]}
                onPress={updateProfile}
              >
                <Text style={styles.modalBtnText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  addFriendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  editProfileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerSpacer: {
    width: 40,
  },
  userInfoCard: {
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userDetails: {
    flex: 1,
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  lastActive: {
    fontSize: 12,
    color: '#999',
    marginBottom: 0,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#5c6bc0',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  viewModeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    paddingBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5c6bc0',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  yAxis: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 0,
    marginBottom: 6,
    height: 200,
    justifyContent: 'flex-end',
    width: 40,
    position: 'relative',
  },
  yAxisLabelContainer: {
    position: 'absolute',
    right: 10,
    width: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 12,
  },
  yAxisLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    textAlign: 'right',
  },
  barGraphArea: {
    flex: 1,
    maxHeight: 250,
  },
  barGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    marginBottom: 0,
    justifyContent: 'center',
  },
  barGroup: {
    alignItems: 'center',
    marginHorizontal: 0,
  },
  bar: {
    width: 28,
    backgroundColor: '#5c6bc0',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    width: 54,
    textAlign: 'center',
    fontSize: 11,
    color: '#5f6368',
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  barHours: {
    fontSize: 11,
    color: '#5f6368',
    marginBottom: 2,
    fontWeight: '600',
  },
  recordsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordInfo: {
    flex: 1,
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recordSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recordDetails: {
    alignItems: 'flex-end',
  },
  recordHours: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5c6bc0',
    marginBottom: 4,
  },
  recordContent: {
    fontSize: 14,
    color: '#666',
  },
  todoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  todoInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  todoTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalConfirm: {
    backgroundColor: '#5c6bc0',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#5c6bc0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#5c6bc0',
    fontWeight: '600',
  },
});
