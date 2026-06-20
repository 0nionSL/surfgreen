import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useStore } from '../../store/useStore';
import SpotCard from '../../components/SpotCard';
import { colors } from '../../constants/Colors';

export default function TwoScreen() {
  const { spotsWithForecast } = useStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Все споты</Text>
      <FlatList
        data={spotsWithForecast}
        renderItem={({ item }) => <SpotCard spot={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
});