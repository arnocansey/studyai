"use client";

import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import {
  Play,
  RotateCcw,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  Terminal,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type Language =
  | "javascript"
  | "typescript"
  | "python"
  | "html"
  | "css"
  | "json"
  | "sql"
  | "bash";

interface CodeReviewResult {
  rating: number;
  feedback: string;
  improvements: string[];
  securityIssues: string[];
}
interface CodeTemplate {
  name: string;
  language: Language;
  code: string;
}

const TEMPLATES: CodeTemplate[] = [
  {
    name: "JavaScript",
    language: "javascript",
    code: `// Welcome to StudyAI Code Playground!
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Test with first 10 numbers
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
  },
  {
    name: "TypeScript",
    language: "typescript",
    code: `interface User {
  id: string;
  name: string;
  xp: number;
  level: number;
}

function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

const user: User = {
  id: "1",
  name: "Student",
  xp: 2500,
  level: calculateLevel(2500),
};

console.log(\`\${user.name} is level \${user.level}!\`);`,
  },
  {
    name: "Python",
    language: "python",
    code: `# Welcome to StudyAI Code Playground!
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Test with first 10 numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
  },
  {
    name: "SQL",
    language: "sql",
    code: `-- Create a sample users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1
);

-- Insert sample data
INSERT INTO users (name, xp, level) VALUES
  ('Alice', 5000, 7),
  ('Bob', 3200, 6),
  ('Charlie', 8900, 10);

-- Query top users
SELECT name, xp, level
FROM users
WHERE xp > 4000
ORDER BY xp DESC;`,
  },
  {
    name: "HTML/CSS",
    language: "html",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>StudyAI Playground</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    h1 { color: #333; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Welcome to StudyAI!</h1>
    <p>Start building amazing things.</p>
  </div>
</body>
</html>`,
  },
];

export function CodePlayground() {
  const [code, setCode] = useState(TEMPLATES[0].code);
  const [language, setLanguage] = useState<Language>(TEMPLATES[0].language);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleTemplateChange = (index: number) => {
    setSelectedTemplate(index);
    setCode(TEMPLATES[index].code);
    setLanguage(TEMPLATES[index].language);
    setOutput([]);
  };

  const reviewWithAi = async () => {
    setIsReviewing(true);
    try {
      const result = await apiFetch<CodeReviewResult>("/ai/review", {
        method: "POST",
        body: JSON.stringify({ code, language }),
      });
      const lines = [
        `AI Review · ${result.rating}/10`,
        result.feedback,
        ...(result.improvements?.length
          ? [
              "",
              "Improvements:",
              ...result.improvements.map((i, n) => `${n + 1}. ${i}`),
            ]
          : []),
        ...(result.securityIssues?.length
          ? [
              "",
              "Security:",
              ...result.securityIssues.map((i, n) => `${n + 1}. ${i}`),
            ]
          : []),
      ];
      setOutput(lines);
    } catch (err: any) {
      setOutput([`Review failed: ${err.message || "Unknown error"}`]);
    } finally {
      setIsReviewing(false);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput([]);

    try {
      // Simulate code execution (in production, use a sandbox API)
      if (language === "javascript" || language === "typescript") {
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: any[]) => logs.push(args.map(String).join(" ")),
          error: (...args: any[]) =>
            logs.push(`ERROR: ${args.map(String).join(" ")}`),
          warn: (...args: any[]) =>
            logs.push(`WARN: ${args.map(String).join(" ")}`),
        };

        try {
          const fn = new Function("console", code);
          fn(mockConsole);
        } catch (err: any) {
          logs.push(`Runtime Error: ${err.message}`);
        }

        setOutput(logs.length > 0 ? logs : ["No output."]);
      } else if (language === "python") {
        // Simulate Python output
        setOutput([
          "F(0) = 0",
          "F(1) = 1",
          "F(2) = 1",
          "F(3) = 2",
          "F(4) = 3",
          "F(5) = 5",
          "F(6) = 8",
          "F(7) = 13",
          "F(8) = 21",
          "F(9) = 34",
        ]);
      } else if (language === "sql") {
        setOutput([
          "| name    | xp   | level |",
          "|---------|------|-------|",
          "| Charlie | 8900 | 10    |",
          "| Alice   | 5000 | 7     |",
        ]);
      } else if (language === "html") {
        setOutput(["HTML preview would open in a new window."]);
      } else {
        setOutput(["Code execution simulated for demo."]);
      }
    } catch (err: any) {
      setOutput([`Error: ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const resetCode = () => {
    setCode(TEMPLATES[selectedTemplate].code);
    setOutput([]);
  };

  const downloadCode = () => {
    const extensions: Record<Language, string> = {
      javascript: ".js",
      typescript: ".ts",
      python: ".py",
      html: ".html",
      css: ".css",
      json: ".json",
      sql: ".sql",
      bash: ".sh",
    };

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `playground${extensions[language] || ".txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900" : "h-full"}`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          {/* Template Selector */}
          <div className="flex gap-1">
            {TEMPLATES.map((template, i) => (
              <button
                key={template.name}
                onClick={() => handleTemplateChange(i)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedTemplate === i
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300"
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={downloadCode}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={resetCode}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={reviewWithAi}
            disabled={isReviewing || !code.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isReviewing ? "Reviewing..." : "AI Review"}
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {isRunning ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      {/* Editor & Output */}
      <div className="flex-1 flex min-h-0">
        {/* Code Editor */}
        <div className="flex-1 min-w-0">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
            }}
          />
        </div>

        {/* Output Panel */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col bg-gray-900">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-gray-300">Output</span>
          </div>
          <div
            ref={outputRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-sm"
          >
            {output.length === 0 ? (
              <p className="text-gray-500 italic">Click "Run" to see output</p>
            ) : (
              output.map((line, i) => (
                <div
                  key={i}
                  className={`py-0.5 ${
                    line.startsWith("ERROR")
                      ? "text-red-400"
                      : line.startsWith("WARN")
                        ? "text-yellow-400"
                        : "text-green-400"
                  }`}
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for embedding in lesson pages
export function MiniPlayground({
  initialCode,
  language,
}: {
  initialCode: string;
  language: Language;
}) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      setOutput(["Code executed successfully!"]);
      setRunning(false);
    }, 500);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="h-48">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(v) => setCode(v || "")}
          theme="vs-dark"
          options={{
            fontSize: 12,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-t border-gray-700">
        <button
          onClick={run}
          disabled={running}
          className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
        >
          <Play className="w-3 h-3" /> {running ? "Running..." : "Run"}
        </button>
        {output.length > 0 && (
          <span className="text-xs text-green-400">{output[0]}</span>
        )}
      </div>
    </div>
  );
}
