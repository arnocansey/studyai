/**
 * Lightweight Linux-like shell for StudyAI cyber labs.
 * Virtual filesystem + common CLI utilities (no real OS access).
 */

export type ShellFile = {
  type: "file";
  content: string;
  mode: string;
  owner: string;
  group: string;
  size?: number;
};

export type ShellDir = {
  type: "dir";
  mode: string;
  owner: string;
  group: string;
  children: Record<string, ShellNode>;
};

export type ShellNode = ShellFile | ShellDir;

export type ShellState = {
  cwd: string;
  home: string;
  user: string;
  hostname: string;
  env: Record<string, string>;
  history: string[];
  root: ShellDir;
  elevated: boolean;
};

export const CYBER_FLAG = "studyai{suid_priv_escalation_success}";

function dir(
  children: Record<string, ShellNode> = {},
  mode = "drwxr-xr-x",
  owner = "root",
  group = "root",
): ShellDir {
  return { type: "dir", mode, owner, group, children };
}

function file(
  content: string,
  mode = "-rw-r--r--",
  owner = "root",
  group = "root",
): ShellFile {
  return {
    type: "file",
    content,
    mode,
    owner,
    group,
    size: content.length,
  };
}

export function createDefaultFilesystem(): ShellDir {
  return dir({
    bin: dir({
      "vuln-helper": file(
        "ELF binary stub — SUID root helper\n",
        "-rwsr-xr-x",
        "root",
        "root",
      ),
      ls: file("#!/bin/sh\n", "-rwxr-xr-x"),
      cat: file("#!/bin/sh\n", "-rwxr-xr-x"),
      bash: file("#!/bin/bash\n", "-rwxr-xr-x"),
      sh: file("#!/bin/sh\n", "-rwxr-xr-x"),
      sudo: file("#!/bin/sh\n", "-rwsr-xr-x", "root", "root"),
      passwd: file("#!/bin/sh\n", "-rwsr-xr-x", "root", "root"),
    }),
    usr: dir({
      bin: dir({
        env: file("#!/bin/sh\n", "-rwxr-xr-x"),
        printenv: file("#!/bin/sh\n", "-rwxr-xr-x"),
        which: file("#!/bin/sh\n", "-rwxr-xr-x"),
        head: file("#!/bin/sh\n", "-rwxr-xr-x"),
        tail: file("#!/bin/sh\n", "-rwxr-xr-x"),
        wc: file("#!/bin/sh\n", "-rwxr-xr-x"),
        strings: file("#!/bin/sh\n", "-rwxr-xr-x"),
        file: file("#!/bin/sh\n", "-rwxr-xr-x"),
        hostname: file("#!/bin/sh\n", "-rwxr-xr-x"),
        date: file("#!/bin/sh\n", "-rwxr-xr-x"),
        uptime: file("#!/bin/sh\n", "-rwxr-xr-x"),
        find: file("#!/bin/sh\n", "-rwxr-xr-x"),
        grep: file("#!/bin/sh\n", "-rwxr-xr-x"),
        ps: file("#!/bin/sh\n", "-rwxr-xr-x"),
        ping: file("#!/bin/sh\n", "-rwxr-xr-x"),
        curl: file("#!/bin/sh\n", "-rwxr-xr-x"),
        wget: file("#!/bin/sh\n", "-rwxr-xr-x"),
        chmod: file("#!/bin/sh\n", "-rwxr-xr-x"),
        touch: file("#!/bin/sh\n", "-rwxr-xr-x"),
        mkdir: file("#!/bin/sh\n", "-rwxr-xr-x"),
        rm: file("#!/bin/sh\n", "-rwxr-xr-x"),
        cp: file("#!/bin/sh\n", "-rwxr-xr-x"),
        mv: file("#!/bin/sh\n", "-rwxr-xr-x"),
        echo: file("#!/bin/sh\n", "-rwxr-xr-x"),
        clear: file("#!/bin/sh\n", "-rwxr-xr-x"),
      }),
      share: dir({
        doc: dir({
          studyai: dir({
            "lab-notes.txt": file(
              "SUID labs: look for the 's' bit with ls -l and find -perm -4000.\n",
            ),
          }),
        }),
      }),
    }),
    etc: dir({
      hostname: file("studyai-lab\n"),
      passwd: file(
        [
          "root:x:0:0:root:/root:/bin/bash",
          "cadet:x:1000:1000:StudyAI Cadet:/home/cadet:/bin/bash",
          "daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin",
          "www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin",
          "",
        ].join("\n"),
      ),
      group: file(
        ["root:x:0:", "cadet:x:1000:", "sudo:x:27:cadet", ""].join("\n"),
      ),
      hosts: file(
        "127.0.0.1 localhost\n10.0.0.5 studyai-lab\n10.0.0.10 target.lab\n",
      ),
      os_release: file(
        'NAME="StudyAI Linux"\nVERSION="1.0"\nID=studyai\nPRETTY_NAME="StudyAI Linux 1.0 (Sandbox)"\n',
      ),
      shadow: file(
        "root:*:19000:0:99999:7:::\ncadet:*:19000:0:99999:7:::\n",
        "-rw-------",
        "root",
        "shadow",
      ),
    }),
    home: dir({
      cadet: dir(
        {
          "README.txt": file(
            [
              "Vulnerability Scope:",
              "The binary 'vuln-helper' (also at /bin/vuln-helper) runs with root privileges via SUID.",
              "Try running it with a buffer overflow exploit payload to read /root/flag.txt.",
              "",
              "Hints:",
              "  ls -la",
              "  find / -perm -4000 2>/dev/null",
              "  file vuln-helper",
              "  ./vuln-helper AAAAAAAAAAAAAAAA",
              "  or: run vuln-helper overflow",
              "",
            ].join("\n"),
            "-rw-r--r--",
            "cadet",
            "cadet",
          ),
          "vuln-helper": file(
            "ELF binary stub — SUID root helper\n",
            "-rwsr-xr-x",
            "root",
            "root",
          ),
          ".bashrc": file(
            "export PATH=/usr/bin:/bin\n",
            "-rw-r--r--",
            "cadet",
            "cadet",
          ),
          ".bash_history": file(
            "ls -la\ncat README.txt\nfind / -perm -4000 2>/dev/null\n",
            "-rw-------",
            "cadet",
            "cadet",
          ),
          notes: dir(
            {
              "todo.md": file(
                "- Enumerate SUID binaries\n- Capture root flag\n",
                "-rw-r--r--",
                "cadet",
                "cadet",
              ),
            },
            "drwxr-xr-x",
            "cadet",
            "cadet",
          ),
        },
        "drwxr-xr-x",
        "cadet",
        "cadet",
      ),
    }),
    root: dir(
      {
        "flag.txt": file(`${CYBER_FLAG}\n`, "-rw-------", "root", "root"),
        ".bash_history": file(
          "chmod u+s /bin/vuln-helper\n",
          "-rw-------",
          "root",
          "root",
        ),
      },
      "drwx------",
      "root",
      "root",
    ),
    tmp: dir({}, "drwxrwxrwt", "root", "root"),
    var: dir({
      log: dir({
        syslog: file(
          "Jul 22 10:00:01 studyai-lab kernel: sandbox online\nJul 22 10:01:12 studyai-lab vuln-helper[442]: diagnostics ok\n",
        ),
        auth: file(
          "Jul 22 10:00:01 studyai-lab sudo: cadet : TTY=pts/0 ; USER=root ; COMMAND=/bin/true\n",
        ),
      }),
      www: dir({
        html: dir({
          "index.html": file(
            "<html><body><h1>StudyAI Lab Portal</h1></body></html>\n",
            "-rw-r--r--",
            "www-data",
            "www-data",
          ),
        }),
      }),
    }),
    proc: dir({
      version: file("Linux version 6.8.0-studyai (sandbox)\n"),
      cpuinfo: file(
        "processor\t: 0\nmodel name\t: StudyAI Virtual CPU\ncpu MHz\t\t: 2400.000\n",
      ),
      meminfo: file(
        "MemTotal:        2048000 kB\nMemFree:         1024000 kB\n",
      ),
    }),
    opt: dir({
      studyai: dir({
        tools: dir({
          "enum.sh": file(
            "#!/bin/sh\necho Finding SUID binaries...\nfind / -perm -4000 2>/dev/null\n",
            "-rwxr-xr-x",
            "cadet",
            "cadet",
          ),
        }),
      }),
    }),
  });
}

