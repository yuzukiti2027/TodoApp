import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';

// Todoアイテムの型定義
export interface TodoItem {
  id?: string;
  label: string;
  done: boolean;
  priority: 'high' | 'medium' | 'low';
  category: 'daily' | 'weekly' | 'monthly';
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

// 達成記録の型定義
export interface Achievement {
  id?: string;
  itemId: string;
  itemLabel: string;
  category: 'daily' | 'weekly' | 'monthly';
  achievedAt: string;
  period: string;
  userId: string;
  createdAt?: any;
}

// 勉強時間の型定義
export interface StudyTime {
  id?: string;
  subject: string;
  duration: number; // 分単位
  date: string; // YYYY-MM-DD形式
  userId: string;
  createdAt?: any;
}

// ユーザープロフィールの型定義
export interface UserProfile {
  id?: string;
  userId: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  goals?: string[]; // ユーザーの目標リスト
  createdAt?: any;
  updatedAt?: any;
}

// 友達関係の型定義
export interface Friend {
  id?: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt?: any;
}

// 通知の型定義
export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'todo' | 'study' | 'friend' | 'general';
  read: boolean;
  createdAt?: any;
  fromUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status?: 'pending' | 'accepted' | 'declined';
  timestamp?: string;
}

// Todoアイテムの操作
export const todoHelpers = {
  // Todoアイテムを追加
  async addTodoItem(
    todoItem: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'todos'), {
        ...todoItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding todo item:', error);
      throw error;
    }
  },

  // Todoアイテムを更新
  async updateTodoItem(
    todoId: string,
    updates: Partial<TodoItem>
  ): Promise<void> {
    try {
      const todoRef = doc(db, 'todos', todoId);
      await updateDoc(todoRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating todo item:', error);
      throw error;
    }
  },

  // Todoアイテムを削除
  async deleteTodoItem(todoId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'todos', todoId));
    } catch (error) {
      console.error('Error deleting todo item:', error);
      throw error;
    }
  },

  // ユーザーのTodoアイテムを取得
  async getUserTodos(userId: string): Promise<TodoItem[]> {
    try {
      const q = query(
        collection(db, 'todos'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as TodoItem)
      );
    } catch (error) {
      console.error('Error getting user todos:', error);
      throw error;
    }
  },
};

// 達成記録の操作
export const achievementHelpers = {
  // 達成記録を追加
  async addAchievement(
    achievement: Omit<Achievement, 'id' | 'createdAt'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'achievements'), {
        ...achievement,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding achievement:', error);
      throw error;
    }
  },

  // ユーザーの達成記録を取得
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const q = query(
        collection(db, 'achievements'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Achievement)
      );
    } catch (error) {
      console.error('Error getting user achievements:', error);
      throw error;
    }
  },
};

// 勉強時間の操作
export const studyTimeHelpers = {
  // 勉強時間を追加
  async addStudyTime(
    studyTime: Omit<StudyTime, 'id' | 'createdAt'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'studyTimes'), {
        ...studyTime,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding study time:', error);
      throw error;
    }
  },

  // 勉強時間を更新
  async updateStudyTime(
    studyTimeId: string,
    updates: Partial<StudyTime>
  ): Promise<void> {
    try {
      const studyTimeRef = doc(db, 'studyTimes', studyTimeId);
      await updateDoc(studyTimeRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating study time:', error);
      throw error;
    }
  },

  // ユーザーの勉強時間を取得
  async getUserStudyTimes(userId: string): Promise<StudyTime[]> {
    try {
      const q = query(
        collection(db, 'studyTimes'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as StudyTime)
      );
    } catch (error) {
      console.error('Error getting user study times:', error);
      throw error;
    }
  },
};

// ユーザープロフィールの操作
export const userProfileHelpers = {
  // ユーザープロフィールを作成/更新
  async upsertUserProfile(
    profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const q = query(
        collection(db, 'userProfiles'),
        where('userId', '==', profile.userId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // 新規作成
        const docRef = await addDoc(collection(db, 'userProfiles'), {
          ...profile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return docRef.id;
      } else {
        // 更新
        const docId = querySnapshot.docs[0].id;
        const profileRef = doc(db, 'userProfiles', docId);
        await updateDoc(profileRef, {
          ...profile,
          updatedAt: serverTimestamp(),
        });
        return docId;
      }
    } catch (error) {
      console.error('Error upserting user profile:', error);
      throw error;
    }
  },

  // ユーザープロフィールを取得
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const q = query(
        collection(db, 'userProfiles'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as UserProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },
};

// 友達関係の操作
export const friendHelpers = {
  // 友達リクエストを送信
  async sendFriendRequest(userId: string, friendId: string): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'friends'), {
        userId,
        friendId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },

  // 友達リクエストを承認/拒否
  async updateFriendRequest(
    friendId: string,
    status: 'accepted' | 'blocked'
  ): Promise<void> {
    try {
      const friendRef = doc(db, 'friends', friendId);
      await updateDoc(friendRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating friend request:', error);
      throw error;
    }
  },

  // ユーザーの友達リストを取得
  async getUserFriends(userId: string): Promise<Friend[]> {
    try {
      const q = query(
        collection(db, 'friends'),
        where('userId', '==', userId),
        where('status', '==', 'accepted')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Friend)
      );
    } catch (error) {
      console.error('Error getting user friends:', error);
      throw error;
    }
  },
};

// 通知の操作
export const notificationHelpers = {
  // 通知を作成
  async createNotification(
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // 通知を既読にする
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // ユーザーの通知を取得
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Notification)
      );
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  },

  // 目標が似ているユーザーを検索
  async findUsersWithSimilarGoals(
    currentUserId: string,
    userGoals: string[]
  ): Promise<UserProfile[]> {
    try {
      if (!userGoals || userGoals.length === 0) {
        return [];
      }

      const q = query(collection(db, 'userProfiles'));
      const querySnapshot = await getDocs(q);

      const usersWithSimilarGoals: UserProfile[] = [];

      querySnapshot.docs.forEach((doc) => {
        const userData = doc.data() as UserProfile;

        // 自分以外のユーザーのみ対象
        if (userData.userId === currentUserId) return;

        // 目標が設定されているユーザーのみ対象
        if (!userData.goals || userData.goals.length === 0) return;

        // 共通する目標の数を計算
        const commonGoals = userData.goals.filter((goal) =>
          userGoals.some(
            (userGoal) =>
              userGoal.toLowerCase().includes(goal.toLowerCase()) ||
              goal.toLowerCase().includes(userGoal.toLowerCase())
          )
        );

        // 共通する目標が1つ以上あるユーザーを追加
        if (commonGoals.length > 0) {
          usersWithSimilarGoals.push({
            id: doc.id,
            ...userData,
          });
        }
      });

      // 共通する目標の数でソート（多い順）
      return usersWithSimilarGoals.sort((a, b) => {
        const aCommon =
          a.goals?.filter((goal) =>
            userGoals.some(
              (userGoal) =>
                userGoal.toLowerCase().includes(goal.toLowerCase()) ||
                goal.toLowerCase().includes(userGoal.toLowerCase())
            )
          ).length || 0;

        const bCommon =
          b.goals?.filter((goal) =>
            userGoals.some(
              (userGoal) =>
                userGoal.toLowerCase().includes(goal.toLowerCase()) ||
                goal.toLowerCase().includes(userGoal.toLowerCase())
            )
          ).length || 0;

        return bCommon - aCommon;
      });
    } catch (error) {
      console.error('Error finding users with similar goals:', error);
      throw error;
    }
  },
};
