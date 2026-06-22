import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors } from '../constants/Colors';

// React Query — без кэширования
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // 👈 Всегда свежие данные
      gcTime: 0,    // 👈 Не хранить в кэше
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
          animation: 'none',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="spot/[id]" options={{ 
          title: 'Детали спота',
          animation: 'none',
        }} />
      </Stack>
    </QueryClientProvider>
  );
}