import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface BannerAdProps {
  onClose?: () => void;
}

const BannerAd: React.FC<BannerAdProps> = ({ onClose }) => {
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerContent}>
        <View style={styles.adIcon}>
          <MaterialIcons name="campaign" size={16} color="#666" />
        </View>
        <View style={styles.adTextContainer}>
          <Text style={styles.adTitle}>学習アプリを始めよう！</Text>
          <Text style={styles.adSubtitle}>効率的な勉強で目標達成</Text>
        </View>
        <TouchableOpacity style={styles.adButton}>
          <Text style={styles.adButtonText}>詳細</Text>
        </TouchableOpacity>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={16} color="#999" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    height: 50, // AdMobバナーと同じ高さ
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 320, // AdMobバナーと同じ幅
    paddingHorizontal: 8,
  },
  adIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e8eaf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  adTextContainer: {
    flex: 1,
  },
  adTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 1,
  },
  adSubtitle: {
    fontSize: 10,
    color: '#666',
  },
  adButton: {
    backgroundColor: '#5c6bc0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
  },
  adButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BannerAd;
