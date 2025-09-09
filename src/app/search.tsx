import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../components/BottomNavigation';
import Header from '../components/Header';
import Card from '../components/Card';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'students' | 'teachers'
  >('all');

  // サンプルユーザーデータ
  const sampleUsers = [
    {
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
    },
    {
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
    },
    {
      id: '3',
      name: '山田 次郎',
      username: '@yamada_jiro',
      avatar: null,
      studyHours: 52,
      subjects: ['数学', '英語', '理科'],
      isOnline: true,
      lastActive: '今',
      bio: '医学部志望。勉強仲間を探しています！',
      mutualFriends: 0,
    },
    {
      id: '4',
      name: '鈴木 美咲',
      username: '@suzuki_misaki',
      avatar: null,
      studyHours: 29,
      subjects: ['国語', '英語', '美術'],
      isOnline: false,
      lastActive: '3時間前',
      bio: '芸術系大学を目指しています。デッサンと英語が好きです。',
      mutualFriends: 2,
    },
    {
      id: '5',
      name: '高橋 健太',
      username: '@takahashi_kenta',
      avatar: null,
      studyHours: 67,
      subjects: ['数学', '物理', '化学', '英語'],
      isOnline: true,
      lastActive: '5分前',
      bio: '東大志望の浪人生。一緒に頑張りましょう！',
      mutualFriends: 4,
    },
  ];

  // 検索とフィルタリング
  const filteredUsers = useMemo(() => {
    let filtered = sampleUsers;

    // 検索クエリでフィルタリング
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          user.bio.toLowerCase().includes(query) ||
          user.subjects.some((subject) => subject.toLowerCase().includes(query))
      );
    }

    // カテゴリでフィルタリング
    if (selectedFilter === 'students') {
      filtered = filtered.filter((user) => user.studyHours < 50);
    } else if (selectedFilter === 'teachers') {
      filtered = filtered.filter((user) => user.studyHours >= 50);
    }

    return filtered;
  }, [searchQuery, selectedFilter]);

  const handleUserPress = (user: any) => {
    router.push(`/user-profile?userId=${user.id}`);
  };

  const renderUserCard = (user: any) => (
    <TouchableOpacity
      key={user.id}
      style={styles.userCard}
      onPress={() => handleUserPress(user)}
    >
      <View style={styles.userCardHeader}>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={24} color="#666" />
            </View>
          )}
          {user.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.username}>{user.username}</Text>
          </View>
          <Text style={styles.lastActive}>
            {user.isOnline ? 'オンライン' : `${user.lastActive}にアクティブ`}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Alert.alert(
                '友達追加',
                `${user.name}さんに友達申請を送信しますか？`,
                [
                  { text: 'キャンセル', style: 'cancel' },
                  {
                    text: '送信',
                    onPress: () => {
                      Alert.alert(
                        '送信完了',
                        '友達申請を送信しました！相手の承認をお待ちください。'
                      );
                    },
                  },
                ]
              );
            }}
          >
            <MaterialIcons name="person-add" size={20} color="#5c6bc0" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.bio} numberOfLines={2}>
        {user.bio}
      </Text>

      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <MaterialIcons name="schedule" size={16} color="#666" />
          <Text style={styles.statText}>{user.studyHours}時間</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="school" size={16} color="#666" />
          <Text style={styles.statText}>{user.subjects.length}科目</Text>
        </View>
        {user.mutualFriends > 0 && (
          <View style={styles.statItem}>
            <MaterialIcons name="people" size={16} color="#666" />
            <Text style={styles.statText}>
              共通の友達 {user.mutualFriends}人
            </Text>
          </View>
        )}
      </View>

      <View style={styles.subjectsContainer}>
        {user.subjects.slice(0, 3).map((subject: string, index: number) => (
          <View key={index} style={styles.subjectTag}>
            <Text style={styles.subjectText}>{subject}</Text>
          </View>
        ))}
        {user.subjects.length > 3 && (
          <View style={styles.subjectTag}>
            <Text style={styles.subjectText}>+{user.subjects.length - 3}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <Header title="ユーザー検索" />

      {/* 検索エリア */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={24} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="ユーザー名、科目、自己紹介で検索..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* フィルターボタン */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'all' && styles.filterButtonTextActive,
              ]}
            >
              すべて
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'students' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('students')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'students' && styles.filterButtonTextActive,
              ]}
            >
              学生
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'teachers' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('teachers')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'teachers' && styles.filterButtonTextActive,
              ]}
            >
              講師
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ユーザー一覧 */}
      <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map(renderUserCard)
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {searchQuery.trim()
                ? '検索結果が見つかりませんでした'
                : 'ユーザーが見つかりませんでした'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              別のキーワードで検索してみてください
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNavigation activeTab="search" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 90,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fb',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#5c6bc0',
    borderColor: '#5c6bc0',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  userList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  lastActive: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  subjectTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
