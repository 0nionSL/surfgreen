import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../constants/Colors';
import { SpotWithForecast } from '../types';
import SpotCard from './SpotCard';

interface BottomSheetProps {
  spots: SpotWithForecast[];
}

const BottomSheet: React.FC<BottomSheetProps> = ({ spots }) => {
  const perfectSpots = spots.filter((spot) => spot.forecast.color === 'green');
  const topSpots = perfectSpots.slice(0, 5);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {perfectSpots.length} идеальных спотов рядом
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {topSpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '40%',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default BottomSheet; 