import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TextInput, 
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../../constants/Colors';
import { SpotWithForecast } from '../../types';
import { api } from '../../services/api';
import { useSettingsStore } from '../../store/settingsStore';
import { useLocation } from '../../hooks/useLocation';
import { 
  filterSpotsByLevel, 
  filterSpotsByLocation,
  getLevelLabel, 
  getLevelEmoji,
  getUniqueCountries,
  getUniqueRegions,
} from '../../utils/spotFilter';
import { addDistanceToSpot, filterSpotsByRadius } from '../../utils/location';
import SpotCard from '../../components/SpotCard';

const fetchSpotsWithForecast = async (): Promise<SpotWithForecast[]> => {
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

export default function SpotsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { 
    skillLevel, 
    personalizedSpots, 
    spotRadius,
    useRadiusFilter, // 👈 НОВОЕ
    selectedCountry,
    selectedRegion,
  } = useSettingsStore();
  const { location } = useLocation();

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

  // Фильтруем по уровню
  const levelFilteredSpots = useMemo(() => {
    return filterSpotsByLevel(allSpots, skillLevel, personalizedSpots);
  }, [allSpots, skillLevel, personalizedSpots]);

  // Фильтруем по локации
  const locationFilteredSpots = useMemo(() => {
    return filterSpotsByLocation(levelFilteredSpots, selectedCountry, selectedRegion);
  }, [levelFilteredSpots, selectedCountry, selectedRegion]);

  // Фильтруем по радиусу (только если включен)
  const radiusFilteredSpots = useMemo(() => {
    if (!location || !useRadiusFilter) return locationFilteredSpots;
    return filterSpotsByRadius(locationFilteredSpots, location, spotRadius);
  }, [locationFilteredSpots, location, spotRadius, useRadiusFilter]);

  // Добавляем расстояние
  const spotsWithDistance = useMemo(() => {
    return radiusFilteredSpots.map((spot) => addDistanceToSpot(spot, location || null));
  }, [radiusFilteredSpots, location]);

  // Фильтруем по поиску
  const filteredSpots = useMemo(() => {
    if (!searchQuery.trim()) return spotsWithDistance;
    const query = searchQuery.toLowerCase().trim();
    return spotsWithDistance.filter((spot: SpotWithForecast & { distance?: number }) => 
      spot.name.toLowerCase().includes(query)
    );
  }, [spotsWithDistance, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Уникальные страны и регионы
  const countries = useMemo(() => getUniqueCountries(allSpots), [allSpots]);
  const regions = useMemo(() => getUniqueRegions(allSpots, selectedCountry), [allSpots, selectedCountry]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Загрузка спотов...</Text>
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

  const levelLabel = getLevelLabel(skillLevel);
  const levelEmoji = getLevelEmoji(skillLevel);
  const showPersonalized = personalizedSpots && allSpots.length !== levelFilteredSpots.length;
  const showLocationFilter = selectedCountry !== null;
  const showRadiusFilter = location && useRadiusFilter;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>🏄 Все споты</Text>
        {showPersonalized && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>
              {levelEmoji} {levelLabel}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.subtitle}>
        {filteredSpots.length} {filteredSpots.length === 1 ? 'спот' : 'спотов'}
        {showPersonalized && ` (отфильтровано по уровню)`}
        {showLocationFilter && ` • ${selectedCountry}${selectedRegion ? `, ${selectedRegion}` : ''}`}
        {showRadiusFilter && ` • радиус ${spotRadius} км`}
        {!useRadiusFilter && location && ` • радиус не ограничен`}
      </Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по названию..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {filteredSpots.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🔍 Ничего не найдено</Text>
          <Text style={styles.emptySubText}>Попробуйте изменить фильтры</Text>
        </View>
      )}

      <FlatList
        data={filteredSpots}
        renderItem={({ item }) => <SpotCard spot={item} />}
        keyExtractor={(item: SpotWithForecast) => item.id.toString()}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  levelBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  levelBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 18,
    marginBottom: 4,
  },
  emptySubText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});