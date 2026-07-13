"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Terminal as TermIcon, 
  Network, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Cpu,
  Code
} from "lucide-react";
import Editor from "@monaco-editor/react";
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  MarkerType 
} from "reactflow";
import "reactflow/dist/style.css";

// CSS for Xterm must be loaded safely
import "xterm/css/xterm.css";

export default function LessonViewer() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  const API_BASE = "http://localhost:4000/api/v1";

  // Page States
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState("");
  const [quizStatus, setQuizStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [labStatus, setLabStatus] = useState<"idle" | "success" | "failed">("idle");
  const [labLogs, setLabLogs] = useState("");
  const [completed, setCompleted] = useState(false);

  // Tab State for Right Panel
  const [activeRightTab, setActiveRightTab] = useState<"simulator" | "tutor">("simulator");

  // AI Coach States
  const [coachQuestion, setCoachQuestion] = useState("");
  const [coachResponse, setCoachResponse] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  // Left-pane Interactive Diagram States
  const [activeCodeNode, setActiveCodeNode] = useState<string | null>(null);
  const [subnetSliderMask, setSubnetSliderMask] = useState("/26");
  const [overflowBytes, setOverflowBytes] = useState(8);

  // 1. Coding Lab States
  const [code, setCode] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("Console idle. Click 'Run Code' to execute your Python script.");

  // 2. Networking Lab States
  const [subnetMask, setSubnetMask] = useState("");
  
  // React Flow state for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([
    { id: "r1", type: "default", data: { label: "🌐 Gateway Router (10.0.0.45)" }, position: { x: 150, y: 50 }, style: { background: "#1a1a1a", border: "1px solid #8b5cf6", color: "#fff", borderRadius: "8px" } },
    { id: "s1", type: "default", data: { label: "🔌 Switch A" }, position: { x: 50, y: 180 }, style: { background: "#1a1a1a", border: "1px solid #10b981", color: "#fff", borderRadius: "8px" } },
    { id: "s2", type: "default", data: { label: "🔌 Switch B" }, position: { x: 250, y: 180 }, style: { background: "#1a1a1a", border: "1px solid #10b981", color: "#fff", borderRadius: "8px" } },
    { id: "h1", type: "output", data: { label: "💻 WebServer" }, position: { x: 50, y: 290 }, style: { background: "#1a1a1a", border: "1px solid #3b82f6", color: "#fff", borderRadius: "8px" } },
    { id: "h2", type: "output", data: { label: "💻 DB Server" }, position: { x: 250, y: 290 }, style: { background: "#1a1a1a", border: "1px solid #3b82f6", color: "#fff", borderRadius: "8px" } }
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: "e1-2", source: "r1", target: "s1", animated: true, style: { stroke: "#8b5cf6" } },
    { id: "e1-3", source: "r1", target: "s2", animated: true, style: { stroke: "#8b5cf6" } },
    { id: "e2-4", source: "s1", target: "h1", animated: true, style: { stroke: "#10b981" } },
    { id: "e3-5", source: "s2", target: "h2", animated: true, style: { stroke: "#10b981" } }
  ]);

  // 3. Cyber Lab (Xterm Terminal Emulator) States
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "StudyAI Secure Linux Exploit Sandbox v1.0",
    "Type 'help' to view available system commands.",
    "cadet@studyai-lab:~$ "
  ]);
  const [cyberFlagInput, setCyberFlagInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Mock Lesson Fallbacks
  const mockLessons: Record<string, any> = {
    "python-helloworld": {
      id: "python-helloworld",
      title: "The Hello World Executable",
      type: "CODING_LAB",
      content: `# Hello World in Python\n\nWelcome to your first programming lab! Python is an interpreted, high-level programming language known for its readability.\n\n### Today's Mission:\nYour goal is to write a script that outputs the text \`Hello, StudyAI!\` to the console.\n\n### Syntax Hint:\n\`\`\`python\nprint("Your text here")\n\`\`\`\n`,
      labConfig: {
        starterCode: "# Write your Python code below\nprint('Hello')",
        solution: "print('Hello, StudyAI!')"
      },
      quizzes: [
        {
          id: "q1",
          question: "Which built-in Python function writes text to the standard console output?",
          options: ["echo()", "printf()", "print()", "system.out()"],
          correctAnswer: "print()"
        }
      ]
    },
    "net-class-c": {
      id: "net-class-c",
      title: "Splitting Class C Subnets",
      type: "NETWORKING_LAB",
      content: `# Class C Subnetwork Design\n\nSubnetting divides a single network range into smaller isolated pieces (subnets) to restrict broadcast traffic and improve IP management.\n\n### Today's Mission:\nYou need to segment the IP range \`192.168.1.0/24\` to yield at least 4 subnet blocks.\n\n1. Review the connection nodes on the topology canvas.\n2. Configure the subnetwork boundaries to accommodate these divisions.\n3. Input the required subnet mask in the configuration panel below.\n`,
      labConfig: {
        networkRange: "192.168.1.0/24",
        requiredSubnets: 4,
        targetMask: "255.255.255.192"
      },
      quizzes: [
        {
          id: "q2",
          question: "What is the subnet mask representation of a /26 prefix block?",
          options: ["255.255.255.0", "255.255.255.192", "255.255.255.240", "255.255.255.252"],
          correctAnswer: "255.255.255.192"
        }
      ]
    },
    "cyber-suid": {
      id: "cyber-suid",
      title: "Exploiting SUID Binaries",
      type: "CYBER_LAB",
      content: `# Linux SUID Privilege Escalation\n\nSUID (Set owner User ID upon execution) is a special type of file permission in Unix-like OS that permits users to run files with the permissions of the file owner.\n\n### Today's Mission:\n1. Inspect the \`/bin/vuln-helper\` executable in the terminal.\n2. Notice the SUID bit is set for the root owner.\n3. Trigger the helper binary using a buffer overflow to read the root flag file at \`/root/flag.txt\`.\n`,
      labConfig: {
        flag: "studyai{suid_priv_escalation_success}",
        environmentImage: "alpine-suid-vuln"
      },
      quizzes: [
        {
          id: "q3",
          question: "Which chmod permission code sets the SUID bit on an executable?",
          options: ["chmod 777", "chmod +x", "chmod u+s", "chmod g+s"],
          correctAnswer: "chmod u+s"
        }
      ]
    }
  };

  // Fetch lesson data
  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await fetch(`${API_BASE}/lessons/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          setLesson(data);
          if (data.type === "CODING_LAB" && data.labConfig) {
            setCode(data.labConfig.starterCode || "# Write code here");
          }
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("API offline, falling back to mock lesson.");
      }

      // Offline mock mapping fallback
      let mockKey = "python-helloworld";
      if (lessonId.includes("subnet") || lessonId.includes("routing") || lessonId === "net-class-c") {
        mockKey = "net-class-c";
      } else if (lessonId.includes("cyber") || lessonId.includes("hacking") || lessonId === "cyber-suid") {
        mockKey = "cyber-suid";
      }

      const mockData = mockLessons[mockKey];
      setLesson(mockData);
      if (mockData.type === "CODING_LAB") {
        setCode(mockData.labConfig.starterCode);
      }
      setLoading(false);
    }
    fetchLesson();
  }, [lessonId]);

  // Terminal Auto Scroll
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#030303] text-white">
        <div className="flex flex-col items-center gap-3">
          <Cpu className="w-10 h-10 text-cyber-purple animate-spin" />
          <p className="text-sm font-semibold tracking-wider text-zinc-400">LOADING SANDBOX ENVIRONMENT...</p>
        </div>
      </div>
    );
  }

  // Quiz evaluation
  const handleQuizVerify = async () => {
    if (!selectedQuizAnswer) return;
    const currentQuiz = lesson.quizzes?.[0];
    if (!currentQuiz) return;

    try {
      const res = await fetch(`${API_BASE}/lessons/${lesson.id}/verify-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQuiz.id, answer: selectedQuizAnswer })
      });
      if (res.ok) {
        const data = await res.json();
        setQuizStatus(data.isCorrect ? "correct" : "incorrect");
        return;
      }
    } catch (err) {
      console.warn("API offline, verifying locally.");
    }

    // Local check fallback
    const isCorrect = currentQuiz.correctAnswer === selectedQuizAnswer;
    setQuizStatus(isCorrect ? "correct" : "incorrect");
  };

  // 1. CODING LAB LOGIC
  const handleRunCode = () => {
    setConsoleOutput("Python executing...\n");
    setTimeout(() => {
      if (code.includes("print('Hello, StudyAI!')") || code.includes('print("Hello, StudyAI!")')) {
        setConsoleOutput(">>> Hello, StudyAI!\n\nProcess finished with exit code 0");
      } else {
        // Output code output or error
        if (code.includes("print(")) {
          // Extract text inside print
          const match = code.match(/print\(['"](.*)['"]\)/);
          const val = match ? match[1] : "";
          setConsoleOutput(`>>> ${val}\n\nProcess finished with exit code 0`);
        } else {
          setConsoleOutput("Console Output: (no stdout captured)\nProcess finished with exit code 0");
        }
      }
    }, 600);
  };

  const handleSubmitCode = async () => {
    setLabStatus("idle");
    setLabLogs("Submitting code to secure test-runner...\n");

    try {
      const res = await fetch(`${API_BASE}/lessons/${lesson.id}/submit-lab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "student-1", submission: { code } })
      });
      if (res.ok) {
        const data = await res.json();
        setLabStatus(data.status === "SUCCESS" ? "success" : "failed");
        setLabLogs(data.logs);
        if (data.status === "SUCCESS") setCompleted(true);
        return;
      }
    } catch (err) {
      console.warn("API offline, submitting locally.");
    }

    // Local validation fallback
    setTimeout(() => {
      const isSuccess = code.includes("print('Hello, StudyAI!')") || code.includes('print("Hello, StudyAI!")');
      if (isSuccess) {
        setLabStatus("success");
        setLabLogs("Test Case 1: print('Hello, StudyAI!') -> Passed.\n\nAll tests completed. Score: 100/100");
        setCompleted(true);
      } else {
        setLabStatus("failed");
        setLabLogs("Test Case 1: print('Hello, StudyAI!') -> Failed.\nActual output was incorrect or missing.");
      }
    }, 800);
  };

  // 2. NETWORKING LAB LOGIC
  const handleSubnetValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLabStatus("idle");
    setLabLogs("Validating route boundaries...\n");

    try {
      const res = await fetch(`${API_BASE}/lessons/${lesson.id}/submit-lab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "student-1", submission: { mask: subnetMask } })
      });
      if (res.ok) {
        const data = await res.json();
        setLabStatus(data.status === "SUCCESS" ? "success" : "failed");
        setLabLogs(data.logs);
        if (data.status === "SUCCESS") setCompleted(true);
        return;
      }
    } catch (err) {
      console.warn("API offline, submitting locally.");
    }

    // Local validation fallback
    setTimeout(() => {
      const isSuccess = subnetMask.trim() === "255.255.255.192";
      if (isSuccess) {
        setLabStatus("success");
        setLabLogs("Topology checks passed. Route maps generated for 4 subnet interfaces.\nGateway interface listening.");
        setCompleted(true);
      } else {
        setLabStatus("failed");
        setLabLogs("Route configuration error: Incompatible subnet mask configuration. Traffic dropped.");
      }
    }, 800);
  };

  // 3. CYBER LAB LOGIC (Terminal commands parsing)
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    const newLogs = [...terminalHistory, `cadet@studyai-lab:~$ ${cmd}`];
    setTerminalInput("");

    // Command parser
    setTimeout(() => {
      let responseLines: string[] = [];
      const parts = cmd.split(" ");
      const baseCmd = parts[0].toLowerCase();

      switch (baseCmd) {
        case "help":
          responseLines = [
            "Available commands:",
            "  help          Show this system manual",
            "  ls            List files in the current working directory",
            "  cat <file>    Inspect text contents of a file",
            "  file <file>   Identify file properties and SUID metadata",
            "  run <file>    Execute binaries"
          ];
          break;
        case "ls":
          responseLines = [
            "total 16",
            "-rwxr-xr-x    1 cadet    cadet         402 Jul  9 00:30 README.txt",
            "-rwsr-xr-x    1 root     root        12480 Jul  9 00:30 vuln-helper"
          ];
          break;
        case "file":
          if (parts[1] === "vuln-helper") {
            responseLines = ["vuln-helper: setuid ELF 64-bit LSB executable, owner: root"];
          } else {
            responseLines = ["Usage: file <filename>"];
          }
          break;
        case "cat":
          if (parts[1] === "README.txt") {
            responseLines = [
              "Vulnerability Scope:",
              "The binary 'vuln-helper' runs with root privileges via SUID.",
              "Try running it with a buffer overflow exploit payload to read /root/flag.txt."
            ];
          } else if (parts[1] === "/root/flag.txt") {
            responseLines = ["cat: /root/flag.txt: Permission denied (Access requires root level)."];
          } else {
            responseLines = [`cat: ${parts[1] || ""}: File not found`];
          }
          break;
        case "run":
          if (parts[1] === "vuln-helper") {
            // Buffer overflow payload trigger check
            const payload = parts.slice(2).join(" ");
            if (payload.includes("A".repeat(16)) || payload.includes("overflow")) {
              responseLines = [
                "[EXPL EXPLOIT CRITICAL TRIGGERED]",
                "SUID bit hijack active. Running with UID 0 (root).",
                "Flag discovered: studyai{suid_priv_escalation_success}"
              ];
            } else {
              responseLines = [
                "vuln-helper: Running standard diagnostics...",
                "Error: Insufficient payload argument size. Access denied."
              ];
            }
          } else {
            responseLines = ["Usage: run vuln-helper [exploit_payload]"];
          }
          break;
        default:
          responseLines = [`sh: ${baseCmd}: command not found`];
      }

      setTerminalHistory(prev => [...prev, ...responseLines, "cadet@studyai-lab:~$ "]);
    }, 200);
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLabStatus("idle");
    setLabLogs("Verifying flag hash...\n");

    try {
      const res = await fetch(`${API_BASE}/lessons/${lesson.id}/submit-lab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "student-1", submission: { flag: cyberFlagInput } })
      });
      if (res.ok) {
        const data = await res.json();
        setLabStatus(data.status === "SUCCESS" ? "success" : "failed");
        setLabLogs(data.logs);
        if (data.status === "SUCCESS") setCompleted(true);
        return;
      }
    } catch (err) {
      console.warn("API offline, verifying flag locally.");
    }

    // Local check fallback
    setTimeout(() => {
      if (cyberFlagInput.trim() === "studyai{suid_priv_escalation_success}") {
        setLabStatus("success");
        setLabLogs("Flag verification complete! +150 XP awarded.");
        setCompleted(true);
      } else {
        setLabStatus("failed");
        setLabLogs("Access Denied: Invalid flag hash submission.");
      }
    }, 800);
  };

  const handleCoachAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachQuestion.trim()) return;

    setCoachLoading(true);
    setCoachResponse("");

    try {
      const context = `Lesson: ${lesson?.title}. Type: ${lesson?.type}. Current workspace code: ${code || 'None'}. Subnet mask entered: ${subnetMask || 'None'}.`;
      const res = await fetch(`${API_BASE}/ai/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: coachQuestion, context })
      });
      if (res.ok) {
        const data = await res.json();
        setCoachResponse(data.explanation);
      } else {
        setCoachResponse("Coach error: Received error response from backend AI service.");
      }
    } catch (err) {
      setCoachResponse("Coach error: Backend AI server is offline. Please start the server or verify your settings.");
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#030303] text-zinc-200">
      
      {/* 1. TOP CONTROL BAR */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="p-2 rounded-lg hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Active Sandbox Lab</span>
            <h1 className="text-sm font-bold text-white leading-tight">{lesson?.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {completed ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-cyber-green/10 border border-cyber-green/30 text-cyber-green rounded-full text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Lab Complete (+150 XP)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>In Progress</span>
            </div>
          )}
        </div>
      </header>

      {/* 2. SPLIT LAYOUT PANEL */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: MDX Content & Quiz (50% width) */}
        <div className="w-1/2 flex flex-col border-r border-zinc-800 bg-zinc-950/20 overflow-y-auto p-6 space-y-8">
          
          {/* Instruction details */}
          <article className="prose prose-invert max-w-none text-zinc-300 text-sm space-y-4">
            {lesson?.content ? (
              // Basic render for markdown headings and text
              lesson.content.split("\n\n").map((para: string, idx: number) => {
                if (para.startsWith("# ")) {
                  return <h1 key={idx} className="text-2xl font-extrabold text-white border-b border-zinc-800 pb-2">{para.replace("# ", "")}</h1>;
                }
                if (para.startsWith("### ")) {
                  return <h3 key={idx} className="text-base font-bold text-white pt-2">{para.replace("### ", "")}</h3>;
                }
                if (para.startsWith("- ") || para.startsWith("1. ")) {
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-1 text-zinc-400">
                      {para.split("\n").map((li, lidx) => (
                        <li key={lidx}>{li.replace(/^(- |\d+\. )/, "")}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx} className="leading-relaxed">{para}</p>;
              })
            ) : null}
          </article>

          {/* Interactive Diagrams Section */}
          <section className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-900/80 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-5 h-5 text-cyber-purple" />
              <span>Interactive Concept Blueprint</span>
            </div>

            {/* Python Diagram */}
            {lesson?.type === "CODING_LAB" && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400">Click on any block of the execution pipeline to inspect what happens under the hood.</p>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                  {[
                    { id: "editor", name: "📝 Code Editor", desc: "User writes Python code (e.g. print()). Monaco handles token highlights." },
                    { id: "runtime", name: "⚙️ Python runtime", desc: "Interpreter compiles code to bytecode and executes it inside sandboxed WASM." },
                    { id: "stdout", name: "📤 stdout Stream", desc: "Standard output stream buffering the outputs before terminal emission." },
                    { id: "console", name: "🖥️ Terminal Console", desc: "Outputs the stream buffer into the user console layout." }
                  ].map((node) => (
                    <button
                      key={node.id}
                      onClick={() => setActiveCodeNode(node.id === activeCodeNode ? null : node.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${activeCodeNode === node.id ? "bg-cyber-purple/10 border-cyber-purple text-cyber-purple" : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"}`}
                    >
                      {node.name}
                    </button>
                  ))}
                </div>
                {activeCodeNode && (
                  <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl text-xs text-zinc-300 animate-fade-in">
                    { [
                      { id: "editor", name: "📝 Code Editor", desc: "User writes Python code (e.g. print()). Monaco handles token highlights." },
                      { id: "runtime", name: "⚙️ Python runtime", desc: "Interpreter compiles code to bytecode and executes it inside sandboxed WASM." },
                      { id: "stdout", name: "📤 stdout Stream", desc: "Standard output stream buffering the outputs before terminal emission." },
                      { id: "console", name: "🖥️ Terminal Console", desc: "Outputs the stream buffer into the user console layout." }
                    ].find(n => n.id === activeCodeNode)?.desc }
                  </div>
                )}
              </div>
            )}

            {/* Networking Diagram */}
            {lesson?.type === "NETWORKING_LAB" && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400">Toggle CIDR boundaries to see how subnetwork divisions impact host allocations.</p>
                <div className="flex gap-2">
                  {["/24", "/26", "/30"].map((mask) => (
                    <button
                      key={mask}
                      onClick={() => setSubnetSliderMask(mask)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${subnetSliderMask === mask ? "bg-cyber-green/10 border-cyber-green text-cyber-green" : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"}`}
                    >
                      {mask} Subnet
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-zinc-300">Subnet Mask:</span>
                    <span className="font-mono text-cyber-green">
                      {subnetSliderMask === "/24" && "255.255.255.0"}
                      {subnetSliderMask === "/26" && "255.255.255.192"}
                      {subnetSliderMask === "/30" && "255.255.255.252"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-zinc-300">Usable IPs per Subnet:</span>
                    <span className="font-mono text-zinc-300">
                      {subnetSliderMask === "/24" && "254 hosts"}
                      {subnetSliderMask === "/26" && "62 hosts"}
                      {subnetSliderMask === "/30" && "2 hosts (WAN standard)"}
                    </span>
                  </div>

                  {/* Range Bar visualization */}
                  <div className="h-4 w-full bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-800">
                    {subnetSliderMask === "/24" && (
                      <div className="w-full h-full bg-cyber-green/30 flex items-center justify-center text-[8px] font-bold text-cyber-green">
                        1 Single Subnet Range (256 IPs)
                      </div>
                    )}
                    {subnetSliderMask === "/26" && (
                      <>
                        <div className="w-1/4 h-full bg-cyber-green/30 border-r border-zinc-950 flex items-center justify-center text-[8px] font-bold text-cyber-green">Net 1</div>
                        <div className="w-1/4 h-full bg-cyber-green/10 border-r border-zinc-950 flex items-center justify-center text-[8px] font-bold text-zinc-500">Net 2</div>
                        <div className="w-1/4 h-full bg-cyber-green/10 border-r border-zinc-950 flex items-center justify-center text-[8px] font-bold text-zinc-500">Net 3</div>
                        <div className="w-1/4 h-full bg-cyber-green/10 flex items-center justify-center text-[8px] font-bold text-zinc-500">Net 4</div>
                      </>
                    )}
                    {subnetSliderMask === "/30" && (
                      <div className="w-full h-full bg-cyber-green/5 flex items-center justify-center text-[8px] font-bold text-zinc-650">
                        64 Micro Subnets (4 IPs each)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Cybersecurity Diagram */}
            {lesson?.type === "CYBER_LAB" && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400">Adjust the payload size slider to simulate memory stack allocation and SUID shell hijacking.</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Payload Size:</span>
                    <span className={overflowBytes >= 20 ? "text-red-400 font-mono" : "text-cyber-blue font-mono"}>
                      {overflowBytes} Bytes / 24 Limit
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={overflowBytes}
                    onChange={(e) => setOverflowBytes(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyber-blue"
                  />
                </div>

                {/* Stack cells visualization */}
                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Active Stack Memory Allocation</span>
                  <div className="grid grid-cols-6 gap-2 text-center text-[9px] font-bold font-mono">
                    {/* Buffer cells (16 bytes) */}
                    {[0, 4, 8, 12].map((start) => {
                      const filled = overflowBytes >= start + 4;
                      return (
                        <div
                          key={start}
                          className={`col-span-2 p-2.5 rounded-xl border transition-all ${filled ? "bg-cyber-blue/10 border-cyber-blue text-cyber-blue" : "bg-zinc-900/40 border-zinc-800 text-zinc-500"}`}
                        >
                          <div>Buffer[{start}-{start+3}]</div>
                          <div className="text-[7px] mt-1">{filled ? "AAAA" : "empty"}</div>
                        </div>
                      );
                    })}

                    {/* Saved EBP (4 bytes) */}
                    <div className={`col-span-3 p-2.5 rounded-xl border transition-all ${overflowBytes >= 20 ? "bg-cyber-blue/10 border-cyber-blue text-cyber-blue" : overflowBytes >= 17 ? "bg-amber-500/10 border-amber-500/40 text-amber-500" : "bg-zinc-900/40 border-zinc-800 text-zinc-500"}`}>
                      <div>Saved EBP</div>
                      <div className="text-[7px] mt-1">
                        {overflowBytes >= 20 ? "AAAA" : overflowBytes >= 17 ? "Partial" : "main_ebp"}
                      </div>
                    </div>

                    {/* Return Address EIP (4 bytes) */}
                    <div className={`col-span-3 p-2.5 rounded-xl border transition-all ${overflowBytes >= 24 ? "bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse" : "bg-zinc-900/40 border-zinc-800 text-zinc-500"}`}>
                      <div>Return (EIP)</div>
                      <div className="text-[7px] mt-1 font-bold">
                        {overflowBytes >= 24 ? "studyai_exploit()" : "main_return()"}
                      </div>
                    </div>
                  </div>
                  {overflowBytes >= 24 && (
                    <div className="p-2 bg-red-950/20 border border-red-900/50 rounded-xl text-center text-[10px] text-red-400 font-bold animate-fade-in">
                      ⚠️ EXPLOIT TRIGGERED: Saved instruction pointer hijacked to SUID shell!
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* QUIZ PORTION */}
          {lesson?.quizzes && lesson.quizzes.length > 0 && (
            <section className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <HelpCircle className="w-5 h-5 text-cyber-purple" />
                <span>Concept Checkpoint</span>
              </div>
              
              <p className="text-xs text-zinc-300 font-medium">{lesson.quizzes[0].question}</p>
              
              <div className="space-y-2">
                {lesson.quizzes[0].options.map((opt: string, oIdx: number) => (
                  <button 
                    key={oIdx}
                    onClick={() => {
                      if (quizStatus === "idle") setSelectedQuizAnswer(opt);
                    }}
                    disabled={quizStatus === "correct"}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs text-left transition-all ${quizStatus === "correct" && opt === lesson.quizzes[0].correctAnswer ? "bg-cyber-green/10 border-cyber-green/30 text-cyber-green" : opt === selectedQuizAnswer ? "bg-cyber-purple/10 border-cyber-purple/40 text-cyber-purple font-medium" : "bg-zinc-900/30 border-zinc-800/60 hover:border-zinc-700/60 text-zinc-300"}`}
                  >
                    <span>{opt}</span>
                    {quizStatus === "correct" && opt === lesson.quizzes[0].correctAnswer && <CheckCircle className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              {quizStatus === "idle" && (
                <button 
                  onClick={handleQuizVerify}
                  disabled={!selectedQuizAnswer}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Verify Answer
                </button>
              )}

              {quizStatus === "correct" && (
                <div className="text-xs text-cyber-green font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified! You solved the checkpoint.</span>
                </div>
              )}

              {quizStatus === "incorrect" && (
                <div className="space-y-2">
                  <div className="text-xs text-red-400 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Incorrect. Let's try again!</span>
                  </div>
                  <button 
                    onClick={() => { setSelectedQuizAnswer(""); setQuizStatus("idle"); }}
                    className="text-[10px] text-zinc-400 underline hover:text-zinc-200"
                  >
                    Clear Choice
                  </button>
                </div>
              )}
            </section>
          )}
        </div>

        {/* RIGHT PANEL: Interactive Simulator (50% width) */}
        <div className="w-1/2 flex flex-col bg-[#050505] overflow-hidden">
          
          {/* Tab Selection */}
          <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-950">
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveRightTab("simulator")}
                className={`h-10 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${activeRightTab === "simulator" ? "border-cyber-purple text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
              >
                {lesson?.type === "CODING_LAB" && <Code className="w-3.5 h-3.5" />}
                {lesson?.type === "NETWORKING_LAB" && <Network className="w-3.5 h-3.5" />}
                {lesson?.type === "CYBER_LAB" && <ShieldAlert className="w-3.5 h-3.5" />}
                <span>Interactive Simulator</span>
              </button>
              <button 
                onClick={() => setActiveRightTab("tutor")}
                className={`h-10 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${activeRightTab === "tutor" ? "border-cyber-purple text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyber-purple" />
                <span>AI Tutor Coach</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {activeRightTab === "simulator" && (
              <>
                {/* 1. CODING SIMULATOR */}
                {lesson?.type === "CODING_LAB" && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 relative border-b border-zinc-850">
                      <Editor
                        height="100%"
                        language="python"
                        theme="vs-dark"
                        value={code}
                        onChange={(val) => setCode(val || "")}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          lineNumbers: "on",
                          scrollbar: { vertical: "visible" }
                        }}
                      />
                    </div>
                    
                    {/* Execution and Submission controls */}
                    <div className="h-48 flex flex-col bg-zinc-950">
                      <div className="h-9 px-4 border-b border-zinc-850 flex items-center justify-between text-xs font-bold text-zinc-400">
                        <span>Console Output</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleRunCode}
                            className="text-cyber-purple hover:text-cyber-purple/80 flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Run Script</span>
                          </button>
                          <button 
                            onClick={handleSubmitCode}
                            className="text-cyber-green hover:text-cyber-green/80 flex items-center gap-1 cursor-pointer ml-3"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Submit Solution</span>
                          </button>
                        </div>
                      </div>
                      <pre className="flex-1 p-4 overflow-y-auto font-mono text-[11px] text-zinc-400 leading-relaxed bg-[#030303]">
                        {consoleOutput}
                      </pre>
                    </div>
                  </div>
                )}

                {/* 2. NETWORKING SIMULATOR */}
                {lesson?.type === "NETWORKING_LAB" && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* React Flow canvas */}
                    <div className="flex-1 bg-zinc-950 relative border-b border-zinc-850">
                      <ReactFlow 
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                      >
                        <Background color="#222" gap={20} size={1} />
                        <Controls style={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff" }} />
                      </ReactFlow>
                    </div>

                    {/* Subnet Configuration Panel */}
                    <div className="h-44 bg-zinc-950 p-4 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Subnet Interface Configuration</span>
                        <h4 className="text-xs font-bold text-zinc-300">Set Network boundaries on Interface \`GE0/0/0\`</h4>
                      </div>

                      <form onSubmit={handleSubnetValidate} className="flex gap-3 items-center">
                        <div className="flex-1 relative">
                          <input 
                            type="text"
                            value={subnetMask}
                            onChange={(e) => setSubnetMask(e.target.value)}
                            placeholder="Set Subnet Mask (e.g. 255.255.255.0)"
                            className="w-full h-10 px-3 rounded-xl bg-[#030303] border border-zinc-800 text-xs font-mono text-zinc-300 placeholder-zinc-700 focus:border-cyber-green focus:outline-none transition-all"
                          />
                        </div>
                        <button 
                          type="submit"
                          className="h-10 px-5 bg-cyber-green hover:bg-cyber-green/90 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          Validate Subnet
                        </button>
                      </form>

                      {/* Display logs */}
                      <pre className="text-[9px] font-mono text-zinc-500 mt-2">
                        {labLogs || "System diagnostics idle. Input mask configuration and validate."}
                      </pre>
                    </div>
                  </div>
                )}

                {/* 3. CYBER EXPLOIT TERMINAL */}
                {lesson?.type === "CYBER_LAB" && (
                  <div className="flex-1 flex flex-col overflow-hidden bg-black">
                    
                    {/* Simulated terminal shell */}
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-cyber-green space-y-2 bg-[#020202]">
                      {terminalHistory.map((line, lIdx) => (
                        <div key={lIdx} className="leading-relaxed whitespace-pre-wrap">
                          {line}
                        </div>
                      ))}
                      <form onSubmit={handleTerminalSubmit} className="flex items-center">
                        <span className="text-cyber-green font-mono mr-1">cadet@studyai-lab:~$</span>
                        <input 
                          type="text"
                          value={terminalInput}
                          onChange={(e) => setTerminalInput(e.target.value)}
                          className="flex-1 bg-transparent border-none text-cyber-green focus:outline-none font-mono text-xs caret-cyber-green"
                          autoFocus
                        />
                      </form>
                      <div ref={terminalEndRef} />
                    </div>

                    {/* Flag Submission panel */}
                    <div className="h-32 border-t border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Root Exploitation Flag Verification</span>
                        <h4 className="text-xs font-bold text-zinc-300">Submit the discovered flag string here</h4>
                      </div>

                      <form onSubmit={handleFlagSubmit} className="flex gap-2 items-center">
                        <input 
                          type="text"
                          value={cyberFlagInput}
                          onChange={(e) => setCyberFlagInput(e.target.value)}
                          placeholder="studyai{flag_hash}"
                          className="flex-1 h-9 px-3 rounded-lg bg-[#030303] border border-zinc-800 text-xs font-mono text-zinc-300 placeholder-zinc-700 focus:border-cyber-blue focus:outline-none transition-all"
                        />
                        <button 
                          type="submit"
                          className="h-9 px-4 bg-cyber-blue hover:bg-cyber-blue/90 text-zinc-950 font-bold text-xs rounded-lg transition-all cursor-pointer"
                        >
                          Submit Flag
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* AI TUTOR COACH SIDEBAR VIEW */}
            {activeRightTab === "tutor" && (
              <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950/20 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyber-purple/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-cyber-purple" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Explainer & Guide</h3>
                    <p className="text-[10px] text-zinc-500">Evaluating: {lesson?.title}</p>
                  </div>
                </div>

                <div className="flex-1 bg-zinc-900/30 rounded-2xl border border-zinc-800/80 p-4 overflow-y-auto space-y-4 text-xs leading-relaxed text-zinc-300">
                  <p>
                    🤖 **Coach Advice:**
                  </p>
                  {coachResponse ? (
                    <div className="whitespace-pre-wrap leading-relaxed bg-[#030303]/60 p-3 rounded-xl border border-zinc-800">
                      {coachResponse}
                    </div>
                  ) : coachLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-zinc-500">
                      <Cpu className="w-6 h-6 text-cyber-purple animate-spin" />
                      <span>Asking Gemini technical coach...</span>
                    </div>
                  ) : (
                    <>
                      {lesson?.type === "CODING_LAB" && (
                        <div className="space-y-3">
                          <p>
                            To print text in Python, we call the `print()` function, supplying the target string inside quotes as an argument.
                          </p>
                          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-[10px]">
                            print("Hello, StudyAI!")
                          </div>
                          <p className="text-zinc-400">
                            Check that your punctuation (quotes, parentheses) are balanced!
                          </p>
                        </div>
                      )}

                      {lesson?.type === "NETWORKING_LAB" && (
                        <div className="space-y-3">
                          <p>
                            We need to segment a `/24` network into 4 equivalent pieces.
                          </p>
                          <p>
                            To get 4 subnets, we need to borrow **2 host bits** (\(2^2 = 4\)).
                          </p>
                          <p>
                            Adding 2 bits to a `/24` prefix yields a **/26** network. 
                            A `/26` prefix corresponds to a subnet mask of **`255.255.255.192`**.
                          </p>
                        </div>
                      )}

                      {lesson?.type === "CYBER_LAB" && (
                        <div className="space-y-3">
                          <p>
                            The binary `vuln-helper` is owned by root and has SUID permission (`-rwsr-xr-x`).
                          </p>
                          <p>
                            When running, it expects command arguments. If we overflow its buffer size (16 characters) by supplying many characters, we can redirect execution to spawn a shell or output flags directly.
                          </p>
                          <p className="text-zinc-400">
                            Try running: `run vuln-helper AAAAAAAAAAAAAAAAAAAAAAAAAAAAA` in the console!
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Question form */}
                <form onSubmit={handleCoachAsk} className="flex gap-2">
                  <input 
                    type="text"
                    value={coachQuestion}
                    onChange={(e) => setCoachQuestion(e.target.value)}
                    placeholder="Ask coach: e.g. Why /26? or print syntax"
                    className="flex-1 h-9 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-350 placeholder-zinc-750 focus:border-cyber-purple focus:outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={coachLoading}
                    className="px-3 rounded-lg bg-cyber-purple hover:bg-cyber-purple/90 text-zinc-950 font-bold text-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    Ask
                  </button>
                </form>

                <div className="flex justify-between items-center text-[10px] text-zinc-500">
                  <span>Type a question above for live AI support.</span>
                  {coachResponse && (
                    <button 
                      type="button" 
                      onClick={() => { setCoachResponse(""); setCoachQuestion(""); }}
                      className="text-cyber-purple hover:underline"
                    >
                      Reset Coach
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Success Overlay Panel */}
            {labStatus === "success" && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 text-center space-y-6 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-cyber-green/10 border-2 border-cyber-green flex items-center justify-center text-cyber-green shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">Lab Completed Successfully!</h3>
                  <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                    You have successfully passed all evaluation test cases and achieved the learning checkpoint!
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center gap-3">
                  <Award className="w-5 h-5 text-cyber-purple" />
                  <div className="text-left text-xs font-semibold text-zinc-300">
                    <span>+150 XP Earned</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setLabStatus("idle")}
                    className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-400 rounded-xl transition-all"
                  >
                    Review Workspace
                  </button>
                  <button 
                    onClick={() => router.push("/")}
                    className="px-5 py-2 bg-gradient-to-r from-cyber-purple to-cyber-blue text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
