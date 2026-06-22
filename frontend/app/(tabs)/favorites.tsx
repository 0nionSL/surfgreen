import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../../constants/Colors';
import { Spot } from '../../types';
import { api } from '../../services/api';
import { useFavoriteStore } from '../../store/favoriteStore';
import SpotCard from '../../components/SpotCard';

const fetchSpotsWithForecast = async () => {
  try {
    const spotsResponse = await api.get('/api/spots');
    const spots = spotsResponse.data;
    
    if (!spots || spots.length === 0) {
      return [];
    }
    
    const spotIds = spots.map((s: any) => s.id).join(',');
    const forecastResponse = await api.get(`/api/forecast/bulk?spot_ids=${spotIds}`);
    const forecastData = forecastResponse.data;
    const forecasts = forecastData.forecasts || [];
    
    return spots.map((spot: any) => {
      const forecast = forecasts.find((f: any) => f.spot_id === spot.id);
      return {
        ...spot,
        forecast: forecast ? {
          score: forecast.score || 0,
          color: forecast.color || 'red',
          swellHeight: forecast.swell_height || 0,
          swellPeriod: forecast.swell_period || 0,
          windSpeed: forecast.wind_speed || 0,
          waterTemp: forecast.water_temp || 0,
          wetsuit: forecast.wetsuit || 'Неизвестно',
          board: forecast.board || 'Неизвестно',
          conditions: forecast.conditions || 'Нет данных',
        } : {
          score: 0,
          color: 'red' as const,
          swellHeight: 0,
          swellPeriod: 0,
          windSpeed: 0,
          waterTemp: 0,
          wetsuit: 'Нет данных',
          board: 'Нет данных',
          conditions: 'Нет данных',
        }
      };
    });
  } catch (error) {
    console.error('Error fetching spots:', error);
    throw error;
  }
};

export default function FavoritesScreen() {
  const { favorites } = useFavoriteStore();
  const [refreshing, setRefreshing] = useState(false);

  const { 
    data: allSpots = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['spotsWithForecast'],
    queryFn: fetchSpotsWithForecast,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const favoriteSpots = allSpots.filter((spot: Spot) => favorites.includes(spot.id));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Загрузка избранного...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ Ошибка загрузки</Text>
        <Text style={styles.errorSubText}>Проверьте подключение к интернету</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (favoriteSpots.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>❤️ Пока пусто</Text>
        <Text style={styles.emptySubText}>
          Добавляйте споты в избранное, чтобы они появлялись здесь
        </Text>
      </View>
    );
  }

  console.log('🔵 FavoritesScreen favoriteSpots:', favoriteSpots?.length || 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⭐ Избранное</Text>
      <Text style={styles.subtitle}>{favoriteSpots.length} спотов</Text>
      
      <FlatList
        data={favoriteSpots}
        renderItem={({ item }) => <SpotCard spot={item} showFavoriteButton={true} />}
        keyExtractor={(item: Spot) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.background}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text,
    fontSize: 16,
  },
  errorText: {
    color: colors.dangerZone,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorSubText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyTitle: {
    fontSize: 32,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
});