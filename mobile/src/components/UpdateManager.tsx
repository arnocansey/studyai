import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

let Updates: any = null;
try {
  Updates = require('expo-updates');
} catch {}

type UpdateInfo = {
  isUpdateAvailable: boolean;
  isUpdatePending: boolean;
  downloadProgress: number;
};

type UpdateContextType = {
  checkForUpdate: () => Promise<void>;
  updateInfo: UpdateInfo;
};

const UpdateContext = createContext<UpdateContextType>({
  checkForUpdate: async () => {},
  updateInfo: { isUpdateAvailable: false, isUpdatePending: false, downloadProgress: 0 },
});

export const useUpdate = () => useContext(UpdateContext);

export function UpdateProvider({ children }: { children: React.ReactNode }) {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    isUpdateAvailable: false,
    isUpdatePending: false,
    downloadProgress: 0,
  });
  const [showPrompt, setShowPrompt] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  const checkForUpdate = useCallback(async () => {
    try {
      if (!Updates || !Updates.isEnabled) return;

      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateInfo((prev) => ({ ...prev, isUpdateAvailable: true }));
        setShowPrompt(true);

        await Updates.fetchUpdateAsync();
        setUpdateInfo((prev) => ({ ...prev, isUpdatePending: true }));
        setUpdateReady(true);
      }
    } catch (error) {
      // Silently fail — OTA updates don't work in Expo Go
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    try {
      setShowPrompt(false);
      if (Updates && Updates.reloadAsync) {
        await Updates.reloadAsync();
      }
    } catch (error) {
      // Silently fail in Expo Go
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setShowPrompt(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdate();
    }, 3000);
    return () => clearTimeout(timer);
  }, [checkForUpdate]);

  return (
    <UpdateContext.Provider value={{ checkForUpdate, updateInfo }}>
      {children}
      {Updates && Updates.isEnabled && (
        <UpdateModal
          visible={showPrompt}
          isReady={updateReady}
          onApply={applyUpdate}
          onDismiss={dismissUpdate}
        />
      )}
    </UpdateContext.Provider>
  );
}

function UpdateModal({
  visible,
  isReady,
  onApply,
  onDismiss,
}: {
  visible: boolean;
  isReady: boolean;
  onApply: () => void;
  onDismiss: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.card }]}>
          {!isReady ? (
            <>
              <View style={styles.iconContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Updating...
              </Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                Downloading the latest improvements. This won't take long.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Text style={styles.updateIcon}>✨</Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Update Ready
              </Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                A new version has been downloaded. Restart now to enjoy the latest features.
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.dismissButton, { borderColor: colors.border }]}
                  onPress={onDismiss}
                >
                  <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                    Later
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.applyButton, { backgroundColor: colors.accent }]}
                  onPress={onApply}
                >
                  <Text style={[styles.buttonText, { color: '#fff' }]}>
                    Restart Now
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  updateIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  dismissButton: {
    borderWidth: 1,
  },
  applyButton: {},
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
