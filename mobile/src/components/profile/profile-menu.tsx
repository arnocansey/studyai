import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ProfileMenuProps {
  colors: any;
  onNavigate: (screen: string) => void;
}

interface MenuItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  screen: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'certificates', icon: '🎓', title: 'Certificates', subtitle: '5 earned', color: '#10B981', screen: 'Certificates' },
  { id: 'skilltree', icon: '🌳', title: 'Skill Tree', subtitle: '10 skills tracked', color: '#8B5CF6', screen: 'SkillTree' },
  { id: 'analytics', icon: '📊', title: 'Analytics', subtitle: 'View your progress', color: '#F59E0B', screen: 'Analytics' },
  { id: 'settings', icon: '⚙️', title: 'Settings', subtitle: 'Account & preferences', color: '#6B7280', screen: 'Settings' },
];

export default function ProfileMenu({ colors, onNavigate }: ProfileMenuProps) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Access</Text>
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => onNavigate(item.screen)}
          accessibilityLabel={`${item.title}: ${item.subtitle}`}
          accessibilityRole="button"
        >
          <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
            <Text style={styles.menuIconText}>{item.icon}</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
          </View>
          <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, minHeight: 56,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  menuIconText: { fontSize: 18 },
  menuInfo: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600' },
  menuSubtitle: { fontSize: 12, marginTop: 2 },
  menuArrow: { fontSize: 20 },
});
