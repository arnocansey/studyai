import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import GroupsTab from '../components/social/groups-tab';
import TutorsTab from '../components/social/tutors-tab';
import FeedTab from '../components/social/feed-tab';

export function SocialScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'groups' | 'tutors' | 'feed'>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Community</Text>
        <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.accent }]}>
          <Text style={[styles.createBtnText, { color: colors.text }]}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={activeTab === 'tutors' ? 'Search tutors...' : 'Search groups...'}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
        {(['groups', 'tutors', 'feed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => { setActiveTab(tab); setSearchQuery(''); }}
            style={[styles.tab, activeTab === tab && { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === tab && { color: colors.text }]}>
              {tab === 'groups' ? 'Groups' : tab === 'tutors' ? 'Tutors' : 'Feed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {activeTab === 'groups' && <GroupsTab colors={colors} />}
        {activeTab === 'tutors' && <TutorsTab colors={colors} searchQuery={searchQuery} />}
        {activeTab === 'feed' && <FeedTab colors={colors} />}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  createBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  createBtnText: { fontSize: 14, fontWeight: '700' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, paddingHorizontal: 14, borderWidth: 1,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14 },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabText: { fontSize: 13, fontWeight: '600' },
  content: { flex: 1 },
});