export function createShellState(): ShellState {
  return {
    cwd: "/home/cadet",
    home: "/home/cadet",
    user: "cadet",
    hostname: "studyai-lab",
    env: {
      HOME: "/home/cadet",
      USER: "cadet",
      LOGNAME: "cadet",
      SHELL: "/bin/bash",
      PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      PWD: "/home/cadet",
      TERM: "xterm-256color",
      LANG: "en_US.UTF-8",
      HOSTNAME: "studyai-lab",
    },
    history: [],
    root: createDefaultFilesystem(),
    elevated: false,
  };
}

function normalizePath(path: string, cwd: string, home: string): string {
  let p = path.trim();
  if (!p) return cwd;
  if (p === "~") p = home;
  else if (p.startsWith("~/")) p = `${home}/${p.slice(2)}`;
  if (!p.startsWith("/")) p = `${cwd}/${p}`;

  const parts = p.split("/");
  const stack: string[] = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return "/" + stack.join("/");
}

function splitPath(abs: string): string[] {
  return abs.split("/").filter(Boolean);
}

function getNode(root: ShellDir, absPath: string): ShellNode | null {
  if (absPath === "/") return root;
  let node: ShellNode = root;
  for (const part of splitPath(absPath)) {
    if (node.type !== "dir") return null;
    const next: ShellNode | undefined = node.children[part];
    if (!next) return null;
    node = next;
  }
  return node;
}

