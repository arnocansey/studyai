import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

// Providers
import { UserProvider, useUser } from "./src/context/UserContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { UpdateProvider } from "./src/components/UpdateManager";

// Services
import { notificationsApi } from "./src/services/notifications";
import { chatService } from "./src/services/chat";

// Components
import { ErrorBoundary } from "./src/components/ErrorBoundary";

// Screens
import { LoginScreen } from "./src/screens/LoginScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { GamificationScreen } from "./src/screens/GamificationScreen";
import { SocialScreen } from "./src/screens/SocialScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ChallengesScreen } from "./src/screens/ChallengesScreen";
import { VideoCallScreen } from "./src/screens/VideoCallScreen";
import { CertificatesScreen } from "./src/screens/CertificatesScreen";
import { SkillTreeScreen } from "./src/screens/SkillTreeScreen";
import { AnalyticsScreen } from "./src/screens/AnalyticsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { CourseDetailScreen } from "./src/screens/CourseDetailScreen";
import { LessonScreen } from "./src/screens/LessonScreen";
import { StudyPlanScreen } from "./src/screens/StudyPlanScreen";
import { PlaygroundScreen } from "./src/screens/PlaygroundScreen";
import { MentorScreen } from "./src/screens/MentorScreen";

// Types
type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  VideoCall: { roomId: string; userName: string };
  Certificates: undefined;
  SkillTree: undefined;
  Analytics: undefined;
  Settings: undefined;
  Chat: undefined;
  CourseDetail: { slug: string };
  Lesson: { lessonId: string; courseTitle?: string; lessonTitle?: string };
  StudyPlan: undefined;
  Playground: undefined;
  Mentor: undefined;
};

type TabParamList = {
  Dashboard: undefined;
  Gamification: undefined;
  Challenges: undefined;
  Social: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICON_NAMES: Record<
  keyof TabParamList,
  keyof typeof Ionicons.glyphMap
> = {
  Dashboard: "home",
  Gamification: "trophy",
  Challenges: "flash",
  Social: "people",
  Profile: "person",
};

function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
          height: 84,
          paddingBottom: 22,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={
              focused
                ? TAB_ICON_NAMES[route.name as keyof TabParamList]
                : (`${TAB_ICON_NAMES[route.name as keyof TabParamList]}-outline` as keyof typeof Ionicons.glyphMap)
            }
            size={size ?? 22}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Gamification" component={GamificationScreen} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const linking = {
  prefixes: ["studyai://", "https://studyai.app"],
  config: {
    screens: {
      Login: "login",
      Main: "main",
      Certificates: "certificates",
      SkillTree: "skill-tree",
      Analytics: "analytics",
      Settings: "settings",
      Chat: "chat",
      VideoCall: "video-call/:roomId",
      CourseDetail: "course/:slug",
      Lesson: "lesson/:lessonId",
      StudyPlan: "study-plan",
      Playground: "playground",
      Mentor: "mentor",
    },
  },
};

function AppContent() {
  const [splashDone, setSplashDone] = useState(false);
  const { colors, isDark } = useTheme();
  const { isLoading: authLoading, isAuthenticated } = useUser();

  useEffect(() => {
    setTimeout(() => setSplashDone(true), 1200);
  }, []);

  // Set up push notifications and chat when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      notificationsApi.requestPermission().catch(() => {});
      chatService.connect().catch(() => {});

      const unsub = notificationsApi.addNotificationListener((notification) => {
        console.log("[Notification]", notification?.request?.content?.title);
      });

      return () => {
        chatService.disconnect();
        unsub?.remove?.();
      };
    }
  }, [isAuthenticated]);

  const isLoading = !splashDone || authLoading;

  if (isLoading) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text style={[styles.splashBrand, { color: colors.foreground }]}>
          Study<Text style={{ color: colors.primary }}>AI</Text>
        </Text>
        <Text
          style={[styles.splashSubtitle, { color: colors.mutedForeground }]}
        >
          Interactive Tech Education
        </Text>
        <View style={styles.splashLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Navigator
        id="RootStack"
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={() => {}} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="VideoCall"
              component={VideoCallScreen}
              options={{
                presentation: "fullScreenModal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="Certificates"
              component={CertificatesScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="SkillTree"
              component={SkillTreeScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Analytics"
              component={AnalyticsScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="CourseDetail"
              component={CourseDetailScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Lesson"
              component={LessonScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="StudyPlan"
              component={StudyPlanScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Playground"
              component={PlaygroundScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Mentor"
              component={MentorScreen}
              options={{ animation: "slide_from_right" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <ThemeProvider>
          <UpdateProvider>
            <AppContent />
          </UpdateProvider>
        </ThemeProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  splashBrand: { fontSize: 40, fontWeight: "800", letterSpacing: -1 },
  splashSubtitle: { fontSize: 13, marginTop: 10, letterSpacing: 1.2 },
  splashLoader: { marginTop: 40 },
});
