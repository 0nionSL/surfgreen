// components/BottomSheet.tsx
import React, { useMemo, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  PanResponder, 
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors';
import { SpotWithForecast } from '../types';
import { UserLocation, addDistanceToSpot } from '../utils/location';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';

interface BottomSheetProps {
  spots: SpotWithForecast[];
  userLocation?: UserLocation | null;
  isLoading?: boolean;
}

const MIN_HEIGHT = 70;
const MAX_HEIGHT = 280;

const BottomSheet: React.FC<BottomSheetProps> = ({ 
  spots, 
  userLocation,
  isLoading = false 
}) => {
  const router = useRouter();
  const { setSelectedSpot } = useStore();
  const [expanded, setExpanded] = useState(false);
  
  const heightAnim = useRef(new Animated.Value(MIN_HEIGHT)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = expanded 
          ? MAX_HEIGHT + gestureState.dy 
          : MIN_HEIGHT + gestureState.dy;
        
        if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
          heightAnim.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50 && !expanded) {
          expandSheet();
        } else if (gestureState.dy > 50 && expanded) {
          collapseSheet();
        } else {
          if (expanded) {
            expandSheet();
          } else {
            collapseSheet();
          }
        }
      },
    })
  ).current;

  const expandSheet = () => {
    setExpanded(true);
    Animated.spring(heightAnim, {
      toValue: MAX_HEIGHT,
      useNativeDriver: false,
      tension: 60,
      friction: 12,
    }).start();
  };

  const collapseSheet = () => {
    setExpanded(false);
    Animated.spring(heightAnim, {
      toValue: MIN_HEIGHT,
      useNativeDriver: false,
      tension: 60,
      friction: 12,
    }).start();
  };

  const toggleSheet = () => {
    if (expanded) {
      collapseSheet();
    } else {
      expandSheet();
    }
  };

  if (isLoading || !spots || spots.length === 0) {
    return null;
  }

  const spotsWithDistance = useMemo(() => {
    return spots.map((spot) => addDistanceToSpot(spot, userLocation || null));
  }, [spots, userLocation]);

  const perfectSpots = useMemo(() => {
    return spotsWithDistance.filter((spot) => spot.forecast.color === 'green');
  }, [spotsWithDistance]);

  if (perfectSpots.length === 0) {
    return null;
  }

  const handleSpotPress = (spot: SpotWithForecast) => {
    setSelectedSpot(spot);
    router.push(`/spot/${spot.id}`);
  };

  const visibleSpots = perfectSpots.slice(0, 10);

  return (
    <Animated.View 
      style={[
        styles.container,
        { height: heightAnim }
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity 
        style={styles.header}
        activeOpacity={0.7}
        onPress={toggleSheet}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>
          🏄 {perfectSpots.length} идеальных спотов
        </Text>
      </TouchableOpacity>

      {expanded && (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {visibleSpots.map((spot) => (
            <TouchableOpacity
              key={spot.id}
              style={styles.spotItem}
              onPress={() => handleSpotPress(spot)}
            >
              <View style={styles.spotInfo}>
                <Text style={styles.spotName}>{spot.name}</Text>
                <Text style={styles.spotDetails}>
                  {spot.region}, {spot.country} • Score: {spot.forecast.score}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
          {perfectSpots.length > 10 && (
            <Text style={styles.moreText}>
              и ещё {perfectSpots.length - 10} спотов
            </Text>
          )}
        </ScrollView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(11, 19, 43, 0.92)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    marginBottom: 6,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    marginTop: 12,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  spotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  spotDetails: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  moreText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 6,
  },
});

export default BottomSheet;