import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface BottomNavigationProps {
  activeTab: 'study' | 'search' | 'friends' | 'profile';
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const isActive = (tab: string) => activeTab === tab;

  return (
    <View style={styles.bottomArea}>
      <View style={styles.bottomContainer}>
        <Link href="/" asChild>
          <TouchableOpacity
            style={[
              styles.bottomItem,
              isActive('study') && styles.bottomItemActive,
            ]}
          >
            <View
              style={[
                styles.bottomIconContainer,
                isActive('study') && styles.bottomIconContainerActive,
              ]}
            >
              <MaterialIcons
                name="bar-chart"
                size={24}
                color={isActive('study') ? '#fff' : '#666'}
              />
            </View>
            <Text
              style={
                isActive('study')
                  ? styles.bottomLabel
                  : styles.bottomLabelSecondary
              }
            >
              勉強時間
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/search" asChild>
          <TouchableOpacity
            style={[
              styles.bottomItem,
              isActive('search') && styles.bottomItemActive,
            ]}
          >
            <View
              style={[
                styles.bottomIconContainer,
                isActive('search') && styles.bottomIconContainerActive,
              ]}
            >
              <Ionicons
                name="search"
                size={24}
                color={isActive('search') ? '#fff' : '#666'}
              />
            </View>
            <Text
              style={
                isActive('search')
                  ? styles.bottomLabel
                  : styles.bottomLabelSecondary
              }
            >
              検索
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/friends" asChild>
          <TouchableOpacity
            style={[
              styles.bottomItem,
              isActive('friends') && styles.bottomItemActive,
            ]}
          >
            <View
              style={[
                styles.bottomIconContainer,
                isActive('friends') && styles.bottomIconContainerActive,
              ]}
            >
              <MaterialIcons
                name="people-outline"
                size={24}
                color={isActive('friends') ? '#fff' : '#666'}
              />
            </View>
            <Text
              style={
                isActive('friends')
                  ? styles.bottomLabel
                  : styles.bottomLabelSecondary
              }
            >
              フレンド
            </Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          style={[
            styles.bottomItem,
            isActive('profile') && styles.bottomItemActive,
          ]}
        >
          <View
            style={[
              styles.bottomIconContainer,
              isActive('profile') && styles.bottomIconContainerActive,
            ]}
          >
            <MaterialIcons
              name="person-outline"
              size={24}
              color={isActive('profile') ? '#fff' : '#666'}
            />
          </View>
          <Text
            style={
              isActive('profile')
                ? styles.bottomLabel
                : styles.bottomLabelSecondary
            }
          >
            マイページ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    paddingBottom: 8,
    zIndex: 1000,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
    width: '100%',
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 8,
    minWidth: 60,
  },
  bottomIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bottomLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5c6bc0',
    textAlign: 'center',
    width: '100%',
  },
  bottomLabelSecondary: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    width: '100%',
  },
  bottomItemActive: {
    backgroundColor: '#f0f4ff',
  },
  bottomIconContainerActive: {
    backgroundColor: '#5c6bc0',
    shadowColor: '#5c6bc0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
