import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useUser } from '../../context/UserContext';

interface EditProfileModalProps {
  colors: any;
  visible: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ colors, visible, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useUser();
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio);

  const openWithDefaults = () => {
    setEditName(user.name);
    setEditBio(user.bio);
  };

  const handleSave = () => {
    updateUser({ name: editName, bio: editBio });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalKeyboard}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.modalCloseBtn}
                  accessibilityLabel="Close edit profile"
                  accessibilityRole="button"
                >
                  <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.border, color: colors.text, borderColor: colors.border }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Your name"
                textContentType="name"
                autoComplete="name"
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Bio</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline, { backgroundColor: colors.border, color: colors.text, borderColor: colors.border }]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Tell us about yourself"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                accessibilityLabel="Your bio"
              />

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                onPress={handleSave}
                accessibilityLabel="Save profile changes"
                accessibilityRole="button"
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end',
  },
  modalKeyboard: { justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalCloseBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  modalClose: { fontSize: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, marginBottom: 16, minHeight: 48,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  saveBtn: {
    borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, minHeight: 48, justifyContent: 'center',
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
