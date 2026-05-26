import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0c0c0c', borderTopColor: '#1a1a1a' },
        tabBarActiveTintColor: '#d4537e',
        tabBarInactiveTintColor: '#444',
      }}
    />
  );
}
