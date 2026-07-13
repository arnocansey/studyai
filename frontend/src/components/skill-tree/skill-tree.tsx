'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { Sparkles, Lock, CheckCircle, ArrowRight } from 'lucide-react';

interface SkillNode {
  id: string;
  name: string;
  title: string;
  icon: string;
  level: number; // 0-100 mastery
  xpRequired: number;
  unlocked: boolean;
  category: string;
}

interface SkillEdge {
  source: string;
  target: string;
}

// Custom node component
function SkillNodeComponent({ data }: { data: any }) {
  const { skill } = data;
  const progress = skill.level;
  const isUnlocked = skill.unlocked;
  const isCompleted = progress === 100;

  return (
    <div
      className={`relative px-4 py-3 rounded-xl border-2 transition-all min-w-[140px] ${
        isCompleted
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20'
          : isUnlocked
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-60'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="flex items-center gap-2">
        <span className="text-xl">{skill.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{skill.title}</p>
          {isUnlocked ? (
            <div className="mt-1">
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isCompleted ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{progress}%</p>
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <Lock className="w-3 h-3" /> {skill.xpRequired} XP required
            </div>
          )}
        </div>
      </div>

      {isCompleted && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-3 h-3 text-white" />
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}

const nodeTypes = { skillNode: SkillNodeComponent };

export function SkillTreeVisualization() {
  const skills: SkillNode[] = [
    // Programming root
    { id: 'prog', name: 'programming', title: 'Programming', icon: '💻', level: 75, xpRequired: 0, unlocked: true, category: 'programming' },
    { id: 'python', name: 'python', title: 'Python', icon: '🐍', level: 85, xpRequired: 0, unlocked: true, category: 'programming' },
    { id: 'py-basics', name: 'python_basics', title: 'Python Basics', icon: '📝', level: 100, xpRequired: 0, unlocked: true, category: 'programming' },
    { id: 'py-adv', name: 'python_advanced', title: 'Advanced Python', icon: '⚡', level: 60, xpRequired: 500, unlocked: true, category: 'programming' },
    { id: 'javascript', name: 'javascript', title: 'JavaScript', icon: '🟨', level: 70, xpRequired: 0, unlocked: true, category: 'programming' },
    { id: 'react', name: 'react', title: 'React', icon: '⚛️', level: 45, xpRequired: 200, unlocked: true, category: 'programming' },
    { id: 'typescript', name: 'typescript', title: 'TypeScript', icon: '🔷', level: 30, xpRequired: 300, unlocked: true, category: 'programming' },

    // Networking branch
    { id: 'net', name: 'networking', title: 'Networking', icon: '🌐', level: 60, xpRequired: 0, unlocked: true, category: 'networking' },
    { id: 'net-basics', name: 'networking_basics', title: 'Network Fundamentals', icon: '📡', level: 100, xpRequired: 0, unlocked: true, category: 'networking' },
    { id: 'subnet', name: 'subnetting', title: 'Subnetting', icon: '🔢', level: 80, xpRequired: 200, unlocked: true, category: 'networking' },
    { id: 'tcpip', name: 'tcp_ip', title: 'TCP/IP Deep Dive', icon: '🔗', level: 40, xpRequired: 400, unlocked: true, category: 'networking' },

    // Cybersecurity branch
    { id: 'cyber', name: 'cybersecurity', title: 'Cybersecurity', icon: '🛡️', level: 40, xpRequired: 0, unlocked: true, category: 'cybersecurity' },
    { id: 'web-sec', name: 'web_security', title: 'Web Security', icon: '🔒', level: 55, xpRequired: 0, unlocked: true, category: 'cybersecurity' },
    { id: 'pentest', name: 'pentesting', title: 'Penetration Testing', icon: '🎯', level: 20, xpRequired: 500, unlocked: true, category: 'cybersecurity' },
    { id: 'forensics', name: 'forensics', title: 'Digital Forensics', icon: '🔍', level: 0, xpRequired: 800, unlocked: false, category: 'cybersecurity' },

    // Cloud branch
    { id: 'cloud', name: 'cloud', title: 'Cloud Computing', icon: '☁️', level: 25, xpRequired: 0, unlocked: true, category: 'cloud' },
    { id: 'aws', name: 'aws', title: 'AWS', icon: '📦', level: 35, xpRequired: 0, unlocked: true, category: 'cloud' },
    { id: 'azure', name: 'azure', title: 'Azure', icon: '🔷', level: 10, xpRequired: 400, unlocked: true, category: 'cloud' },
    { id: 'k8s', name: 'kubernetes', title: 'Kubernetes', icon: '🚀', level: 0, xpRequired: 1000, unlocked: false, category: 'cloud' },
  ];

  const edges: SkillEdge[] = [
    // Programming
    { source: 'prog', target: 'python' },
    { source: 'prog', target: 'javascript' },
    { source: 'python', target: 'py-basics' },
    { source: 'python', target: 'py-adv' },
    { source: 'javascript', target: 'react' },
    { source: 'javascript', target: 'typescript' },

    // Networking
    { source: 'prog', target: 'net' },
    { source: 'net', target: 'net-basics' },
    { source: 'net', target: 'subnet' },
    { source: 'net', target: 'tcpip' },

    // Cybersecurity
    { source: 'net', target: 'cyber' },
    { source: 'cyber', target: 'web-sec' },
    { source: 'cyber', target: 'pentest' },
    { source: 'pentest', target: 'forensics' },

    // Cloud
    { source: 'prog', target: 'cloud' },
    { source: 'cloud', target: 'aws' },
    { source: 'cloud', target: 'azure' },
    { source: 'aws', target: 'k8s' },
  ];

  // Convert to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    const categoryOffsets: Record<string, { x: number; y: number }> = {
      programming: { x: 0, y: 0 },
      networking: { x: 400, y: 0 },
      cybersecurity: { x: 400, y: 300 },
      cloud: { x: 0, y: 300 },
    };

    return skills.map((skill) => {
      const offset = categoryOffsets[skill.category] || { x: 0, y: 0 };
      const colIndex = ['prog', 'python', 'javascript', 'net', 'cyber', 'cloud'].indexOf(skill.id);
      const rowIndex = skills.filter((s) => s.category === skill.category).indexOf(skill);

      return {
        id: skill.id,
        type: 'skillNode',
        position: {
          x: offset.x + (rowIndex % 3) * 180,
          y: offset.y + Math.floor(rowIndex / 3) * 120,
        },
        data: { skill },
      };
    });
  }, []);

  const initialEdges: Edge[] = useMemo(
    () =>
      edges.map((edge, i) => ({
        id: `e${i}`,
        source: edge.source,
        target: edge.target,
        animated: false,
        style: { stroke: '#a855f7', strokeWidth: 2 },
      })),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(() => {}, []);

  // Calculate stats
  const totalSkills = skills.length;
  const unlockedSkills = skills.filter((s) => s.unlocked).length;
  const completedSkills = skills.filter((s) => s.level === 100).length;
  const avgMastery = Math.round(skills.reduce((sum, s) => sum + s.level, 0) / totalSkills);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Skill Tree
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">{unlockedSkills}/{totalSkills} unlocked</span>
          <span className="text-green-500">{completedSkills} completed</span>
          <span className="text-purple-500">{avgMastery}% avg mastery</span>
        </div>
      </div>

      {/* Skill Tree */}
      <div className="h-[500px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edgesState}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#a855f7" gap={20} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node: any) => {
              const skill = node.data?.skill;
              if (skill?.level === 100) return '#22c55e';
              if (skill?.unlocked) return '#a855f7';
              return '#9ca3af';
            }}
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-500">Completed (100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500"></div>
          <span className="text-gray-500">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-400"></div>
          <span className="text-gray-500">Locked</span>
        </div>
      </div>
    </div>
  );
}
