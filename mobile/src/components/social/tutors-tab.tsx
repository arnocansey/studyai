import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Tutor {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  reviews: number;
  hourlyRate: string;
  available: boolean;
}

interface Props {
  colors: any;
  searchQuery: string;
}

const TUTORS: Tutor[] = [
  { id: '1', name: 'Sarah Chen', avatar: '👩‍💻', specialty: 'Python & Machine Learning', rating: 4.9, reviews: 128, hourlyRate: '$25', available: true },
  { id: '2', name: 'Marcus Lee', avatar: '👨‍🎓', specialty: 'Networking & Security', rating: 4.8, reviews: 96, hourlyRate: '$30', available: true },
  { id: '3', name: 'Emily Park', avatar: '👩‍🔬', specialty: 'Cloud & DevOps', rating: 4.7, reviews: 74, hourlyRate: '$28', available: false },
  { id: '4', name: 'David Kim', avatar: '👨‍💼', specialty: 'Linux & Systems', rating: 4.9, reviews: 112, hourlyRate: '$22', available: true },
];

export default function TutorsTab({ colors, searchQuery }: Props) {
  const filteredTutors = TUTORS.filter(
    (t) => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {filteredTutors.map((tutor) => (
        <View key={tutor.id} style={[styles.tutorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.tutorHeader}>
            <Text style={styles.tutorAvatar}>{tutor.avatar}</Text>
            <View style={styles.tutorInfo}>
              <Text style={[styles.tutorName, { color: colors.text }]}>{tutor.name}</Text>
              <Text style={[styles.tutorSpecialty, { color: colors.textSecondary }]}>{tutor.specialty}</Text>
            </View>
            <View style={[styles.tutorStatus, tutor.available && { backgroundColor: '#10B98120' }, !tutor.available && { backgroundColor: '#374151' }]}>
              <Text style={[styles.tutorStatusText, tutor.available && { color: '#10B981' }, !tutor.available && { color: colors.textMuted }]}>
                {tutor.available ? 'Available' : 'Busy'}
              </Text>
            </View>
          </View>

          <View style={[styles.tutorStats, { borderTopColor: colors.border }]}>
            <View style={styles.tutorStat}>
              <Text style={[styles.tutorStatValue, { color: colors.text }]}>⭐ {tutor.rating}</Text>
              <Text style={[styles.tutorStatLabel, { color: colors.textMuted }]}>{tutor.reviews} reviews</Text>
            </View>
            <View style={styles.tutorStat}>
              <Text style={[styles.tutorStatValue, { color: colors.text }]}>{tutor.hourlyRate}</Text>
              <Text style={[styles.tutorStatLabel, { color: colors.textMuted }]}>per hour</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.tutorBtn, { backgroundColor: colors.accent }]} disabled={!tutor.available}>
            <Text style={[styles.tutorBtnText, { color: colors.text }, !tutor.available && { color: colors.textMuted }]}>
              {tutor.available ? 'Book Session' : 'Not Available'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  tutorCard: {
    borderRadius: 14, marginHorizontal: 16, marginBottom: 12, padding: 18,
    borderWidth: 1,
  },
  tutorHeader: { flexDirection: 'row', alignItems: 'center' },
  tutorAvatar: { fontSize: 40, marginRight: 14 },
  tutorInfo: { flex: 1 },
  tutorName: { fontSize: 16, fontWeight: '700' },
  tutorSpecialty: { fontSize: 13, marginTop: 2 },
  tutorStatus: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tutorStatusText: { fontSize: 11, fontWeight: '600' },
  tutorStats: {
    flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, paddingTop: 16,
    borderTopWidth: 1,
  },
  tutorStat: { alignItems: 'center' },
  tutorStatValue: { fontSize: 16, fontWeight: '700' },
  tutorStatLabel: { fontSize: 11, marginTop: 4 },
  tutorBtn: {
    marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
  tutorBtnText: { fontSize: 14, fontWeight: '700' },
});
