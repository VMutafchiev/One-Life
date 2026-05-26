import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { SymbolView, type SFSymbol } from 'expo-symbols';

function TabIcon({ name, focused, color }: { name: SFSymbol; focused: boolean; color: string }) {
  const iconName = (focused ? `${name}.fill` : name) as SFSymbol;
  return (
    <SymbolView
      name={iconName}
      style={{ width: 22, height: 22 }}
      type="monochrome"
      tintColor={color}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0c0c0c',
          borderTopWidth: 0.5,
          borderTopColor: '#1a1a1a',
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 60 : 56,
        },
        tabBarActiveTintColor: '#d4537e',
        tabBarInactiveTintColor: '#333',
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clock',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="clock" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Earn Time',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="flame" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wisdom"
        options={{
          title: 'Wisdom',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="book" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
