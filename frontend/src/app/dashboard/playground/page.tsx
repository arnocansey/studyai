'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Terminal, BookOpen, Lightbulb } from 'lucide-react';
import { CodePlayground } from '@/components/playground';

export default function PlaygroundPage() {
  const [showTips, setShowTips] = useState(true);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Code Playground</h1>
              <p className="text-sm text-gray-500">Write, run, and experiment with code</p>
            </div>
          </div>

          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            <Lightbulb className="w-4 h-4" />
            {showTips ? 'Hide Tips' : 'Show Tips'}
          </button>
        </div>

        {/* Tips Banner */}
        {showTips && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-purple-700 dark:text-purple-300">
                <p className="font-medium">Quick Tips:</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>Choose a language template from the toolbar to get started</li>
                  <li>Press the <span className="font-mono bg-purple-100 dark:bg-purple-800 px-1 rounded">Run</span> button or <span className="font-mono bg-purple-100 dark:bg-purple-800 px-1 rounded">Ctrl+Enter</span> to execute code</li>
                  <li>Use the fullscreen button for a larger editing area</li>
                  <li>Download your code to save it locally</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Playground */}
      <div className="flex-1 min-h-0">
        <CodePlayground />
      </div>
    </div>
  );
}
