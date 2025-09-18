import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config';
import BottomNavigation from '../components/BottomNavigation';
import Header from '../components/Header';
import { friendHelpers, Friend } from '../utils/firebaseHelpers';

// サンプルデータ
const friendsData = [
  {
    id: '1',
    name: '田中太郎',
    avatar: null,
    totalHours: 45.5,
    monthlyHours: 12.3,
    weeklyHours: 8.7,
    dailyHours: 2.1,
    isCurrentUser: true,
  },
  {
    id: '2',
    name: '佐藤花子',
    avatar: null,
    totalHours: 38.2,
    monthlyHours: 15.8,
    weeklyHours: 6.2,
    dailyHours: 1.8,
    isCurrentUser: false,
  },
  {
    id: '3',
    name: '鈴木一郎',
    avatar: null,
    totalHours: 42.1,
    monthlyHours: 11.5,
    weeklyHours: 7.9,
    dailyHours: 2.3,
    isCurrentUser: false,
  },
  {
    id: '4',
    name: '高橋美咲',
    avatar: null,
    totalHours: 35.7,
    monthlyHours: 9.2,
    weeklyHours: 5.4,
    dailyHours: 1.5,
    isCurrentUser: false,
  },
  {
    id: '5',
    name: '山田次郎',
    avatar: null,
    totalHours: 29.8,
    monthlyHours: 7.6,
    weeklyHours: 4.1,
    dailyHours: 1.2,
    isCurrentUser: false,
  },
];

export default function FriendsScreen() {
  const [timeRange, setTimeRange] = useState<
    'total' | 'monthly' | 'weekly' | 'daily'
  >('total');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [addFriendModalVisible, setAddFriendModalVisible] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');

  // ユーザー認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadFriends(user.uid);
      } else {
        setFriends([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 友達リストを読み込み
  const loadFriends = async (userId: string) => {
    try {
      setLoading(true);
      const userFriends = await friendHelpers.getUserFriends(userId);
      setFriends(userFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('エラー', '友達リストの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 友達リクエストを送信
  const sendFriendRequest = async () => {
    if (!currentUser || !friendEmail.trim()) {
      Alert.alert('エラー', 'メールアドレスを入力してください');
      return;
    }

    try {
      // 実際の実装では、メールアドレスからユーザーIDを取得する必要があります
      // ここでは簡略化のため、メールアドレスをそのまま使用
      await friendHelpers.sendFriendRequest(
        currentUser.uid,
        friendEmail.trim()
      );

      setAddFriendModalVisible(false);
      setFriendEmail('');
      Alert.alert('成功', '友達リクエストを送信しました');
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('エラー', '友達リクエストの送信に失敗しました');
    }
  };

  const getSortedData = useMemo(() => {
    const sortedData = [...friendsData].sort((a, b) => {
      switch (timeRange) {
        case 'total':
          return b.totalHours - a.totalHours;
        case 'monthly':
          return b.monthlyHours - a.monthlyHours;
        case 'weekly':
          return b.weeklyHours - a.weeklyHours;
        case 'daily':
          return b.dailyHours - a.dailyHours;
        default:
          return 0;
      }
    });
    return sortedData;
  }, [timeRange]);

  const getTimeValue = (user: any) => {
    switch (timeRange) {
      case 'total':
        return user.totalHours;
      case 'monthly':
        return user.monthlyHours;
      case 'weekly':
        return user.weeklyHours;
      case 'daily':
        return user.dailyHours;
      default:
        return 0;
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'total':
        return '総時間';
      case 'monthly':
        return '月別';
      case 'weekly':
        return '週別';
      case 'daily':
        return '日別';
      default:
        return '';
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}位`;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return '#666';
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fb" />
      <Header
        title="フレンドランキング"
        rightButton={{
          icon: 'person-add',
          onPress: () => {
            // 検索画面に遷移
          },
        }}
      />

      {/* 時間範囲選択 */}
      <View style={styles.timeRangeSelector}>
        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            timeRange === 'total' && styles.timeRangeButtonActive,
          ]}
          onPress={() => setTimeRange('total')}
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              timeRange === 'total' && styles.timeRangeButtonTextActive,
            ]}
          >
            総時間
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            timeRange === 'monthly' && styles.timeRangeButtonActive,
          ]}
          onPress={() => setTimeRange('monthly')}
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              timeRange === 'monthly' && styles.timeRangeButtonTextActive,
            ]}
          >
            月別
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            timeRange === 'weekly' && styles.timeRangeButtonActive,
          ]}
          onPress={() => setTimeRange('weekly')}
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              timeRange === 'weekly' && styles.timeRangeButtonTextActive,
            ]}
          >
            週別
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            timeRange === 'daily' && styles.timeRangeButtonActive,
          ]}
          onPress={() => setTimeRange('daily')}
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              timeRange === 'daily' && styles.timeRangeButtonTextActive,
            ]}
          >
            日別
          </Text>
        </TouchableOpacity>
      </View>

      {/* ランキングリスト */}
      <ScrollView
        style={styles.rankingList}
        showsVerticalScrollIndicator={false}
      >
        {getSortedData.map((user, index) => (
          <View
            key={user.id}
            style={[
              styles.rankingItem,
              user.isCurrentUser && styles.currentUserItem,
            ]}
          >
            <View style={styles.rankContainer}>
              <Text style={[styles.rankText, { color: getRankColor(index) }]}>
                {getRankIcon(index)}
              </Text>
            </View>

            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialIcons name="person" size={24} color="#666" />
                </View>
              )}
            </View>

            <View style={styles.userInfo}>
              <Text
                style={[
                  styles.userName,
                  user.isCurrentUser && styles.currentUserName,
                ]}
              >
                {user.name}
                {user.isCurrentUser && ' (あなた)'}
              </Text>
              <Text style={styles.timeValue}>
                {getTimeValue(user).toFixed(1)}h
              </Text>
            </View>

            <View style={styles.timeLabel}>
              <Text style={styles.timeLabelText}>{getTimeRangeLabel()}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 友達追加モーダル */}
      <Modal
        visible={addFriendModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddFriendModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>友達を追加</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="友達のメールアドレス"
              value={friendEmail}
              onChangeText={setFriendEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={() => setAddFriendModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirm]}
                onPress={sendFriendRequest}
              >
                <Text style={styles.modalBtnText}>送信</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavigation activeTab="friends" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#5c6bc0',
  },
  timeRangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  timeRangeButtonTextActive: {
    color: '#fff',
  },
  rankingList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: '#5c6bc0',
    backgroundColor: '#f0f4ff',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarContainer: {
    marginLeft: 12,
    marginRight: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  currentUserName: {
    color: '#5c6bc0',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5c6bc0',
  },
  timeLabel: {
    alignItems: 'flex-end',
  },
  timeLabelText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  // モーダルのスタイル
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
});
