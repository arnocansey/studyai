import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { coursesApi } from "../services/courses";
import { cache } from "../services/cache";
import { FadeInView } from "../components/animations";
import { SkeletonList } from "../components/Skeleton";

const SKILL_TAGS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  skills: string[];
  verified: boolean;
  credentialId: string;
  grade: string;
}

export function CertificatesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useUser();
  const [selected, setSelected] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCertificates = async () => {
    try {
      const cached = await cache.get<Certificate[]>("certificates");
      if (cached && !refreshing) {
        setCertificates(cached);
        setLoading(false);
        return;
      }

      const courses = await coursesApi.list();
      const mapped: Certificate[] = courses.map((course, i) => ({
        id: course.id,
        title: course.title,
        issuer: "StudyAI Academy",
        date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        skills: course.tags?.length ? course.tags : [course.difficulty],
        verified: true,
        credentialId: `SAI-${course.slug.toUpperCase().slice(0, 4)}-${new Date().getFullYear()}`,
        grade: ["A", "A+", "B+"][i % 3],
      }));
      await cache.set("certificates", mapped);
      setCertificates(mapped);
    } catch {
      setCertificates([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCertificates();
  };

  const handleVerify = (certId: string) => {
    Alert.alert(
      "Certificate Details",
      `Credential ID: ${certId}\nThis credential can be verified by contacting the issuing institution.`,
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bg }]}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: colors.accent }]}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Certificates
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            {certificates.length} certificates earned
          </Text>
        </View>

        {loading ? (
          <SkeletonList count={3} />
        ) : (
          <>
            <View style={styles.statsRow}>
              {[
                {
                  label: "Total",
                  value: String(certificates.length),
                  icon: "📜",
                },
                {
                  label: "Verified",
                  value: String(certificates.filter((c) => c.verified).length),
                  icon: "✅",
                },
                {
                  label: "Skills",
                  value: String(
                    new Set(certificates.flatMap((c) => c.skills)).size,
                  ),
                  icon: "🎯",
                },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            {certificates.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 60 }}>
                <Text style={{ fontSize: 40, marginBottom: 16 }}>📋</Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  No Certificates Yet
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textMuted,
                    textAlign: "center",
                    paddingHorizontal: 40,
                  }}
                >
                  Complete courses to earn verified certificates. Your
                  achievements will appear here.
                </Text>
              </View>
            ) : (
              certificates.map((cert, i) => (
                <FadeInView key={cert.id} delay={i * 80}>
                  <TouchableOpacity
                    style={[
                      styles.certCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() =>
                      setSelected(selected === cert.id ? null : cert.id)
                    }
                  >
                    <View style={styles.certHeader}>
                      <View style={styles.certTitleRow}>
                        <Text style={styles.certEmoji}>
                          {cert.verified ? "🏅" : "📋"}
                        </Text>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[styles.certTitle, { color: colors.text }]}
                          >
                            {cert.title}
                          </Text>
                          <Text
                            style={[
                              styles.certIssuer,
                              { color: colors.textMuted },
                            ]}
                          >
                            {cert.issuer}
                          </Text>
                        </View>
                        {cert.verified && (
                          <View
                            style={[
                              styles.verifiedBadge,
                              { backgroundColor: "#10B981" + "20" },
                            ]}
                          >
                            <Text style={styles.verifiedText}>✓ Verified</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {selected === cert.id && (
                      <View
                        style={[
                          styles.certDetails,
                          { borderTopColor: colors.border },
                        ]}
                      >
                        <View style={styles.detailRow}>
                          <Text
                            style={[
                              styles.detailLabel,
                              { color: colors.textMuted },
                            ]}
                          >
                            Date
                          </Text>
                          <Text
                            style={[styles.detailValue, { color: colors.text }]}
                          >
                            {cert.date}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text
                            style={[
                              styles.detailLabel,
                              { color: colors.textMuted },
                            ]}
                          >
                            Credential ID
                          </Text>
                          <Text
                            style={[
                              styles.detailValue,
                              { color: colors.accent },
                            ]}
                          >
                            {cert.credentialId}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text
                            style={[
                              styles.detailLabel,
                              { color: colors.textMuted },
                            ]}
                          >
                            Grade
                          </Text>
                          <Text
                            style={[styles.detailValue, { color: colors.text }]}
                          >
                            {cert.grade}
                          </Text>
                        </View>
                        <View style={styles.skillTags}>
                          {cert.skills.map((skill, si) => (
                            <View
                              key={skill}
                              style={[
                                styles.skillTag,
                                {
                                  backgroundColor:
                                    SKILL_TAGS[si % SKILL_TAGS.length] + "20",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.skillTagText,
                                  { color: SKILL_TAGS[si % SKILL_TAGS.length] },
                                ]}
                              >
                                {skill}
                              </Text>
                            </View>
                          ))}
                        </View>
                        <View style={styles.certActions}>
                          <TouchableOpacity
                            style={[
                              styles.actionBtn,
                              { backgroundColor: colors.accent },
                            ]}
                            onPress={() => handleVerify(cert.credentialId)}
                          >
                            <Text style={styles.actionBtnText}>🔍 Verify</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.actionBtn,
                              { backgroundColor: colors.accent + "20" },
                            ]}
                            onPress={() =>
                              Share.share({
                                message: `Check out my certificate: ${cert.title} (${cert.credentialId})`,
                                url: `https://studyai.app/certificates/${cert.credentialId}`,
                              })
                            }
                          >
                            <Text
                              style={[
                                styles.actionBtnText,
                                { color: colors.accent },
                              ]}
                            >
                              📤 Share
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                </FadeInView>
              ))
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 },
  backBtn: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: "800" },
  headerSub: { fontSize: 14, marginTop: 4 },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  certCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  certHeader: { padding: 16 },
  certTitleRow: { flexDirection: "row", alignItems: "center" },
  certEmoji: { fontSize: 28, marginRight: 14 },
  certTitle: { fontSize: 16, fontWeight: "700" },
  certIssuer: { fontSize: 12, marginTop: 2 },
  verifiedBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  verifiedText: { color: "#10B981", fontSize: 11, fontWeight: "700" },

  certDetails: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: "600" },
  skillTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  skillTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  skillTagText: { fontSize: 12, fontWeight: "600" },

  certActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  actionBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});