function getParentDir(
  root: ShellDir,
  absPath: string,
): { parent: ShellDir; name: string } | null {
  const parts = splitPath(absPath);
  if (parts.length === 0) return null;
  const name = parts[parts.length - 1];
  const parentPath = "/" + parts.slice(0, -1).join("/");
  const parent = getNode(root, parentPath === "/" ? "/" : parentPath);
  if (!parent || parent.type !== "dir") return null;
  return { parent, name };
}

function canRead(state: ShellState, node: ShellNode, path: string): boolean {
  if (state.elevated || state.user === "root") return true;
  if (path.startsWith("/root")) return false;
  if (path === "/etc/shadow") return false;
  if (node.owner === state.user) return true;
  return node.mode[7] === "r" || node.mode[1] === "r" || node.mode[4] === "r";
}

function expandVars(input: string, env: Record<string, string>): string {
  return input
    .replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, key: string) => env[key] ?? "")
    .replace(
      /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g,
      (_, key: string) => env[key] ?? "",
    );
}

function tokenize(command: string): string[] {
  const tokens: string[] = [];
  let cur = "";
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (cur) {
        tokens.push(cur);
        cur = "";
      }
      continue;
    }
    cur += ch;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

function stripRedirection(tokens: string[]): {
  args: string[];
  suppressStderr: boolean;
} {
  const args: string[] = [];
  let suppressStderr = false;
  for (const token of tokens) {
    if (token === "2>/dev/null" || token === "2>&1") {
      suppressStderr = true;
      continue;
    }
    args.push(token);
  }
  return { args, suppressStderr };
}

function formatListing(name: string, node: ShellNode, long: boolean): string {
  if (!long) return name + (node.type === "dir" ? "/" : "");
  const size = String(
    node.type === "file" ? (node.size ?? node.content.length) : 4096,
  ).padStart(6, " ");
  return `${node.mode} 1 ${node.owner.padEnd(8, " ")} ${node.group.padEnd(8, " ")} ${size} Jul 22 10:00 ${name}`;
}

function findNodes(
  node: ShellNode,
  path: string,
  predicate: (n: ShellNode, p: string) => boolean,
  out: string[],
) {
  if (predicate(node, path)) out.push(path === "" ? "/" : path);
  if (node.type === "dir") {
    for (const [name, child] of Object.entries(node.children)) {
      const childPath = path === "/" ? `/${name}` : `${path}/${name}`;
      findNodes(child, childPath, predicate, out);
    }
  }
}

