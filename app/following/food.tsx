import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GlText } from '../../components/ui/GlText';
import { useTheme } from '../../contexts/ThemeContext';

export default function FoodScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ScrollView
      style={{ 
        flex: 1, 
        backgroundColor: theme.colors.backgrounds.primary 
      }}
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <StatusBar style={theme.isDarkMode ? "light" : "dark"} />
      
      {/* Header */}
      <View style={{
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.semantic.separator,
      }}>
        <GlText style={{
          fontSize: theme.typography.sizes.largeTitle,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.text.primary,
        }}>
          Food
        </GlText>
        <GlText style={{
          fontSize: theme.typography.sizes.subheadline,
          color: theme.colors.text.secondary,
          marginTop: theme.spacing.xs,
        }}>
          Food news and recipes
        </GlText>
      </View>

      {/* Content */}
      <View style={{ padding: theme.spacing.xl }}>
        <View style={{
          alignItems: 'center',
          paddingVertical: theme.spacing['4xl'],
        }}>
          <GlText style={{
            fontSize: theme.typography.sizes.title3,
            fontWeight: theme.typography.weights.medium,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            marginBottom: theme.spacing.md,
          }}>
            Food Content Coming Soon
          </GlText>
          <GlText style={{
            fontSize: theme.typography.sizes.subheadline,
            color: theme.colors.text.tertiary,
            textAlign: 'center',
          }}>
            Discover the latest food news and recipes
          </GlText>
        </View>
      </View>
    </ScrollView>
  );
}