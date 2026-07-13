import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import ProfileCard from '../components/profile/profile-card';
import WeeklyProgress from '../components/profile/weekly-progress';
import ActivityFeed from '../components/profile/activity-feed';
import EditProfileModal from '../components/profile/edit-profile-modal';
import ProfileMenu from '../components/profile/profile-menu';

export function ProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { logout } = useUser();
  const [editModal, setEditModal] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity
            onPress={() => setEditModal(true)}
            style={styles.editBtnTouchable}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
          >
            <Text style={[styles.editBtn, { color: colors.accent }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ProfileCard colors={colors} onEditPress={() => setEditModal(true)} />
        <WeeklyProgress colors={colors} />
        <ActivityFeed colors={colors} />
        <ProfileMenu colors={colors} onNavigate={(screen: string) => navigation.navigate(screen)} />

        <TouchableOpacity
          style={[styles.signOutBtn, { borderColor: '#7F1D1D' }]}
          onPress={handleSignOut}
          accessibilityLabel="Sign out of your account"
          accessibilityRole="button"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      <EditProfileModal colors={colors} visible={editModal} onClose={() => setEditModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15,
  },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  editBtnTouchable: { paddingVertical: 8, paddingHorizontal: 12, minWidth: 44, minHeight: 44, justifyContent: 'center' },
  editBtn: { fontSize: 16, fontWeight: '600' },
  signOutBtn: {
    marginHorizontal: 16, marginTop: 20, paddingVertical: 16, borderRadius: 14,
    backgroundColor: '#1F1010', borderWidth: 1, alignItems: 'center', minHeight: 52, justifyContent: 'center',
  },
  signOutText: { fontSize: 16, fontWeight: '600', color: '#EF4444' },
});