export function promptFor(state: ShellState): string {
  let display = state.cwd;
  if (display === state.home) display = "~";
  else if (display.startsWith(state.home + "/")) {
    display = "~" + display.slice(state.home.length);
  }
  const symbol = state.elevated || state.user === "root" ? "#" : "$";
  return `${state.user}@${state.hostname}:${display}${symbol}`;
}

export type ShellResult = {
  lines: string[];
  clear?: boolean;
  state: ShellState;
};

const HELP_TEXT = [
  "StudyAI sandbox shell — common Linux commands:",
  "",
  "Navigation:  pwd, cd, ls [-la], tree",
  "Files:       cat, head, tail, less, more, touch, mkdir, rm, cp, mv",
  "             echo, find, grep, wc, file, strings, which, type",
  "System:      whoami, id, uname [-a], hostname, date, uptime",
  "             env, printenv, export, history, clear, man, help",
  "Process:     ps, chmod, sudo -l, groups",
  "Network:     ping, ifconfig, ip, netstat, ss, curl, wget",
  "Exploit:     ./vuln-helper <payload>, run vuln-helper <payload>",
  "             find / -perm -4000 2>/dev/null",
  "",
  "Tip: read ~/README.txt for the mission briefing.",
];

function runVulnHelper(state: ShellState, payload: string): ShellResult {
  const ok =
    payload.includes("A".repeat(16)) ||
    payload.toLowerCase().includes("overflow") ||
    payload.includes("%p") ||
    payload.length >= 24;

  if (ok) {
    state.elevated = true;
    state.user = "root";
    state.env.USER = "root";
    state.env.LOGNAME = "root";
    state.env.HOME = "/root";
    return {
      state,
      lines: [
        "[CRITICAL] Buffer overflow triggered — SUID hijack active",
        "Effective UID: 0 (root)",
        `Flag discovered: ${CYBER_FLAG}`,
        "You can now read /root/flag.txt",
      ],
    };
  }

  return {
    state,
    lines: [
      "vuln-helper: Running standard diagnostics...",
      "Error: Insufficient payload argument size. Access denied.",
      "Hint: try a longer overflow payload (16+ 'A's) or the word 'overflow'.",
    ],
  };
}

