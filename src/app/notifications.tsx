import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config';
import BottomNavigation from '../components/BottomNavigation';
import Header from '../components/Header';
import { notificationHelpers, Notification } from '../utils/firebaseHelpers';

// サンプル通知データ
const notificationsData = [
  {
    id: '1',
    type: 'friend_request',
    fromUser: {
      id: '2',
      name: '佐藤花子',
      avatar: null,
    },
    message: '友達申請を送信しました',
    timestamp: '2024-01-15 14:30',
    status: 'pending', // pending, accepted, declined
  },
  {
    id: '2',
    type: 'friend_request',
    fromUser: {
      id: '3',
      name: '鈴木一郎',
      avatar: null,
    },
    message: '友達申請を送信しました',
    timestamp: '2024-01-14 09:15',
    status: 'pending',
  },
  {
    id: '3',
    type: 'friend_request',
    fromUser: {
      id: '4',
      name: '高橋美咲',
      avatar: null,
    },
    message: '友達申請を送信しました',
    timestamp: '2024-01-13 16:45',
    status: 'accepted',
  },
  {
    id: '4',
    type: 'friend_request',
    fromUser: {
      id: '5',
      name: '山田次郎',
      avatar: null,
    },
    message: '友達申請を送信しました',
    timestamp: '2024-01-12 11:20',
    status: 'declined',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ユーザー認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadNotifications(user.uid);
      } else {
        setNotifications([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 通知を読み込み
  const loadNotifications = async (userId: string) => {
    try {
      setLoading(true);
      const userNotifications = await notificationHelpers.getUserNotifications(
        userId
      );
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('エラー', '通知の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptFriend = async (notificationId: string) => {
    try {
      // Firebaseで通知を既読にする
      await notificationHelpers.markNotificationAsRead(notificationId);

      // ローカル状態を更新
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      Alert.alert('友達申請を承認しました', '新しい友達が追加されました！');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('エラー', '友達申請の承認に失敗しました');
    }
  };

  const handleDeclineFriend = async (notificationId: string) => {
    try {
      // Firebaseで通知を既読にする
      await notificationHelpers.markNotificationAsRead(notificationId);

      // ローカル状態を更新
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      Alert.alert('友達申請を拒否しました');
    } catch (error) {
      console.error('Error declining friend request:', error);
      Alert.alert('エラー', '友達申請の拒否に失敗しました');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA726';
      case 'accepted':
        return '#4CAF50';
      case 'declined':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '承認待ち';
      case 'accepted':
        return '承認済み';
      case 'declined':
        return '拒否済み';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'schedule';
      case 'accepted':
        return 'check-circle';
      case 'declined':
        return 'cancel';
      default:
        return 'info';
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fb" />
      <Header title="通知" />

      <ScrollView
        style={styles.notificationList}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationItem}>
            <View style={styles.notificationHeader}>
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  {notification.fromUser.avatar ? (
                    <Image
                      source={{ uri: notification.fromUser.avatar }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <MaterialIcons name="person" size={20} color="#666" />
                    </View>
                  )}
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {notification.fromUser.name}
                  </Text>
                  <Text style={styles.message}>{notification.message}</Text>
                </View>
              </View>
              <View style={styles.statusContainer}>
                <MaterialIcons
                  name={getStatusIcon(notification.status) as any}
                  size={16}
                  color={getStatusColor(notification.status)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(notification.status) },
                  ]}
                >
                  {getStatusText(notification.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.timestamp}>{notification.timestamp}</Text>

            {notification.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAcceptFriend(notification.id || '')}
                >
                  <MaterialIcons name="check" size={16} color="#fff" />
                  <Text style={styles.acceptButtonText}>承認</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => handleDeclineFriend(notification.id || '')}
                >
                  <MaterialIcons name="close" size={16} color="#fff" />
                  <Text style={styles.declineButtonText}>拒否</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {notifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={48} color="#ccc" />
            <Text style={styles.emptyText}>通知はありません</Text>
          </View>
        )}
      </ScrollView>

      <BottomNavigation activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  notificationList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationItem: {
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
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
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
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#F44336',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
