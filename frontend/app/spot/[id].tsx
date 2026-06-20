import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useStore } from '../../store/useStore';
import { colors } from '../../constants/Colors';

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams();
  const { selectedSpot } = useStore();

  if (!selectedSpot) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notFound}>Спот не найден</Text>
      </View>
    );
  }

  const getColor = () => {
    switch (selectedSpot.forecast.color) {
      case 'green':
        return colors.success;
      case 'yellow':
        return colors.warning;
      case 'red':
        return colors.dangerZone;
      default:
        return colors.textMuted;
    }
  };

  const scoreColor = getColor();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.name}>{selectedSpot.name}</Text>
      <Text style={styles.location}>
        {selectedSpot.region}, {selectedSpot.country}
      </Text>

      <View style={styles.scoreContainer}>
        <Text style={[styles.score, { color: scoreColor }]}>
          {selectedSpot.forecast.score}
        </Text>
        <Text style={styles.scoreLabel}>SURF SCORE</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Волна</Text>
          <Text style={styles.cardValue}>{selectedSpot.forecast.swellHeight}m</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Период</Text>
          <Text style={styles.cardValue}>{selectedSpot.forecast.swellPeriod}s</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Ветер</Text>
          <Text style={styles.cardValue}>{selectedSpot.forecast.windSpeed} kn</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Вода</Text>
          <Text style={styles.cardValue}>{selectedSpot.forecast.waterTemp}°C</Text>
        </View>
      </View>

      <View style={styles.recommendations}>
        <Text style={styles.recommendationsTitle}>Рекомендации</Text>
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationIcon}>🏄</Text>
          <Text style={styles.recommendationText}>{selectedSpot.forecast.board}</Text>
        </View>
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationIcon}>👔</Text>
          <Text style={styles.recommendationText}>{selectedSpot.forecast.wetsuit}</Text>
        </View>
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationIcon}>🌊</Text>
          <Text style={styles.recommendationText}>{selectedSpot.forecast.conditions}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  notFound: {
    color: colors.text,
    fontSize: 18,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  location: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  score: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 2,
    marginTop: -8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  recommendations: {
    marginBottom: 32,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 8,
  },
  recommendationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recommendationText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
});