import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLifeStore } from '@/store/useLifeStore';

// Reads the zustand persist hydration state so we never redirect before
// AsyncStorage has finished rehydrating — avoids a flash to /onboarding
// on every cold launch for returning users.
export default function Index() {
  const [hydrated, setHydrated] = useState(
    () => useLifeStore.persist.hasHydrated(),
  );
  const hasCompletedQuiz = useLifeStore((s) => s.hasCompletedQuiz);

  useEffect(() => {
    if (hydrated) return;
    return useLifeStore.persist.onFinishHydration(() => setHydrated(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Black screen while store rehydrates — identical to background colour so there's no flash.
  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: '#0c0c0c' }} />;
  }

  return <Redirect href={hasCompletedQuiz ? '/(tabs)' : '/onboarding'} />;
}
