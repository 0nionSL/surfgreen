import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../constants/Colors';
import { useSettingsStore, SkillLevel, WaveUnit, WindUnit, Language } from '../store/settingsStore';
import { api } from '../services/api';
import { getUniqueCountries, getUniqueRegions } from '../utils/spotFilter';

export default function SettingsScreen() {
  const {
    skillLevel,
    personalizedSpots,
    waveUnit,
    windUnit,
    notifications,
    bestTimeAlerts,
    offlineMode,
    language,
    spotRadius,
    useRadiusFilter,
    selectedCountry,
    selectedRegion,
    setSkillLevel,
    setPersonalizedSpots,
    setWaveUnit,
    setWindUnit,
    setNotifications,
    setBestTimeAlerts,
    setOfflineMode,
    setLanguage,
    setSpotRadius,
    setUseRadiusFilter,
    setSelectedCountry,
    setSelectedRegion,
  } = useSettingsStore();

  const skillLevels: { label: string; value: SkillLevel; emoji: string; description: string }[] = [
    { label: 'Начинающий', value: 'beginner', emoji: '🏄‍♂️', description: 'Только учитесь, нужны небольшие волны' },
    { label: 'Средний', value: 'intermediate', emoji: '🏄‍♂️🌊', description: 'Уверенно стоите на доске, ищете волны среднего размера' },
    { label: 'Продвинутый', value: 'advanced', emoji: '🏄‍♂️🔥', description: 'Ищете большие волны и сложные условия' },
  ];

  const languages: { label: string; value: Language }[] = [
    { label: 'Русский', value: 'ru' },
    { label: 'English', value: 'en' },
  ];

  const radiusOptions = [10, 25, 50, 100];

  // Загружаем споты для получения списка стран и регионов
  const { data: allSpots = [] } = useQuery({
    queryKey: ['spots'],
    queryFn: async () => {
      const response = await api.get('/api/spots');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const countries = useMemo(() => getUniqueCountries(allSpots), [allSpots]);
  const regions = useMemo(() => getUniqueRegions(allSpots, selectedCountry), [allSpots, selectedCountry]);

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };

  const handleTelegram = () => {
    Linking.openURL('https://t.me/surfgreen');
  };

  const handleRate = () => {
    Alert.alert('Оценить', 'Скоро здесь будет ссылка на магазин');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Настройки' }} />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Секция: Профиль */}
        <Text style={styles.sectionTitle}>Профиль</Text>
        <View style={styles.section}>
          {skillLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.optionItem,
                skillLevel === level.value && styles.optionItemActive,
              ]}
              onPress={() => setSkillLevel(level.value)}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionEmoji}>{level.emoji}</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionText,
                    skillLevel === level.value && styles.optionTextActive,
                  ]}>
                    {level.label}
                  </Text>
                  <Text style={styles.optionDescription} numberOfLines={2}>
                    {level.description}
                  </Text>
                </View>
              </View>
              {skillLevel === level.value && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={styles.optionCheck} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Секция: Персонализация */}
        <Text style={styles.sectionTitle}>Персонализация</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="people-outline" size={22} color={colors.textMuted} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Подбирать споты по уровню</Text>
                <Text style={styles.settingDescription}>
                  При включении будут показываться только споты, подходящие для твоего уровня
                </Text>
              </View>
            </View>
            <Switch
              value={personalizedSpots}
              onValueChange={setPersonalizedSpots}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </View>

        {/* Секция: Единицы */}
        <Text style={styles.sectionTitle}>Единицы</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="water-outline" size={22} color={colors.textMuted} />
              <Text style={styles.settingLabel}>Высота волны</Text>
            </View>
            <View style={styles.unitGroup}>
              <TouchableOpacity
                style={[styles.unitButton, waveUnit === 'meters' && styles.unitButtonActive]}
                onPress={() => setWaveUnit('meters')}
              >
                <Text style={[styles.unitText, waveUnit === 'meters' && styles.unitTextActive]}>
                  м
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitButton, waveUnit === 'feet' && styles.unitButtonActive]}
                onPress={() => setWaveUnit('feet')}
              >
                <Text style={[styles.unitText, waveUnit === 'feet' && styles.unitTextActive]}>
                  ft
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="compass-outline" size={22} color={colors.textMuted} />
              <Text style={styles.settingLabel}>Скорость ветра</Text>
            </View>
            <View style={styles.unitGroup}>
              <TouchableOpacity
                style={[styles.unitButton, windUnit === 'knots' && styles.unitButtonActive]}
                onPress={() => setWindUnit('knots')}
              >
                <Text style={[styles.unitText, windUnit === 'knots' && styles.unitTextActive]}>
                  уз
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitButton, windUnit === 'kmh' && styles.unitButtonActive]}
                onPress={() => setWindUnit('kmh')}
              >
                <Text style={[styles.unitText, windUnit === 'kmh' && styles.unitTextActive]}>
                  км/ч
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Секция: Уведомления */}
        <Text style={styles.sectionTitle}>Уведомления</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={22} color={colors.textMuted} />
              <Text style={styles.settingLabel}>Push-уведомления</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="timer-outline" size={22} color={colors.textMuted} />
              <Text style={[styles.settingLabel, styles.settingLabelLong]}>
                Лучшее время для сёрфинга
              </Text>
            </View>
            <Switch
              value={bestTimeAlerts}
              onValueChange={setBestTimeAlerts}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </View>

        {/* Секция: Режим */}
        <Text style={styles.sectionTitle}>Режим</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="cloud-offline-outline" size={22} color={colors.textMuted} />
              <Text style={styles.settingLabel}>Офлайн-режим</Text>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="globe-outline" size={22} color={colors.textMuted} />
              <Text style={styles.settingLabel}>Язык</Text>
            </View>
            <View style={styles.languageGroup}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  style={[
                    styles.languageButton,
                    language === lang.value && styles.languageButtonActive,
                  ]}
                  onPress={() => setLanguage(lang.value)}
                >
                  <Text style={[
                    styles.languageText,
                    language === lang.value && styles.languageTextActive,
                  ]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Секция: Радиус поиска */}
        <Text style={styles.sectionTitle}>Радиус поиска</Text>
        <View style={styles.section}>
          {/* Переключатель фильтра по радиусу */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="filter-outline" size={22} color={colors.textMuted} />
              <Text style={styles.settingLabel}>Фильтр по радиусу</Text>
            </View>
            <Switch
              value={useRadiusFilter}
              onValueChange={setUseRadiusFilter}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          {/* Выбор радиуса (только если фильтр включен) */}
          {useRadiusFilter && (
            <View style={styles.radiusContainer}>
              {radiusOptions.map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusButton,
                    spotRadius === radius && styles.radiusButtonActive,
                  ]}
                  onPress={() => setSpotRadius(radius)}
                >
                  <Text style={[
                    styles.radiusText,
                    spotRadius === radius && styles.radiusTextActive,
                  ]}>
                    {radius} км
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Секция: Локация */}
        <Text style={styles.sectionTitle}>Локация</Text>
        <View style={styles.section}>
          {/* Выбор страны */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="flag-outline" size={22} color={colors.textMuted} />
              <Text style={styles.settingLabel}>Страна</Text>
            </View>
          </View>
          
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterChip, selectedCountry === null && styles.filterChipActive]}
              onPress={() => {
                setSelectedCountry(null);
                setSelectedRegion(null);
              }}
            >
              <Text style={[styles.filterChipText, selectedCountry === null && styles.filterChipTextActive]}>
                🌍 Все страны
              </Text>
            </TouchableOpacity>
            
            {countries.map((country) => (
              <TouchableOpacity
                key={country}
                style={[styles.filterChip, selectedCountry === country && styles.filterChipActive]}
                onPress={() => {
                  setSelectedCountry(country);
                  setSelectedRegion(null);
                }}
              >
                <Text style={[styles.filterChipText, selectedCountry === country && styles.filterChipTextActive]}>
                  {country}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Выбор региона (только если выбрана страна) */}
          {selectedCountry && regions.length > 0 && (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="location-outline" size={22} color={colors.textMuted} />
                  <Text style={styles.settingLabel}>Регион</Text>
                </View>
              </View>
              
              <View style={styles.filterContainer}>
                <TouchableOpacity
                  style={[styles.filterChip, selectedRegion === null && styles.filterChipActive]}
                  onPress={() => setSelectedRegion(null)}
                >
                  <Text style={[styles.filterChipText, selectedRegion === null && styles.filterChipTextActive]}>
                    Все регионы
                  </Text>
                </TouchableOpacity>
                
                {regions.map((region) => (
                  <TouchableOpacity
                    key={region}
                    style={[styles.filterChip, selectedRegion === region && styles.filterChipActive]}
                    onPress={() => setSelectedRegion(region)}
                  >
                    <Text style={[styles.filterChipText, selectedRegion === region && styles.filterChipTextActive]}>
                      {region}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Секция: О приложении */}
        <Text style={styles.sectionTitle}>О приложении</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={22} color={colors.textMuted} />
              <Text style={styles.settingLabel}>Версия</Text>
            </View>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleTelegram}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
            <Text style={styles.actionText}>Telegram-канал</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleRate}>
            <Ionicons name="star-outline" size={22} color={colors.text} />
            <Text style={styles.actionText}>Оценить приложение</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={colors.dangerZone} />
            <Text style={styles.logoutText}>Выйти</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  optionItemActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  optionTextActive: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    flexShrink: 1,
  },
  optionCheck: {
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    flexShrink: 1,
  },
  settingLabelLong: {
    fontSize: 15,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  unitGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 2,
  },
  unitButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unitButtonActive: {
    backgroundColor: colors.primary,
  },
  unitText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  unitTextActive: {
    color: colors.background,
  },
  languageGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  languageButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  languageText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  languageTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  radiusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  radiusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  radiusButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  radiusText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  radiusTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    color: colors.dangerZone,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
});