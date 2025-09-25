import React, { useState } from "react";
import { ScrollView, View, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GlText } from "../../components/ui/GlText";
import { GlIcon } from "../../components/ui/GlIcon";
import { useTheme } from "../../contexts/ThemeContext";
import { router } from 'expo-router'; 

import { StackNavigationProp } from "@react-navigation/stack";

type FollowingScreenProps = {
  navigation: StackNavigationProp<any>;
};

export default function FollowingScreen({ navigation }: FollowingScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const theme = useTheme(); 

  const MENU_ITEMS = [
  { icon: "Puzzle", label: "Puzzles", screen: "puzzles" },
  { icon: "Utensils", label: "Food", screen: "food" },
  { icon: "BookOpen", label: "Saved Recipes", screen: "saved-recipes" },
  { icon: "Bookmark", label: "Saved Stories", screen: "saved-stories" },
  { icon: "Clock", label: "History", screen: "history" },
];


  const MENU_LINKS = [
    "Special Coverage",
    "My Sports", 
    "Channels & Topics",
    "Suggested by Glint",
    "Manage",
  ];

  const handleMenuItemPress = (screenName: string) => {
    router.push(`/following/${screenName}`);
  };

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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
      }}>
        <View>
          <GlText style={{
            fontSize: theme.typography.sizes.largeTitle,
            fontWeight: theme.typography.weights.black,
            color: theme.colors.text.primary,
          }}>
            Glint
          </GlText>
          <GlText style={{
            fontSize: theme.typography.sizes.title1,
            fontWeight: theme.typography.weights.regular,
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.xs,
          }}>
            Following
          </GlText>
        </View>
        <TouchableOpacity>
          <GlText style={{
            fontSize: theme.typography.sizes.body,
            color: theme.colors.brand.accent,
          }}>
            Edit
          </GlText>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={{
        paddingHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing['2xl'],
      }}>
        <View style={{
          backgroundColor: theme.colors.backgrounds.secondary,
          borderRadius: theme.borderRadius.lg,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        }}>
          <GlIcon 
            name="Search" 
            size={20} 
            color={theme.colors.text.tertiary} 
          />
          <TextInput
            placeholder="Channels, Topics & Stories"
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: theme.spacing.md,
              fontSize: theme.typography.sizes.body,
              color: theme.colors.text.primary,
            }}
          />
        </View>
      </View>

      {/* Menu Items */}
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        {MENU_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleMenuItemPress(item.screen)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: theme.spacing.lg,
              borderBottomWidth: idx < MENU_ITEMS.length - 1 ? 0.5 : 0,
              borderBottomColor: theme.colors.semantic.separator,
            }}
          >
            <GlIcon 
              name={item.icon} 
              size={24} 
              color={theme.colors.brand.primary} 
            />
            <GlText style={{
              marginLeft: theme.spacing.lg,
              fontSize: theme.typography.sizes.body,
              color: theme.colors.text.primary,
            }}>
              {item.label}
            </GlText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Links */}
      <View style={{ 
        paddingHorizontal: theme.spacing.xl,
        marginTop: theme.spacing['2xl'] 
      }}>
        {MENU_LINKS.map((label, idx) => (
          <TouchableOpacity
            key={idx}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: theme.spacing.lg,
              borderBottomWidth: idx < MENU_LINKS.length - 1 ? 0.5 : 0,
              borderBottomColor: theme.colors.semantic.separator,
            }}
          >
            <GlText style={{
              fontSize: theme.typography.sizes.body,
              color: theme.colors.text.primary,
            }}>
              {label}
            </GlText>
            <GlIcon 
              name="ChevronRight" 
              size={16} 
              color={theme.colors.text.tertiary} 
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}