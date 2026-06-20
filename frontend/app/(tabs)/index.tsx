import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useStore } from '../../store/useStore';
import MapView from '../../components/MapView';
import BottomSheet from '../../components/BottomSheet';
import { colors } from '../../constants/Colors';

export default function MapScreen() {
  const { spotsWithForecast, loading, loadSpots } = useStore();

  useEffect(() => {
    loadSpots();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Загрузка волн...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView spots={spotsWithForecast} />
      <BottomSheet spots={spotsWithForecast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text,
    fontSize: 16,
  },
});