export function executeCommand(
  state: ShellState,
  rawInput: string,
): ShellResult {
  const input = rawInput.trim();
  if (!input) return { state, lines: [] };

  state.history.push(input);
  const expanded = expandVars(input, state.env);
  const primary = expanded.split("|")[0].trim();
  const { args: tokens, suppressStderr } = stripRedirection(tokenize(primary));
  if (tokens.length === 0) return { state, lines: [] };

  let cmd = tokens[0];
  let args = tokens.slice(1);

  if (cmd.startsWith("./") || cmd.startsWith("/")) {
    const abs = normalizePath(cmd, state.cwd, state.home);
    const base = abs.split("/").pop() || "";
    if (base === "vuln-helper") {
      return runVulnHelper(state, args.join(" "));
    }
    const node = getNode(state.root, abs);
    if (!node) {
      return { state, lines: [`bash: ${cmd}: No such file or directory`] };
    }
    if (node.type === "dir") {
      return { state, lines: [`bash: ${cmd}: Is a directory`] };
    }
    if (!node.mode.includes("x")) {
      return { state, lines: [`bash: ${cmd}: Permission denied`] };
    }
    if (abs.endsWith(".sh") || node.content.startsWith("#!")) {
      return {
        state,
        lines: node.content
          .split("\n")
          .filter((l) => l && !l.startsWith("#!"))
          .slice(0, 20),
      };
    }
    cmd = base;
  }

  const out = (lines: string[]): ShellResult => ({ state, lines });

  switch (cmd) {
    case "help":
      return out(HELP_TEXT);
    case "man":
      return out([
        `NAME`,
        `       ${args[0] || "help"} — sandbox documentation`,
        `DESCRIPTION`,
        `       Type 'help' for the full command list.`,
      ]);
    case "clear":
    case "cls":
      return { state, lines: [], clear: true };
    case "pwd":
      return out([state.cwd]);
    case "whoami":
      return out([state.user]);
    case "hostname":
      return out([state.hostname]);
    case "date":
      return out([new Date().toUTCString()]);
    case "uptime":
      return out([
        ` ${new Date().toTimeString().slice(0, 8)} up 2:14,  1 user,  load average: 0.08, 0.03, 0.01`,
      ]);
    case "uname":
      return out(
        args.includes("-a") || args.includes("--all")
          ? [
              "Linux studyai-lab 6.8.0-studyai #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux",
            ]
          : ["Linux"],
      );
    case "id":
    case "groups":
      return out(
        state.user === "root" || state.elevated
          ? ["uid=0(root) gid=0(root) groups=0(root)"]
          : ["uid=1000(cadet) gid=1000(cadet) groups=1000(cadet),27(sudo)"],
      );
    case "env":
    case "printenv":
      if (args[0]) return out([state.env[args[0]] ?? ""]);
      return out(Object.entries(state.env).map(([k, v]) => `${k}=${v}`));
    case "export": {
      if (!args[0]) return out([]);
      const [key, ...rest] = args[0].split("=");
      if (key) state.env[key] = rest.join("=") || args[1] || "";
      return out([]);
    }
    case "echo":
      return out([args.join(" ")]);
    case "history":
      return out(
        state.history.map(
          (h, i) => `  ${String(i + 1).padStart(4, " ")}  ${h}`,
        ),
      );
    case "cd": {
      const target = normalizePath(
        args[0] || state.home,
        state.cwd,
        state.home,
      );
      const node = getNode(state.root, target);
      if (!node) {
        return out([`bash: cd: ${args[0]}: No such file or directory`]);
      }
      if (node.type !== "dir") {
        return out([`bash: cd: ${args[0]}: Not a directory`]);
      }
      if (
        target.startsWith("/root") &&
        !state.elevated &&
        state.user !== "root"
      ) {
        return out([`bash: cd: ${args[0]}: Permission denied`]);
      }
      state.cwd = target;
      state.env.PWD = target;
      return out([]);
    }
    case "ls": {
      const flags = args.filter((a) => a.startsWith("-")).join("");
      const pathArg = args.find((a) => !a.startsWith("-")) || ".";
      const long = flags.includes("l");
      const all = flags.includes("a");
      const target = normalizePath(pathArg, state.cwd, state.home);
      const node = getNode(state.root, target);
      if (!node) {
        return out([
          `ls: cannot access '${pathArg}': No such file or directory`,
        ]);
      }
      if (node.type === "file") {
        return out([
          formatListing(pathArg.split("/").pop() || pathArg, node, long),
        ]);
      }
      const names = Object.keys(node.children).sort();
      const entries = all ? [".", "..", ...names] : names;
      if (!long) {
        return out([
          entries
            .map((name) => {
              if (name === "." || name === "..") return name;
              return formatListing(name, node.children[name], false);
            })
            .join("  "),
        ]);
      }
      const lines = [`total ${entries.length * 4}`];
      for (const name of entries) {
        if (name === ".") {
          lines.push(formatListing(".", node, true));
        } else if (name === "..") {
          lines.push(
            formatListing("..", dir({}, "drwxr-xr-x", "root", "root"), true),
          );
        } else {
          lines.push(formatListing(name, node.children[name], true));
        }
      }
      return out(lines);
    }
    case "tree": {
      const target = normalizePath(args[0] || ".", state.cwd, state.home);
      const node = getNode(state.root, target);
      if (!node || node.type !== "dir") {
        return out([`tree: ${args[0] || "."}: Not a directory`]);
      }
      const lines = [target];
      const walk = (d: ShellDir, prefix: string) => {
        const names = Object.keys(d.children).sort();
        names.forEach((name, idx) => {
          const last = idx === names.length - 1;
          const child = d.children[name];
          lines.push(
            `${prefix}${last ? "└── " : "├── "}${name}${child.type === "dir" ? "/" : ""}`,
          );
          if (child.type === "dir") {
            walk(child, prefix + (last ? "    " : "│   "));
          }
        });
      };
      walk(node, "");
      return out(lines);
    }
    case "cat":
    case "less":
    case "more":
    case "head":
    case "tail": {
      if (!args[0]) return out([`${cmd}: missing file operand`]);
      const target = normalizePath(args[0], state.cwd, state.home);
      const node = getNode(state.root, target);
      if (!node) {
        return out([`${cmd}: ${args[0]}: No such file or directory`]);
      }
      if (node.type === "dir") {
        return out([`${cmd}: ${args[0]}: Is a directory`]);
      }
      if (!canRead(state, node, target)) {
        return out([`${cmd}: ${args[0]}: Permission denied`]);
      }
      let lines = node.content.replace(/\n$/, "").split("\n");
      if (cmd === "head") lines = lines.slice(0, 10);
      if (cmd === "tail") lines = lines.slice(-10);
      return out(lines);
    }
    case "wc": {
      if (!args[0]) return out(["wc: missing file operand"]);
      const target = normalizePath(args[0], state.cwd, state.home);
      const node = getNode(state.root, target);
      if (!node || node.type !== "file") {
        return out([`wc: ${args[0]}: No such file or directory`]);
      }
      if (!canRead(state, node, target)) {
        return out([`wc: ${args[0]}: Permission denied`]);
      }
      const text = node.content;
      const lines =
        text === "" ? 0 : text.replace(/\n$/, "").split("\n").length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      return out([` ${lines} ${words} ${text.length} ${args[0]}`]);
    }
    case "file": {
      if (!args[0]) return out(["file: missing operand"]);
      const target = normalizePath(args[0], state.cwd, state.home);
      const node = getNode(state.root, target);
      if (!node) {
        return out([`${args[0]}: cannot open (No such file or directory)`]);
      }
      if (node.type === "dir") return out([`${args[0]}: directory`]);
      if (node.mode.includes("s")) {
        return out([
          `${args[0]}: setuid ELF 64-bit LSB executable, owner: ${node.owner}`,
        ]);
      }
      if (node.content.startsWith("#!")) {
        return out([
          `${args[0]}: Bourne-Again shell script, ASCII text executable`,
        ]);
      }
      return out([`${args[0]}: ASCII text`]);
    }
    case "strings": {
      if (!args[0]) return out(["strings: missing file operand"]);
      const target = normalizePath(args[0], state.cwd, state.home);
      const node = getNode(state.root, target);
      if (!node || node.type !== "file") {
        return out([`strings: ${args[0]}: No such file`]);
      }
      if (target.includes("vuln-helper")) {
        return out([
          "/lib64/ld-linux-x86-64.so.2",
          "diagnostics",
          "Insufficient payload",
          "/root/flag.txt",
          CYBER_FLAG,
          "overflow",
        ]);
      }
      return out(
        node.content
          .split(/\s+/)
          .filter((w) => w.length >= 4)
          .slice(0, 20),
      );
    }
    case "which":
    case "type": {
      const name = args[0];
      if (!name) return out([`${cmd}: missing operand`]);
      for (const dirPath of (state.env.PATH || "").split(":")) {
        const candidate = `${dirPath}/${name}`.replace(/\/+/g, "/");
        if (getNode(state.root, candidate)) {
          return out([cmd === "type" ? `${name} is ${candidate}` : candidate]);
        }
      }
      return out(cmd === "type" ? [`bash: type: ${name}: not found`] : []);
    }
    case "find": {
      const startArg =
        args.find((a) => !a.startsWith("-") && a !== "2>/dev/null") || ".";
      const start = normalizePath(startArg, state.cwd, state.home);
      const nameIdx = args.indexOf("-name");
      const namePat =
        nameIdx >= 0
          ? args[nameIdx + 1]?.replace(/^\*/, "").replace(/\*$/, "")
          : null;
      const permIdx = args.indexOf("-perm");
      const perm = permIdx >= 0 ? args[permIdx + 1] : null;
      const typeIdx = args.indexOf("-type");
      const typeFlag = typeIdx >= 0 ? args[typeIdx + 1] : null;
      const startNode = getNode(state.root, start);
      if (!startNode) {
        return out(
          suppressStderr
            ? []
            : [`find: ‘${startArg}’: No such file or directory`],
        );
      }
      const found: string[] = [];
      findNodes(
        startNode,
        start,
        (n, p) => {
          if (typeFlag === "f" && n.type !== "file") return false;
          if (typeFlag === "d" && n.type !== "dir") return false;
          if (namePat && !p.split("/").pop()?.includes(namePat)) return false;
          if (perm === "-4000" || perm === "/4000") {
            return n.type === "file" && n.mode.includes("s");
          }
          return true;
        },
        found,
      );
      const filtered = found.filter(
        (p) => !(p.startsWith("/root") && !state.elevated),
      );
      return out(filtered);
    }
    case "grep": {
      const flags = args.filter((a) => a.startsWith("-"));
      const nonFlags = args.filter((a) => !a.startsWith("-"));
      const pattern = nonFlags[0];
      const fileArg = nonFlags[1];
      if (!pattern || !fileArg) {
        return out(["Usage: grep [options] PATTERN FILE"]);
      }
      const target = normalizePath(fileArg, state.cwd, state.home);
      const node = getNode(state.root, target);
      if (!node || node.type !== "file") {
        return out([`grep: ${fileArg}: No such file or directory`]);
      }
      if (!canRead(state, node, target)) {
        return out([`grep: ${fileArg}: Permission denied`]);
      }
      const ign = flags.includes("-i");
      return out(
        node.content
          .split("\n")
          .filter((line) =>
            ign
              ? line.toLowerCase().includes(pattern.toLowerCase())
              : line.includes(pattern),
          ),
      );
    }
    case "touch": {
      if (!args[0]) return out(["touch: missing file operand"]);
      const target = normalizePath(args[0], state.cwd, state.home);
      if (getNode(state.root, target)) return out([]);
      const parentInfo = getParentDir(state.root, target);
      if (!parentInfo) {
        return out([
          `touch: cannot touch '${args[0]}': No such file or directory`,
        ]);
      }
      parentInfo.parent.children[parentInfo.name] = file(
        "",
        "-rw-r--r--",
        state.user,
        state.user,
      );
      return out([]);
    }
    case "mkdir": {
      if (!args[0]) return out(["mkdir: missing operand"]);
      const target = normalizePath(args[0], state.cwd, state.home);
      if (getNode(state.root, target)) {
        return out([
          `mkdir: cannot create directory ‘${args[0]}’: File exists`,
        ]);
      }
      const parentInfo = getParentDir(state.root, target);
      if (!parentInfo) {
        return out([
          `mkdir: cannot create directory ‘${args[0]}’: No such file or directory`,
        ]);
      }
      parentInfo.parent.children[parentInfo.name] = dir(
        {},
        "drwxr-xr-x",
        state.user,
        state.user,
      );
      return out([]);
    }
    case "rm": {
      const recursive =
        args.includes("-r") || args.includes("-rf") || args.includes("-fr");
      const pathArg = args.find((a) => !a.startsWith("-"));
      if (!pathArg) return out(["rm: missing operand"]);
      const target = normalizePath(pathArg, state.cwd, state.home);
      const node = getNode(state.root, target);
      if (!node) {
        return out([
          `rm: cannot remove '${pathArg}': No such file or directory`,
        ]);
      }
      if (node.type === "dir" && !recursive) {
        return out([`rm: cannot remove '${pathArg}': Is a directory`]);
      }
      const parentInfo = getParentDir(state.root, target);
      if (!parentInfo) return out([`rm: cannot remove '${pathArg}'`]);
      delete parentInfo.parent.children[parentInfo.name];
      return out([]);
    }
    case "cp":
    case "mv": {
      if (args.length < 2) return out([`${cmd}: missing file operand`]);
      const src = normalizePath(args[0], state.cwd, state.home);
      const dest = normalizePath(args[1], state.cwd, state.home);
      const node = getNode(state.root, src);
      if (!node) {
        return out([
          `${cmd}: cannot stat '${args[0]}': No such file or directory`,
        ]);
      }
      const destParent = getParentDir(state.root, dest);
      if (!destParent) {
        return out([
          `${cmd}: cannot create '${args[1]}': No such file or directory`,
        ]);
      }
      destParent.parent.children[destParent.name] = JSON.parse(
        JSON.stringify(node),
      ) as ShellNode;
      if (cmd === "mv") {
        const srcParent = getParentDir(state.root, src);
        if (srcParent) delete srcParent.parent.children[srcParent.name];
      }
      return out([]);
    }
    case "chmod": {
      if (args.length < 2) return out(["chmod: missing operand"]);
      const mode = args[0];
      const target = normalizePath(args[1], state.cwd, state.home);
      const node = getNode(state.root, target);
      if (!node) {
        return out([
          `chmod: cannot access '${args[1]}': No such file or directory`,
        ]);
      }
      if (mode === "u+s" || mode === "4755" || mode === "+s") {
        if (node.type === "file") node.mode = "-rwsr-xr-x";
      } else if (mode === "+x" || mode === "755") {
        node.mode = node.type === "dir" ? "drwxr-xr-x" : "-rwxr-xr-x";
      } else if (mode === "644" && node.type === "file") {
        node.mode = "-rw-r--r--";
      }
      return out([]);
    }
    case "ps":
      return out([
        "  PID TTY          TIME CMD",
        "    1 pts/0    00:00:00 init",
        "   14 pts/0    00:00:00 bash",
        "  442 pts/0    00:00:00 vuln-helper",
        `  ${Math.floor(Math.random() * 200) + 500} pts/0    00:00:00 ps`,
      ]);
    case "sudo":
      if (args[0] === "-l") {
        return out([
          "User cadet may run the following commands on studyai-lab:",
          "    (ALL) NOPASSWD: /usr/bin/find",
        ]);
      }
      return out([
        "sudo: a password is required (sandbox: use SUID vuln-helper instead)",
      ]);
    case "ping": {
      const host = args.find((a) => !a.startsWith("-")) || "localhost";
      return out([
        `PING ${host} (10.0.0.10) 56(84) bytes of data.`,
        `64 bytes from ${host} (10.0.0.10): icmp_seq=1 ttl=64 time=0.42 ms`,
        `64 bytes from ${host} (10.0.0.10): icmp_seq=2 ttl=64 time=0.38 ms`,
        "",
        `--- ${host} ping statistics ---`,
        "2 packets transmitted, 2 received, 0% packet loss",
      ]);
    }
    case "ifconfig":
    case "ip":
      return out([
        "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500",
        "        inet 10.0.0.5  netmask 255.255.255.0  broadcast 10.0.0.255",
        "        ether 02:42:ac:11:00:05  txqueuelen 1000  (Ethernet)",
        "lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536",
        "        inet 127.0.0.1  netmask 255.0.0.0",
      ]);
    case "netstat":
    case "ss":
      return out([
        "Netid  State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port",
        "tcp    LISTEN  0       128      0.0.0.0:22          0.0.0.0:*",
        "tcp    LISTEN  0       128      0.0.0.0:80          0.0.0.0:*",
        "tcp    ESTAB   0       0        10.0.0.5:22         10.0.0.20:51422",
      ]);
    case "curl":
    case "wget": {
      const url = args.find((a) => !a.startsWith("-")) || "http://target.lab";
      return out([
        `Connecting to ${url.replace(/^https?:\/\//, "").split("/")[0]}... connected.`,
        "HTTP/1.1 200 OK",
        "",
        "<html><body><h1>StudyAI Lab Portal</h1></body></html>",
      ]);
    }
    case "tar":
      return out([
        "tar: sandbox stub — archive operations are simulated only.",
      ]);
    case "gzip":
    case "gunzip":
      return out([`${cmd}: sandbox stub — compression is simulated only.`]);
    case "run":
      if (args[0] === "vuln-helper" || args[0] === "./vuln-helper") {
        return runVulnHelper(state, args.slice(1).join(" "));
      }
      return out(["Usage: run vuln-helper [exploit_payload]"]);
    case "exit":
    case "logout":
      return out(["logout (sandbox session remains attached)"]);
    default:
      return out([`bash: ${cmd}: command not found`]);
  }
}
