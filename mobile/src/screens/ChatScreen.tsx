import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { chatService, ChatMessage } from '../services/chat';

const CHANNELS = [
  { id: 'general', name: 'General', unread: 0 },
  { id: 'help', name: 'Help', unread: 0 },
  { id: 'study', name: 'Study Group', unread: 0 },
  { id: 'python', name: 'Python', unread: 0 },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', userId: 'system', userName: 'StudyAI', content: 'Welcome to the chat! Be respectful and help each other learn.', room: 'general', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: '2', userId: 'u1', userName: 'Sarah Chen', content: 'Hey everyone! Anyone working on the subnetting challenge?', room: 'general', timestamp: new Date(Date.now() - 3600000).toISOString(), reactions: [{ emoji: '👍', users: ['u2'] }] },
  { id: '3', userId: 'u2', userName: 'Marcus Lee', content: "Yes! I'm stuck on /26 calculations. Anyone have tips?", room: 'general', timestamp: new Date(Date.now() - 2400000).toISOString() },
  { id: '4', userId: 'u3', userName: 'Emily Park', content: 'Remember: each subnet bit doubles the number of subnets. So /26 = 4 subnets of 64 IPs each!', room: 'general', timestamp: new Date(Date.now() - 1200000).toISOString(), reactions: [{ emoji: '🎉', users: ['u1', 'u2'] }, { emoji: '💯', users: ['u4'] }] },
  { id: '5', userId: 'u4', userName: 'David Kim', content: 'That makes sense! What about /27?', room: 'general', timestamp: new Date(Date.now() - 600000).toISOString() },
];

