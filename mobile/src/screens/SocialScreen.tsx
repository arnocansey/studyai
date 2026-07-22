import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { Badge, Button, Input } from "../components/ui";
import GroupsTab from "../components/social/groups-tab";
import TutorsTab from "../components/social/tutors-tab";
import FeedTab from "../components/social/feed-tab";

export function SocialScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<"groups" | "tutors" | "feed">(
    "groups",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View style={styles.header}>
        <View>
          <Badge variant="secondary" style={{ marginBottom: 6 }}>
            👥 Community
          </Badge>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Community
          </Text>
        </View>
        <Button
          size="sm"
          onPress={() => {}}
          accessibilityLabel="Create group or post"
        >
          + Create
        </Button>
      </View>

      <View style={styles.searchWrapper}>
        <Input
          style={styles.searchInput}
          placeholder={
            activeTab === "tutors" ? "Search tutors..." : "Search groups..."
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
        {(["groups", "tutors", "feed"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              setActiveTab(tab);
              setSearchQuery("");
            }}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.mutedForeground },
                activeTab === tab && { color: colors.foreground },
              ]}
            >
              {tab === "groups"
                ? "Groups"
                : tab === "tutors"
                  ? "Tutors"
                  : "Feed"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {activeTab === "groups" && <GroupsTab colors={colors} />}
        {activeTab === "tutors" && (
          <TutorsTab colors={colors} searchQuery={searchQuery} />
        )}
        {activeTab === "feed" && <FeedTab colors={colors} />}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: "800" },
  searchWrapper: { marginHorizontal: 16, marginBottom: 12 },
  searchInput: { paddingVertical: 12, fontSize: 14 },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabText: { fontSize: 13, fontWeight: "600" },
  content: { flex: 1 },
});
