'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { SocketIOProvider } from '@/lib/yjs-socketio-provider';
import { motion } from 'framer-motion';
import {
  Users,
  Edit3,
  Send,
  Copy,
  Download,
  RotateCcw,
  LogIn,
  LogOut,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: { line: number; column: number };
}

interface CollaborativeEditorProps {
  initialCode?: string;
  language?: string;
  roomId?: string;
  serverUrl?: string;
  token?: string;
}

export function CollaborativeEditor({
  initialCode = '// Start coding together!\nfunction hello() {\n  console.log("Hello, StudyAI!");\n}\n',
  language = 'javascript',
  roomId: initialRoomId = 'demo-room',
  serverUrl = 'http://localhost:3000',
  token,
}: CollaborativeEditorProps) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [inputRoomId, setInputRoomId] = useState(initialRoomId);
  const [code, setCode] = useState(initialCode);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ user: string; message: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [userName, setUserName] = useState('User');

  const providerRef = useRef<SocketIOProvider | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const awarenessIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupProvider = useCallback(() => {
    if (awarenessIntervalRef.current) {
      clearInterval(awarenessIntervalRef.current);
      awarenessIntervalRef.current = null;
    }
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }
    setIsConnected(false);
    setIsInRoom(false);
    setCollaborators([]);
  }, []);

  const joinRoom = useCallback(() => {
    if (!inputRoomId.trim()) return;
    cleanupProvider();

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const provider = new SocketIOProvider(inputRoomId, serverUrl, token);
    providerRef.current = provider;

    provider.on('connect', () => {
      setIsConnected(true);
      setIsInRoom(true);
      setRoomId(inputRoomId);
    });

    provider.on('disconnect', () => {
      setIsConnected(false);
    });

    provider.on('users-updated', (users: any[]) => {
      const colors = [
        '#EF4444', '#F97316', '#EAB308', '#22C55E',
        '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
        '#F43F5E', '#14B8A6', '#6366F1', '#A855F7',
      ];

      const mapped: Collaborator[] = users.map((u: any, i: number) => ({
        id: u.userId,
        name: u.userName,
        color: u.color || colors[i % colors.length],
      }));
      setCollaborators(mapped);
    });

    provider.on('awareness-updated', (awareness: Map<string, any>) => {
      if (!editorRef.current || !monacoRef.current) return;
      const monaco = monacoRef.current;
      const editor = editorRef.current;
      const model = editor.getModel();
      if (!model) return;

      const newDecorations: any[] = [];
      awareness.forEach((state: any, userId: string) => {
        if (state.cursor && provider.socket.id !== userId) {
          const pos = model.getPositionAt(state.cursor.column || 0);
          newDecorations.push({
            range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column + 1),
            options: {
              className: `cursor-${userId}`,
              beforeContentClassName: `cursor-line`,
              stickiness: 1,
            },
          });
        }
      });

      decorationsRef.current = editor.deltaDecorations(
        decorationsRef.current,
        newDecorations,
      );
    });

    provider.doc.on('update', (update: Uint8Array) => {
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const value = provider.doc.getText('monaco').toString();
          if (model.getValue() !== value) {
            model.setValue(value);
          }
        }
      }
    });

    return () => {
      cleanupProvider();
    };
  }, [inputRoomId, serverUrl, token, cleanupProvider]);

  const leaveRoom = useCallback(() => {
    cleanupProvider();
    setCode(initialCode);
  }, [cleanupProvider, initialCode]);

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.defineTheme('collaborative-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {},
    });
    monaco.editor.setTheme('collaborative-dark');

    editor.onDidChangeCursorPosition((e: any) => {
      if (providerRef.current && providerRef.current.socket.connected) {
        const model = editor.getModel();
        if (model) {
          const offset = model.getOffsetAt(e.position);
          providerRef.current.sendAwareness({
            userId: providerRef.current.socket.id,
            userName,
            cursor: { line: e.position.lineNumber - 1, column: offset },
          });
        }
      }
    });
  }, [userName]);

  useEffect(() => {
    return () => {
      cleanupProvider();
    };
  }, [cleanupProvider]);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { user: userName, message: chatInput }]);
    setChatInput('');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roomId}-code.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetCode = () => {
    if (providerRef.current) {
      const ytext = providerRef.current.doc.getText('monaco');
      ytext.delete(0, ytext.length);
      ytext.insert(0, initialCode);
    }
    setCode(initialCode);
  };

  return (
    <div className="flex h-[600px] bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
      {/* Editor Panel */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {isInRoom ? (
              <>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-400">Room: {roomId}</span>
                <span className="text-xs text-gray-500">({collaborators.length} users)</span>
                <button
                  onClick={leaveRoom}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30"
                >
                  <LogOut className="w-3 h-3" /> Leave
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputRoomId}
                  onChange={(e) => setInputRoomId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                  placeholder="Enter room ID..."
                  className="px-3 py-1 text-sm bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={joinRoom}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <LogIn className="w-3 h-3" /> Join
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isInRoom && (
              <>
                <button onClick={copyCode} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400" title="Copy code">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={downloadCode} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={resetCode} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400" title="Reset">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => {
              setCode(value || '');
              if (providerRef.current && ydocRef.current) {
                const ytext = providerRef.current.doc.getText('monaco');
                const current_value = ytext.toString();
                if (current_value !== (value || '')) {
                  ydocRef.current.transact(() => {
                    ytext.delete(0, ytext.length);
                    ytext.insert(0, value || '');
                  });
                }
              }
            }}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              renderLineHighlight: 'all',
            }}
          />

          {/* Collaborator Cursors Overlay */}
          {collaborators.map((collab) => {
            if (!collab.cursor) return null;
            return (
              <div
                key={collab.id}
                className="absolute pointer-events-none z-10"
                style={{
                  top: `${(collab.cursor.line) * 20 + 50}px`,
                  left: `${Math.min(collab.cursor.column * 8 + 50, 600)}px`,
                }}
              >
                <div
                  className="w-0.5 h-5"
                  style={{ backgroundColor: collab.color }}
                />
                <div
                  className="px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
                  style={{ backgroundColor: collab.color }}
                >
                  {collab.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-72 border-l border-gray-700 flex flex-col bg-gray-800">
        {/* Collaborators */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Collaborators ({collaborators.length})
          </h3>
          <div className="space-y-2">
            {collaborators.map((collab) => (
              <div key={collab.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: collab.color }}
                />
                <span className="text-sm text-gray-300">{collab.name}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-auto" />
              </div>
            ))}
            {collaborators.length === 0 && (
              <p className="text-xs text-gray-500">No collaborators yet</p>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> Session Chat
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className="bg-gray-700 rounded-xl p-3">
                <p className="text-xs text-purple-400 font-medium">{msg.user}</p>
                <p className="text-sm text-gray-200 mt-1">{msg.message}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white text-sm placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={sendChat}
                className="p-2 bg-purple-500 rounded-lg text-white"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
