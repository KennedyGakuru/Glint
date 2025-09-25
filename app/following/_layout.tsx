import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export default function FollowingLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.backgrounds.primary,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="history" 
        options={{ 
          title: 'History',
          headerBackTitle: 'Following'
        }} 
      />
      <Stack.Screen 
        name="saved-stories" 
        options={{ 
          title: 'Saved Stories',
          headerBackTitle: 'Following'
        }} 
      />
      <Stack.Screen 
        name="saved-recipes" 
        options={{ 
          title: 'Saved Recipes',
          headerBackTitle: 'Following'
        }} 
      />
      <Stack.Screen 
        name="food" 
        options={{ 
          title: 'Food',
          headerBackTitle: 'Following'
        }} 
      />
      <Stack.Screen 
        name="puzzles" 
        options={{ 
          title: 'Puzzles',
          headerBackTitle: 'Following'
        }} 
      />
    </Stack>
  );
}