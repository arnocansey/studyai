import { Platform } from 'react-native';
import { api } from './api';

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {}

export const notificationsApi = {
  requestPermission: async (): Promise<boolean> => {
    if (!Notifications) return false;
    try {
      const existing: any = await Notifications.getPermissionsAsync();
      if (existing.status === 'granted') return true;
      const result: any = await Notifications.requestPermissionsAsync();
      return result.status === 'granted';
    } catch {
      return false;
    }
  },

  registerForPush: async () => {
    if (!Notifications) return null;
    try {
      const granted = await notificationsApi.requestPermission();
      if (!granted) return null;
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch {
      return null;
    }
  },

  subscribe: async (endpoint: string, keys: { p256dh: string; auth: string }) => {
    return api.post('/notifications/subscribe', { endpoint, keys });
  },

  unsubscribe: async (endpoint: string) => {
    return api.delete('/notifications/unsubscribe');
  },

  addNotificationListener: (callback: (notification: any) => void) => {
    if (!Notifications) return { remove: () => {} };
    try {
      return Notifications.addNotificationReceivedListener(callback);
    } catch {
      return { remove: () => {} };
    }
  },

  addResponseListener: (callback: (response: any) => void) => {
    if (!Notifications) return { remove: () => {} };
    try {
      return Notifications.addNotificationResponseReceivedListener(callback);
    } catch {
      return { remove: () => {} };
    }
  },
};
