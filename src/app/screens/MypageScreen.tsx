import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../config';
import { router } from 'expo-router';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';
import { userProfileHelpers, UserProfile } from '../../utils/firebaseHelpers';

export default function MypageScreen() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    avatar: '',
    goals: [] as string[],
  });
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState('');

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
          avatar: profile.avatar || '',
          goals: profile.goals || [],
        });
      } else {
        // プロフィールが存在しない場合はデフォルト値で初期化
        setEditForm({
          displayName: currentUser?.displayName || '',
          bio: '',
          avatar: '',
          goals: [],
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
        avatar: editForm.avatar,
        goals: editForm.goals,
      };

      await userProfileHelpers.upsertUserProfile(profileData);

      setUserProfile({
        id: '',
        ...profileData,
        goals: editForm.goals,
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

  // ログアウト機能
  const handleLogout = async () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      {
        text: 'キャンセル',
        style: 'cancel',
      },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace('/');
          } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('エラー', 'ログアウトに失敗しました');
          }
        },
      },
    ]);
  };

  // 目標を追加
  const addGoal = () => {
    if (newGoal.trim() && !editForm.goals.includes(newGoal.trim())) {
      setEditForm((prev) => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()],
      }));
      setNewGoal('');
      setGoalModalVisible(false);
    }
  };

  // 目標を削除
  const removeGoal = (goalToRemove: string) => {
    setEditForm((prev) => ({
      ...prev,
      goals: prev.goals.filter((goal) => goal !== goalToRemove),
    }));
  };

  // 画像選択機能
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('エラー', 'カメラロールへのアクセス許可が必要です');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEditForm((prev) => ({ ...prev, avatar: result.assets[0].uri }));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>ログインが必要です</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header title="マイページ" showBackButton={false} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ユーザー情報カード */}
        <View style={styles.userInfoCard}>
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              {userProfile?.avatar || editForm.avatar ? (
                <Image
                  source={{ uri: userProfile?.avatar || editForm.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialIcons name="person" size={32} color="#666" />
                </View>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {userProfile?.displayName ||
                  currentUser.displayName ||
                  'ユーザー'}
              </Text>
              <Text style={styles.userEmail}>{currentUser.email}</Text>
              <Text style={styles.userBio}>
                {userProfile?.bio || '自己紹介を追加してください'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditProfileVisible(true)}
            >
              <MaterialIcons name="edit" size={20} color="#5c6bc0" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 統計情報カード */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>学習統計</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>総勉強時間</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>完了タスク</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>友達数</Text>
            </View>
          </View>
        </View>

        {/* 目標セクション */}
        <View style={styles.menuCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.cardTitle}>目標</Text>
            <TouchableOpacity
              style={styles.addGoalButton}
              onPress={() => setGoalModalVisible(true)}
            >
              <MaterialIcons name="add" size={20} color="#5c6bc0" />
            </TouchableOpacity>
          </View>

          {editForm.goals.length > 0 ? (
            <View style={styles.goalsContainer}>
              {editForm.goals.map((goal, index) => (
                <View key={index} style={styles.goalChip}>
                  <Text style={styles.goalText}>{goal}</Text>
                  <TouchableOpacity
                    onPress={() => removeGoal(goal)}
                    style={styles.removeGoalButton}
                  >
                    <MaterialIcons name="close" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noGoalsText}>目標を設定してみましょう</Text>
          )}
        </View>

        {/* 設定メニュー */}
        <View style={styles.menuCard}>
          <Text style={styles.cardTitle}>設定</Text>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="notifications" size={24} color="#666" />
            <Text style={styles.menuText}>通知設定</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="privacy-tip" size={24} color="#666" />
            <Text style={styles.menuText}>プライバシー設定</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="help" size={24} color="#666" />
            <Text style={styles.menuText}>ヘルプ・サポート</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="#ff4444" />
            <Text style={[styles.menuText, styles.logoutText]}>ログアウト</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>

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

            {/* プロフィール画像選択 */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarSelectButton}
                onPress={pickImage}
              >
                {editForm.avatar ? (
                  <Image
                    source={{ uri: editForm.avatar }}
                    style={styles.modalAvatar}
                  />
                ) : (
                  <View style={styles.modalAvatarPlaceholder}>
                    <MaterialIcons name="camera-alt" size={24} color="#666" />
                    <Text style={styles.avatarSelectText}>画像を選択</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="名前を入力してください（例：田中太郎）"
              placeholderTextColor="#999"
              value={editForm.displayName}
              onChangeText={(text) =>
                setEditForm((prev) => ({ ...prev, displayName: text }))
              }
            />

            <TextInput
              style={[styles.modalInput, styles.bioInput]}
              placeholder="自己紹介を入力してください（例：大学生です。数学と英語を勉強しています。よろしくお願いします！）"
              placeholderTextColor="#999"
              value={editForm.bio}
              onChangeText={(text) =>
                setEditForm((prev) => ({ ...prev, bio: text }))
              }
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditProfileVisible(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={updateProfile}
              >
                <Text style={styles.confirmButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 目標追加モーダル */}
      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>新しい目標を追加</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="目標を入力してください（例：TOEIC800点取得）"
              value={newGoal}
              onChangeText={setNewGoal}
              autoFocus
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={() => {
                  setGoalModalVisible(false);
                  setNewGoal('');
                }}
              >
                <Text style={styles.modalBtnText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirm]}
                onPress={addGoal}
              >
                <Text style={styles.modalBtnText}>追加</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ボトムナビゲーション */}
      <BottomNavigation activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fb',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fb',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100, // ボトムナビゲーションの高さ分のパディング
  },
  userInfoCard: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
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
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  editButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  statsCard: {
    backgroundColor: '#fff',
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
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
    marginTop: 4,
  },
  statsGrid: {
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
  menuCard: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutText: {
    color: '#ff4444',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  addGoalButton: {
    padding: 4,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8eaf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    color: '#5c6bc0',
    fontWeight: '500',
    marginRight: 4,
  },
  removeGoalButton: {
    padding: 2,
  },
  noGoalsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarSelectButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  modalAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  avatarSelectText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
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
});
