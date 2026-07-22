import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { aiApi } from "../services/ai";
import { haptics } from "../services/haptics";
import { FadeInView } from "../components/animations";

interface Language {
  id: string;
  name: string;
  icon: string;
  color: string;
  template: string;
}

const LANGUAGES: Language[] = [
  {
    id: "javascript",
    name: "JavaScript",
    icon: "🟨",
    color: "#F7DF1E",
    template: `// JavaScript Playground
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 10 Fibonacci numbers
const results = [];
for (let i = 0; i < 10; i++) {
  results.push(fibonacci(i));
}

console.log("Fibonacci:", results.join(", "));
console.log("Sum:", results.reduce((a, b) => a + b, 0));`,
  },
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    color: "#3776AB",
    template: `# Python Playground
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Calculate first 10 Fibonacci numbers
results = [fibonacci(i) for i in range(10)]
print(f"Fibonacci: {', '.join(map(str, results))}")
print(f"Sum: {sum(results)}")`,
  },
  {
    id: "typescript",
    name: "TypeScript",
    icon: "🔷",
    color: "#3178C6",
    template: `// TypeScript Playground
interface FibonacciResult {
  sequence: number[];
  sum: number;
}

function calculateFibonacci(n: number): FibonacciResult {
  const sequence: number[] = [];
  for (let i = 0; i < n; i++) {
    sequence.push(i <= 1 ? i : sequence[i-1] + sequence[i-2]);
  }
  return {
    sequence,
    sum: sequence.reduce((a, b) => a + b, 0)
  };
}

const result = calculateFibonacci(10);
console.log("Fibonacci:", result.sequence.join(", "));
console.log("Sum:", result.sum);`,
  },
  {
    id: "sql",
    name: "SQL",
    icon: "🗃️",
    color: "#4479A1",
    template: `-- SQL Playground
CREATE TABLE students (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  xp INT,
  level INT
);

INSERT INTO students VALUES
  (1, 'Alice', 15000, 22),
  (2, 'Bob', 12000, 18),
  (3, 'Charlie', 8500, 14);

-- Query top students
SELECT name, xp, level,
  CASE
    WHEN xp >= 15000 THEN 'Gold'
    WHEN xp >= 10000 THEN 'Silver'
    ELSE 'Bronze'
  END as league
FROM students
ORDER BY xp DESC;`,
  },
  {
    id: "html",
    name: "HTML/CSS",
    icon: "🌐",
    color: "#E34F26",
    template: `<!-- HTML/CSS Playground -->
<!DOCTYPE html>
<html>
<head>
  <style>
    .card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 24px;
      color: white;
      font-family: system-ui;
    }
    .card h2 { margin: 0 0 8px; }
    .card p { opacity: 0.9; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Hello StudyAI!</h2>
    <p>This is a styled card component.</p>
  </div>
</body>
</html>`,
  },
];

export function PlaygroundScreen() {
  const { colors } = useTheme();
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].template);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setSelectedLang(lang);
    setCode(lang.template);
    setOutput("");
    setShowOutput(false);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setShowOutput(true);
    setOutput("Reviewing code...");

    try {
      const result = await aiApi.review(code, selectedLang.id);
      let output = `✅ Code Review (${result.rating}/10):\n\n`;
      if (result.feedback) output += result.feedback + "\n\n";
      if (result.improvements?.length) {
        output += "💡 Improvements:\n";
        result.improvements.forEach((s: string, i: number) => {
          output += `  ${i + 1}. ${s}\n`;
        });
      }
      if (result.securityIssues?.length) {
        output += "\n🔒 Security:\n";
        result.securityIssues.forEach((s: string, i: number) => {
          output += `  ${i + 1}. ${s}\n`;
        });
      }
      setOutput(output);
      haptics.success();
    } catch (error) {
      setOutput(
        `⚠️ Review Failed:\n\n${error instanceof Error ? error.message : "Unknown error occurred. Please check your connection and try again."}`,
      );
    }
    setIsRunning(false);
  };

  const handleReset = () => {
    setCode(selectedLang.template);
    setOutput("");
    setShowOutput(false);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>
          Playground
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: colors.border,
            }}
            onPress={handleReset}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.textSecondary,
              }}
            >
              ↺ Reset
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              {
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: "#10B981",
              },
              isRunning && { opacity: 0.6 },
            ]}
            onPress={handleRun}
            disabled={isRunning}
          >
            <Text
              style={{ fontSize: 13, fontWeight: "700", color: colors.text }}
            >
              {isRunning ? "⏳ Reviewing..." : "▶ Review"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 16, marginBottom: 12 }}
      >
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.id}
            onPress={() => handleLanguageChange(lang)}
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: colors.card,
                borderRadius: 10,
                marginRight: 8,
                borderWidth: 1.5,
                borderColor: colors.border,
              },
              selectedLang.id === lang.id && { borderColor: lang.color },
            ]}
          >
            <Text style={{ fontSize: 16, marginRight: 8 }}>{lang.icon}</Text>
            <Text
              style={[
                { fontSize: 13, fontWeight: "600", color: colors.textMuted },
                selectedLang.id === lang.id && { color: lang.color },
              ]}
            >
              {lang.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View
        style={{
          flex: 1,
          marginHorizontal: 16,
          backgroundColor: "#0D0D0D",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.textSecondary,
            }}
          >
            main.
            {selectedLang.id === "html"
              ? "html"
              : selectedLang.id === "sql"
                ? "sql"
                : selectedLang.id === "typescript"
                  ? "ts"
                  : selectedLang.id === "python"
                    ? "py"
                    : "js"}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>
            {selectedLang.name}
          </Text>
        </View>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator>
          <TextInput
            style={{
              fontFamily: "Courier New",
              fontSize: 13,
              color: colors.textSecondary,
              padding: 14,
              lineHeight: 20,
              minHeight: 300,
            }}
            value={code}
            onChangeText={setCode}
            multiline
            selectTextOnFocus
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </ScrollView>
      </View>

      {showOutput && (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            backgroundColor: "#0A0A0A",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            maxHeight: 180,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 10,
              backgroundColor: colors.card,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#10B981" }}>
              Output
            </Text>
            <TouchableOpacity onPress={() => setShowOutput(false)}>
              <Text style={{ fontSize: 14, color: colors.textMuted }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 14 }} showsVerticalScrollIndicator>
            <Text
              style={{
                fontFamily: "Courier New",
                fontSize: 12,
                color: colors.textSecondary,
                lineHeight: 18,
              }}
            >
              {output}
            </Text>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
