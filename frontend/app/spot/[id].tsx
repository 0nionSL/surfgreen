import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams();
  const { selectedSpot } = useStore();
  const router = useRouter();

  if (!selectedSpot) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notFound}>Спот не найден</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
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
    <View style={styles.container}>
      {/* 🔥 СПАСЕНИЕ ОТ БЕЛОГО ФОНА — мгновенный синий слой */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: colors.background }} />
      </View>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
        <Ionicons name="arrow-back" size={28} color={colors.text} />
      </TouchableOpacity>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
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
            <Text style={styles.recommendationText}>
              {selectedSpot.forecast.board || 'Информация не доступна'}
            </Text>
          </View>
          
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationIcon}>👔</Text>
            <Text style={styles.recommendationText}>
              {selectedSpot.forecast.wetsuit || 'Информация не доступна'}
            </Text>
          </View>
          
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationIcon}>🌊</Text>
            <Text style={styles.recommendationText}>
              {selectedSpot.forecast.conditions || 'Информация не доступна'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  notFound: {
    color: colors.text,
    fontSize: 18,
    marginBottom: 16,
  },
  backButtonHeader: {
    padding: 16,
    paddingBottom: 0,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
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