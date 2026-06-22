import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapViewLib from 'react-native-maps';
import { useStore } from '../../store/useStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useLocation } from '../../hooks/useLocation';
import { filterSpots } from '../../utils/spotFilter';
import MapView from '../../components/MapView';
import BottomSheet from '../../components/BottomSheet';
import { colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { fetchSpotsWithForecast } from '../../services/spots';
import { useQuery } from '@tanstack/react-query';

export default function MapScreen() {
  const { setSelectedSpot } = useStore();
  const { 
    skillLevel, 
    personalizedSpots, 
    spotRadius,
    useRadiusFilter,
    selectedCountry,
    selectedRegion,
  } = useSettingsStore();
  const { location, loading: locationLoading } = useLocation();
  const mapRef = useRef<MapViewLib>(null);
  const [showRadius, setShowRadius] = useState(false);

  const { 
    data: spots = [], 
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

  console.log('🔵 Spots from query:', spots.length);

  const filteredSpots = useMemo(() => {
    return filterSpots(
      spots,
      skillLevel,
      personalizedSpots,
      location,
      spotRadius,
      selectedCountry,
      selectedRegion,
      useRadiusFilter
    );
  }, [spots, skillLevel, personalizedSpots, location, spotRadius, selectedCountry, selectedRegion, useRadiusFilter]);

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });
    }
  };

  if (isLoading || locationLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {locationLoading ? 'Определяем местоположение...' : 'Загрузка волн...'}
        </Text>
      </View>
    );
  }

  if (error) {
    console.error('❌ Query error:', error);
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

  const spotsCount = filteredSpots.length;
  const totalSpots = spots.length;
  const filteredByRadius = location && useRadiusFilter && spotsCount < totalSpots;
  const locationFilterActive = selectedCountry !== null;

  return (
    <View style={styles.container}>
      <MapView 
        ref={mapRef}
        spots={filteredSpots} 
        userLocation={location}
        showRadius={showRadius}
        radiusKm={spotRadius}
      />
      
      {location && (
        <TouchableOpacity style={styles.locationButton} onPress={centerOnUser}>
          <Ionicons name="locate" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      
      {location && useRadiusFilter && (
        <TouchableOpacity 
          style={[styles.radiusButton, showRadius && styles.radiusButtonActive]} 
          onPress={() => setShowRadius(!showRadius)}
        >
          <Ionicons name="radio" size={24} color={showRadius ? colors.primary : colors.text} />
        </TouchableOpacity>
      )}
      
      {(filteredByRadius || locationFilterActive) && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterInfoText}>
            {locationFilterActive && `📍 ${selectedCountry}${selectedRegion ? `, ${selectedRegion}` : ''}`}
            {filteredByRadius && ` • ${spotsCount} спотов в радиусе ${spotRadius} км`}
            {!filteredByRadius && locationFilterActive && ` • ${spotsCount} спотов`}
          </Text>
        </View>
      )}
      
      <BottomSheet 
        spots={filteredSpots} 
        userLocation={location}
        isLoading={isLoading}
      />
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
    padding: 20,
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
  locationButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 40,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  radiusButton: {
    position: 'absolute',
    top: 120,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 40,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  radiusButtonActive: {
    borderColor: colors.primary,
  },
  filterInfo: {
    position: 'absolute',
    top: 180,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(11, 19, 43, 0.9)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterInfoText: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
  },
});