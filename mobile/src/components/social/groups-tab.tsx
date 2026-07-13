import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { studyGroupsApi } from '../../services/studyGroups';
import { cache } from '../../services/cache';
import { SkeletonList } from '../Skeleton';

interface StudyGroup {
  id: string;
  name: string;
  members: number;
  maxMembers: number;
  topic: string;
  nextSession: string;
  joined: boolean;
  color: string;
}

interface Props {
  colors: any;
}

const STUDY_GROUPS: StudyGroup[] = [
  { id: '1', name: 'Python Warriors', members: 18, maxMembers: 25, topic: 'Advanced Python & Data Science', nextSession: 'Today, 3 PM', joined: true, color: '#3B82F6' },
  { id: '2', name: 'Network Masters', members: 12, maxMembers: 20, topic: 'CCNA Preparation', nextSession: 'Tomorrow, 5 PM', joined: true, color: '#10B981' },
  { id: '3', name: 'Cyber Defenders', members: 8, maxMembers: 15, topic: 'Ethical Hacking & CTF', nextSession: 'Wed, 4 PM', joined: false, color: '#EF4444' },
  { id: '4', name: 'Cloud Architects', members: 15, maxMembers: 20, topic: 'AWS Solutions Architect', nextSession: 'Thu, 6 PM', joined: false, color: '#F59E0B' },
  { id: '5', name: 'Linux Legends', members: 10, maxMembers: 20, topic: 'Shell Scripting & DevOps', nextSession: 'Fri, 2 PM', joined: false, color: '#8B5CF6' },
];

export default function GroupsTab({ colors }: Props) {
  const [groups, setGroups] = useState(STUDY_GROUPS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const apiGroups = await studyGroupsApi.list();
      if (apiGroups.length > 0) {
        setGroups(apiGroups.map((g) => ({
          id: g.id, name: g.name, members: g.memberCount, maxMembers: g.maxMembers,
          topic: g.topic, nextSession: 'Scheduled', joined: false, color: '#3B82F6',
        })));
      }
    } catch {
      const cached = await cache.get<StudyGroup[]>('study_groups');
      if (cached) setGroups(cached);
    }
    setLoading(false);
  };

  return (
    <>
      {loading && <SkeletonList count={3} />}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>My Groups</Text>
      {groups.filter((g) => g.joined).map((group) => (
        <View key={group.id} style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.accent + '30' }]}>
          <View style={[styles.groupColorBar, { backgroundColor: group.color }]} />
          <View style={styles.groupContent}>
            <View style={styles.groupHeader}>
              <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
              <View style={[styles.groupBadge, { backgroundColor: '#10B98120' }]}>
                <Text style={[styles.groupBadgeText, { color: '#10B981' }]}>Joined</Text>
              </View>
            </View>
            <Text style={[styles.groupTopic, { color: colors.textSecondary }]}>{group.topic}</Text>
            <View style={styles.groupFooter}>
              <Text style={[styles.groupMembers, { color: colors.textMuted }]}>👥 {group.members}/{group.maxMembers}</Text>
              <Text style={[styles.groupSession, { color: colors.accent }]}>📅 {group.nextSession}</Text>
            </View>
            <TouchableOpacity style={[styles.groupJoinBtn, { borderColor: '#374151' }]}>
              <Text style={[styles.groupJoinBtnText, { color: colors.textSecondary }]}>Open Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Discover</Text>
      {groups.filter((g) => !g.joined).map((group) => (
        <View key={group.id} style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.groupColorBar, { backgroundColor: group.color }]} />
          <View style={styles.groupContent}>
            <View style={styles.groupHeader}>
              <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
              <Text style={[styles.groupMembers, { color: colors.textMuted }]}>👥 {group.members}/{group.maxMembers}</Text>
            </View>
            <Text style={[styles.groupTopic, { color: colors.textSecondary }]}>{group.topic}</Text>
            <Text style={[styles.groupSession, { color: colors.accent }]}>📅 Next: {group.nextSession}</Text>
            <TouchableOpacity style={[styles.groupJoinBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
              <Text style={[styles.groupJoinBtnText, { color: colors.text }]}>Join Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 0.5, paddingHorizontal: 16, marginTop: 8, marginBottom: 10,
  },
  groupCard: {
    flexDirection: 'row', borderRadius: 14, marginHorizontal: 16, marginBottom: 12,
    borderWidth: 1, overflow: 'hidden',
  },
  groupColorBar: { width: 4 },
  groupContent: { flex: 1, padding: 16 },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  groupName: { fontSize: 16, fontWeight: '700', flex: 1 },
  groupBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  groupBadgeText: { fontSize: 10, fontWeight: '700' },
  groupTopic: { fontSize: 13, marginTop: 6 },
  groupFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  groupMembers: { fontSize: 12 },
  groupSession: { fontSize: 12 },
  groupJoinBtn: {
    marginTop: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center',
  },
  groupJoinBtnText: { fontSize: 13, fontWeight: '600' },
});
