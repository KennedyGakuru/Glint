import { Tabs } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { GlIcon } from '../../components/ui/GlIcon';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.text.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.backgrounds.secondary,
          borderTopColor: theme.colors.borders.light,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.body.fontSize,
          fontFamily: theme.typography.body.fontFamily,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <GlIcon name="Newspaper" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="following"
        options={{
          title: 'Following',
          tabBarIcon: ({ color, size }) => (
            <GlIcon name="Heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sports"
        options={{
          title: 'Sports',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="football" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <GlIcon name="Settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
