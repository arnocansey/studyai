import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { isAvailable as biometricsAvailable } from '../services/biometrics';

interface SettingSection {
  title: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  icon: string;
  label: string;
  type: 'toggle' | 'nav' | 'action';
  value?: boolean;
  subtitle?: string;
  color?: string;
}

export function SettingsScreen({ navigation }: any) {
  const { isDark, toggleTheme, colors } = useTheme();
  const { user, logout } = useUser();
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricsReady, setBiometricsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const available = await biometricsAvailable();
      setBiometricsReady(available);
      const stored = await AsyncStorage.getItem('studyai_biometric_enabled');
      if (stored === 'true' && available) setBiometricEnabled(true);

      const notif = await AsyncStorage.getItem('studyai_notifications');
      if (notif !== null) setNotifications(notif === 'true');
      const sound = await AsyncStorage.getItem('studyai_sound');
      if (sound !== null) setSoundEnabled(sound === 'true');
      const digest = await AsyncStorage.getItem('studyai_email_digest');
      if (digest !== null) setEmailDigest(digest === 'true');
      const play = await AsyncStorage.getItem('studyai_autoplay');
      if (play !== null) setAutoPlay(play === 'true');
    })();
  }, []);

  const sections: SettingSection[] = [
    {
      title: 'Appearance',
      items: [
        { id: 'theme', icon: isDark ? '🌙' : '☀️', label: 'Dark Mode', type: 'toggle', value: isDark },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { id: 'push', icon: '🔔', label: 'Push Notifications', type: 'toggle', value: notifications },
        { id: 'sound', icon: '🔊', label: 'Notification Sound', type: 'toggle', value: soundEnabled },
        { id: 'email', icon: '📧', label: 'Email Digest', type: 'toggle', value: emailDigest, subtitle: 'Weekly summary' },
      ],
    },
    {
      title: 'Playback',
      items: [
        { id: 'autoplay', icon: '▶️', label: 'Auto-play Videos', type: 'toggle', value: autoPlay },
      ],
    },
    {
      title: 'Security',
      items: [
        { id: 'biometric', icon: '🔐', label: 'Biometric Login', type: 'toggle', value: biometricEnabled, subtitle: biometricsReady ? 'Available on this device' : 'Not available on this device' },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: 'edit', icon: '✏️', label: 'Edit Profile', type: 'nav', subtitle: user.name },
        { id: 'password', icon: '🔒', label: 'Change Password', type: 'nav' },
        { id: 'email_pref', icon: '📬', label: 'Email Preferences', type: 'nav' },
        { id: 'linked', icon: '🔗', label: 'Linked Accounts', type: 'nav', subtitle: 'Google, GitHub' },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        { id: 'export', icon: '📦', label: 'Export Data', type: 'action' },
        { id: 'privacy', icon: '🛡️', label: 'Privacy Policy', type: 'nav' },
        { id: 'terms', icon: '📄', label: 'Terms of Service', type: 'nav' },
      ],
    },
    {
      title: 'Support',
      items: [
        { id: 'help', icon: '❓', label: 'Help Center', type: 'nav' },
        { id: 'feedback', icon: '💬', label: 'Send Feedback', type: 'action' },
        { id: 'rate', icon: '⭐', label: 'Rate StudyAI', type: 'action' },
      ],
    },
  ];

  const handleToggle = (id: string, value: boolean) => {
    switch (id) {
      case 'theme': toggleTheme(); break;
      case 'push':
        setNotifications(value);
        AsyncStorage.setItem('studyai_notifications', String(value));
        break;
      case 'sound':
        setSoundEnabled(value);
        AsyncStorage.setItem('studyai_sound', String(value));
        break;
      case 'email':
        setEmailDigest(value);
        AsyncStorage.setItem('studyai_email_digest', String(value));
        break;
      case 'autoplay':
        setAutoPlay(value);
        AsyncStorage.setItem('studyai_autoplay', String(value));
        break;
      case 'biometric':
        setBiometricEnabled(value);
        AsyncStorage.setItem('studyai_biometric_enabled', String(value));
        break;
    }
  };

  const handleAction = (id: string) => {
    switch (id) {
      case 'export':
        Alert.alert('Export Data', 'Your data export has been sent to your email.');
        break;
      case 'feedback':
        Linking.openURL('mailto:support@studyai.app?subject=Feedback');
        break;
      case 'rate':
        Linking.openURL('https://play.google.com/store/apps/details?id=com.studyai.app');
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: colors.accent }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        </View>

        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.userAvatar}>{user.avatar}</Text>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
            <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user.email}</Text>
          </View>
          <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.accent + '20' }]}>
            <Text style={[styles.editBtnText, { color: colors.accent }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        {sections.map((section) => (
          <View key={section.title} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{section.title}</Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.settingRow, { borderBottomColor: colors.border }]}
                onPress={() => {
                  if (item.type === 'toggle') return;
                  if (item.type === 'action') { handleAction(item.id); return; }
                }}
                disabled={item.type === 'toggle'}
              >
                <Text style={styles.settingIcon}>{item.icon}</Text>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                  {item.subtitle && <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>}
                </View>
                {item.type === 'toggle' && (
                  <Switch
                    value={item.value}
                    onValueChange={(v) => handleToggle(item.id, v)}
                    trackColor={{ false: '#374151', true: colors.accent }}
                    thumbColor="#FFFFFF"
                    disabled={item.id === 'biometric' && !biometricsReady}
                  />
                )}
                {item.type === 'nav' && <Text style={[styles.navArrow, { color: colors.textMuted }]}>›</Text>}
                {item.type === 'action' && <Text style={[styles.navArrow, { color: colors.textMuted }]}>›</Text>}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.section, { backgroundColor: '#1F1010', borderColor: '#7F1D1D' }]}
          onPress={() => {
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); } },
            ]);
          }}
        >
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.settingIcon, { fontSize: 20 }]}>🚪</Text>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Sign Out</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Version */}
        <Text style={[styles.version, { color: colors.textMuted }]}>StudyAI v1.0.0 (Expo 54)</Text>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  backBtn: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '800' },

  userCard: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16,
    padding: 18, borderRadius: 16, borderWidth: 1,
  },
  userAvatar: { fontSize: 40, marginRight: 14 },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '700' },
  userEmail: { fontSize: 13, marginTop: 2 },
  editBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  editBtnText: { fontSize: 13, fontWeight: '600' },

  section: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingIcon: { fontSize: 20, marginRight: 14 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingSubtitle: { fontSize: 12, marginTop: 2 },
  navArrow: { fontSize: 20 },

  version: { textAlign: 'center', fontSize: 12, marginTop: 20 },
});
