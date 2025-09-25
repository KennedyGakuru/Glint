import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { GlIcon } from '../../components/ui/GlIcon';
import { GlText } from '../../components/ui/GlText';
import { cn } from '../../lib/utils';

const tabIcons: Record<string, keyof typeof import('lucide-react-native')> = {
  index: 'Home',
  following: 'Heart',
  explore: 'Search',
  library: 'Bookmark',
  settings: 'Settings',
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // 🚨 Guard against undefined state/routes
  if (!state || !state.routes) {
    return null;
  }

  return (
    <View 
      className="bg-card-light dark:bg-card-dark border-t border-gray-200 dark:border-gray-800"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="flex-row">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key] || {};
          const label = options?.tabBarLabel ?? options?.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const iconName = tabIcons[route.name] || 'Circle';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="flex-1 items-center py-3"
              activeOpacity={0.7}
            >
              <GlIcon
                name={iconName}
                size={24}
                color={isFocused ? '#2563eb' : '#6b7280'}
              />
              <GlText
                variant="caption"
                className={cn(
                  'mt-1',
                  isFocused ? 'text-brand' : 'text-gray-600 dark:text-gray-400'
                )}
              >
                {typeof label === 'string' ? label : route.name}
              </GlText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
