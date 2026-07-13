'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Monitor, 
  Users, MessageCircle, Settings, Maximize2, Minimize2
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
}

export function VideoTutoring() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [duration, setDuration] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Sarah Chen', isMuted: false, isVideoOff: false, isSpeaking: true },
    { id: '2', name: 'You', isMuted: false, isVideoOff: false, isSpeaking: false },
  ]);

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

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'h-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white font-medium">Study Session</span>
          <span className="text-gray-400 text-sm">{formatDuration(duration)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm flex items-center gap-1">
            <Users className="w-4 h-4" /> {participants.length}
          </span>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 bg-gray-900">
        <div className={`grid gap-4 h-full ${
          participants.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        }`}>
          {/* Remote Video */}
          <div className="relative bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold mb-4">
                  SC
                </div>
                <p className="text-white text-lg font-medium">Sarah Chen</p>
                {participants[0]?.isSpeaking && (
                  <div className="flex justify-center gap-1 mt-2">
                    <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" />
                    <div className="w-1 h-6 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  </div>
                )}
              </div>
            </div>
            {participants[0]?.isMuted && (
              <div className="absolute bottom-4 right-4 p-2 bg-red-500 rounded-full">
                <MicOff className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Local Video */}
          <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {isVideoOff ? (
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold mb-4">
                    🎓
                  </div>
                  <p className="text-white text-lg font-medium">Camera Off</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold mb-4">
                    Y
                  </div>
                  <p className="text-white text-lg font-medium">You</p>
                </div>
              )}
            </div>
            {isMuted && (
              <div className="absolute bottom-4 right-4 p-2 bg-red-500 rounded-full">
                <MicOff className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-4 py-6 bg-gray-800">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-all ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
        </button>

        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-4 rounded-full transition-all ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
        </button>

        <button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={`p-4 rounded-full transition-all ${
            isScreenSharing ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Monitor className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>

        <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all">
          <Settings className="w-6 h-6 text-white" />
        </button>

        <button className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all">
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 flex flex-col"
        >
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Session Chat</h3>
          </div>
          <div className="flex-1 p-4 space-y-3">
            <div className="bg-gray-700 rounded-xl p-3">
              <p className="text-sm text-gray-400">Sarah Chen</p>
              <p className="text-white text-sm">Let me explain subnetting...</p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
              />
              <button className="px-4 py-2 bg-purple-500 text-white rounded-xl">
                Send
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
