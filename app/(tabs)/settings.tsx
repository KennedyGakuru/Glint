import React from 'react';
import { ScrollView, View, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNewsStore } from '../../store/newsStore';
import { GlText } from '../../components/ui/GlText';
import { GlButton } from '../../components/ui/GlButton';
import { GlCard } from '../../components/ui/GlCard';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, updatePreferences } = useNewsStore();

  const fontSizes = [
    { key: 'small', label: 'Small' },
    { key: 'medium', label: 'Medium' },
    { key: 'large', label: 'Large' },
    { key: 'xl', label: 'Extra Large' },
  ] as const;

  const themes = [
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
    { key: 'system', label: 'System' },
  ] as const;

  return (
    <View className="flex-1 bg-bg-light dark:bg-bg-dark">
      <StatusBar style="auto" />
      <ScrollView
        style={{ paddingTop: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-6 pb-4">
          <View className="px-4 mb-6">
            <GlText variant="display" weight="bold">
              Settings
            </GlText>
            <GlText variant="body" color="muted" className="mt-1">
              Customize your reading experience
            </GlText>
          </View>

          <View className="px-4 space-y-4">
            <GlCard>
              <GlText variant="headline" weight="bold" className="mb-4">
                Appearance
              </GlText>
              
              <View className="mb-4">
                <GlText variant="title" className="mb-2">
                  Theme
                </GlText>
                <View className="flex-row flex-wrap">
                  {themes.map((theme) => (
                    <GlButton
                      key={theme.key}
                      variant={user.preferences.theme === theme.key ? 'primary' : 'secondary'}
                      size="sm"
                      onPress={() => updatePreferences({ theme: theme.key })}
                      className="mr-2 mb-2"
                    >
                      {theme.label}
                    </GlButton>
                  ))}
                </View>
              </View>

              <View>
                <GlText variant="title" className="mb-2">
                  Font Size
                </GlText>
                <View className="flex-row flex-wrap">
                  {fontSizes.map((size) => (
                    <GlButton
                      key={size.key}
                      variant={user.preferences.fontSize === size.key ? 'primary' : 'secondary'}
                      size="sm"
                      onPress={() => updatePreferences({ fontSize: size.key })}
                      className="mr-2 mb-2"
                    >
                      {size.label}
                    </GlButton>
                  ))}
                </View>
              </View>
            </GlCard>

            <GlCard>
              <GlText variant="headline" weight="bold" className="mb-4">
                Notifications
              </GlText>
              
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1 mr-4">
                  <GlText variant="title">Breaking News</GlText>
                  <GlText variant="body" color="muted">
                    Get notified about important breaking news
                  </GlText>
                </View>
                <Switch
                  value={user.preferences.notificationSettings.breaking}
                  onValueChange={(value) => 
                    updatePreferences({
                      notificationSettings: {
                        ...user.preferences.notificationSettings,
                        breaking: value
                      }
                    })
                  }
                  trackColor={{ false: '#d1d5db', true: '#2563eb' }}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <GlText variant="title">Daily Digest</GlText>
                  <GlText variant="body" color="muted">
                    Receive a summary of top stories each morning
                  </GlText>
                </View>
                <Switch
                  value={user.preferences.notificationSettings.digest}
                  onValueChange={(value) => 
                    updatePreferences({
                      notificationSettings: {
                        ...user.preferences.notificationSettings,
                        digest: value
                      }
                    })
                  }
                  trackColor={{ false: '#d1d5db', true: '#2563eb' }}
                />
              </View>
            </GlCard>

            <GlCard>
              <GlText variant="headline" weight="bold" className="mb-4">
                Downloads
              </GlText>
              
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1 mr-4">
                  <GlText variant="title">Wi-Fi Only</GlText>
                  <GlText variant="body" color="muted">
                    Only download articles when connected to Wi-Fi
                  </GlText>
                </View>
                <Switch
                  value={user.preferences.downloadSettings.wifiOnly}
                  onValueChange={(value) => 
                    updatePreferences({
                      downloadSettings: {
                        ...user.preferences.downloadSettings,
                        wifiOnly: value
                      }
                    })
                  }
                  trackColor={{ false: '#d1d5db', true: '#2563eb' }}
                />
              </View>

              <View>
                <GlText variant="title" className="mb-2">
                  Auto-remove after: {user.preferences.downloadSettings.autoRemoveAfter} days
                </GlText>
                <GlText variant="body" color="muted">
                  Automatically delete downloaded articles after this period
                </GlText>
              </View>
            </GlCard>

            <GlCard>
              <GlText variant="headline" weight="bold" className="mb-4">
                Privacy
              </GlText>
              
              <GlButton variant="secondary" className="mb-3">
                Clear Reading History
              </GlButton>
              <GlButton variant="secondary" className="mb-3">
                Reset Personalization
              </GlButton>
              <GlButton variant="secondary">
                Export Data
              </GlButton>
            </GlCard>

            <GlCard>
              <GlText variant="headline" weight="bold" className="mb-4">
                About
              </GlText>
              
              <View className="mb-3">
                <GlText variant="title">Glint News</GlText>
                <GlText variant="body" color="muted">Version 1.0.0</GlText>
              </View>
              
              <GlButton variant="ghost" className="self-start">
                Terms of Service
              </GlButton>
              <GlButton variant="ghost" className="self-start">
                Privacy Policy
              </GlButton>
              <GlButton variant="ghost" className="self-start">
                Open Source Licenses
              </GlButton>
            </GlCard>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}