export function ChatScreen() {
  const { colors } = useTheme();
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [currentChannel, setCurrentChannel] = useState('general');
  const [showChannels, setShowChannels] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsub1 = chatService.on('message:new', (msg: ChatMessage) => {
      if (msg.room === currentChannel) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    const unsub2 = chatService.on('message:updated', (msg: ChatMessage) => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    });
    const unsub3 = chatService.on('typing:update', (data: { room: string; users: string[] }) => {
      if (data.room === currentChannel) {
        setTypingUsers(data.users.filter((u) => u !== user.name));
      }
    });
    const unsub4 = chatService.on('user:online', (data: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId));
    });
    const unsub5 = chatService.on('user:offline', (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    });

    chatService.requestHistory(currentChannel, 50).then((history) => {
      if (history.length > 0) setMessages(history);
    }).catch(() => {});

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); };
  }, [currentChannel]);

  const sendMessage = () => {
    if (!input.trim()) return;
    chatService.sendMessage(input.trim(), currentChannel);
    setInput('');
  };

  const addReaction = (messageId: string, emoji: string) => {
    chatService.sendReaction(messageId, currentChannel, emoji);
  };

  const handleInput = (text: string) => {
    setInput(text);
    if (text.length > 0) {
      chatService.startTyping(currentChannel);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => chatService.stopTyping(currentChannel), 2000);
    }
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.userId === user.id;
    const isSystem = item.userId === 'system';
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && (
          <View style={[styles.msgAvatar, isSystem && styles.msgAvatarSystem]}>
            <Text style={{ fontSize: 14, color: colors.text, fontWeight: '600' }}>{isSystem ? '🤖' : item.userName[0]}</Text>
          </View>
        )}
        <View style={[styles.msgBubble, isMe && { backgroundColor: colors.accent, borderTopLeftRadius: 16, borderTopRightRadius: 4, borderColor: colors.accent }, isSystem && styles.msgBubbleSystem]}>
          {!isMe && <Text style={[styles.msgName, isSystem && styles.msgNameSystem]}>{item.userName}</Text>}
          <Text style={[styles.msgContent, isMe && { color: colors.text }, isSystem && styles.msgContentSystem]}>
            {item.content}
          </Text>
          <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>{formatTime(item.timestamp)}</Text>
          {item.reactions && item.reactions.length > 0 && (
            <View style={styles.reactions}>
              {item.reactions.map((r, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.reactionBadge, { backgroundColor: colors.border }]}
                  onPress={() => addReaction(item.id, r.emoji)}
                  accessibilityLabel={`${r.emoji} reaction, ${r.users.length}`}
                  accessibilityRole="button"
                >
                  <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>{r.users.length}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No messages yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Start the conversation in #{CHANNELS.find(c => c.id === currentChannel)?.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setShowChannels(!showChannels)}
          accessibilityLabel={`Channel: ${CHANNELS.find(c => c.id === currentChannel)?.name}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: showChannels }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}># {CHANNELS.find((c) => c.id === currentChannel)?.name}</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <View style={[styles.onlineDot, { backgroundColor: isConnected ? '#10B981' : '#6B7280' }]} />
          <Text style={{ fontSize: 13, color: colors.textMuted }}>{onlineUsers.size + 1} online</Text>
        </View>
      </View>

      {showChannels && (
        <View style={[styles.channelList, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {CHANNELS.map((ch) => (
            <TouchableOpacity
              key={ch.id}
              style={[styles.channelItem, currentChannel === ch.id && { backgroundColor: colors.accent + '15' }]}
              onPress={() => { setCurrentChannel(ch.id); setShowChannels(false); }}
              accessibilityLabel={`Switch to ${ch.name} channel`}
              accessibilityRole="button"
            >
              <Text style={[styles.channelName, { color: currentChannel === ch.id ? colors.accent : colors.text }]}># {ch.name}</Text>
              {ch.unread > 0 && <View style={[styles.unreadBadge, { backgroundColor: colors.accent }]}><Text style={styles.unreadText}>{ch.unread}</Text></View>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={messages.length === 0 ? styles.messagesListEmpty : styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {typingUsers.length > 0 && (
        <View style={styles.typingContainer}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, { backgroundColor: colors.textMuted }]} />
            <View style={[styles.typingDot, { backgroundColor: colors.textMuted }]} />
            <View style={[styles.typingDot, { backgroundColor: colors.textMuted }]} />
          </View>
          <Text style={{ fontSize: 12, color: colors.textMuted, fontStyle: 'italic' }}>{typingUsers.join(', ')} typing...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.bg, borderColor: colors.border }]}
            value={input}
            onChangeText={handleInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            accessibilityLabel="Message input"
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.accent : colors.border }]}
            onPress={sendMessage}
            disabled={!input.trim()}
            accessibilityLabel="Send message"
            accessibilityRole="button"
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },

  channelList: { borderBottomWidth: 1, paddingBottom: 8 },
  channelItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  channelName: { fontSize: 15, fontWeight: '600' },
  unreadBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center' },
  unreadText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  messagesList: { padding: 16, paddingBottom: 8 },
  messagesListEmpty: { flex: 1, padding: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  emptySubtitle: { fontSize: 14 },

  msgRow: { flexDirection: 'row', marginBottom: 12, maxWidth: '85%' },
  msgRowMe: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#374151',
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  msgAvatarSystem: { backgroundColor: '#7C3AED' },
  msgBubble: {
    backgroundColor: '#1F1F1F', borderRadius: 16, borderTopRightRadius: 16,
    padding: 12, borderWidth: 1, borderColor: '#2D2D2D',
  },
  msgBubbleSystem: { backgroundColor: '#7C3AED15', borderColor: '#7C3AED30' },
  msgName: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 2 },
  msgNameSystem: { color: '#7C3AED' },
  msgContent: { fontSize: 14, color: '#E5E7EB', lineHeight: 20 },
  msgContentSystem: { color: '#A78BFA' },
  msgTime: { fontSize: 10, color: '#9CA3AF', marginTop: 4, textAlign: 'right' },
  msgTimeMe: { color: 'rgba(255,255,255,0.6)' },
  reactions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  reactionBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, minHeight: 32 },
  reactionEmoji: { fontSize: 14 },

  typingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, gap: 8 },
  typingDots: { flexDirection: 'row', gap: 3 },
  typingDot: { width: 6, height: 6, borderRadius: 3 },

  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  input: {
    flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, maxHeight: 100,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sendBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
