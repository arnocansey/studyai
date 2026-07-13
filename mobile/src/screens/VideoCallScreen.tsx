import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: {
    params: {
      roomId: string;
      userName: string;
    };
  };
}

export function VideoCallScreen({ navigation, route }: Props) {
  const { roomId, userName } = route.params || { roomId: 'demo', userName: 'Student' };
  const { colors } = useTheme();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    Alert.alert('End Call', 'Are you sure you want to end this call?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Remote Video (full screen) */}
      <View style={styles.remoteVideo}>
        <View style={styles.remotePlaceholder}>
          <Text style={styles.remotePlaceholderText}>SC</Text>
          <Text style={styles.remoteName}>Sarah Chen</Text>
        </View>
      </View>

      {/* Local Video (small) */}
      <View style={styles.localVideo}>
        <View style={styles.localPlaceholder}>
          <Text style={styles.localPlaceholderText}>🎓</Text>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.callTitle}>Study Session</Text>
          <Text style={styles.callDuration}>{formatDuration(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonOff]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
          <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isVideoOff && styles.controlButtonOff]}
          onPress={() => setIsVideoOff(!isVideoOff)}
        >
          <Text style={styles.controlIcon}>{isVideoOff ? '📷' : '📹'}</Text>
          <Text style={styles.controlLabel}>{isVideoOff ? 'Camera On' : 'Camera Off'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !isSpeakerOn && styles.controlButtonOff]}
          onPress={() => setIsSpeakerOn(!isSpeakerOn)}
        >
          <Text style={styles.controlIcon}>{isSpeakerOn ? '🔊' : '🔈'}</Text>
          <Text style={styles.controlLabel}>{isSpeakerOn ? 'Speaker' : 'Earpiece'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={endCall}
        >
          <Text style={styles.controlIcon}>📞</Text>
          <Text style={[styles.controlLabel, { color: '#FFFFFF' }]}>End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remotePlaceholder: {
    alignItems: 'center',
  },
  remotePlaceholderText: {
    fontSize: 80,
    color: '#7C3AED',
    fontWeight: 'bold',
  },
  remoteName: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 10,
  },
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: '#4B5563',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  localPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localPlaceholderText: {
    fontSize: 40,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 160,
  },
  headerInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  callTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  callDuration: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 70,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonOff: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  endCallButton: {
    backgroundColor: '#EF4444',
  },
  controlIcon: {
    fontSize: 24,
  },
  controlLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    marginTop: 4,
  },
});
