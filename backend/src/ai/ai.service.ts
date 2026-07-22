import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StudyPlanInput {
  goal: string;
  currentLevel: "beginner" | "intermediate" | "advanced";
  weeklyHours: number;
  targetDate?: string;
  focusAreas: string[];
}

export interface StudyPlanWeek {
  week: number;
  theme: string;
  objectives: string[];
  activities: string[];
  deliverable: string;
}

export interface StudyPlan {
  goal: string;
  level: string;
  weeklyHours: number;
  durationWeeks: number;
  milestones: string[];
  weeks: StudyPlanWeek[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // ==================== EXPLAIN CONCEPT (Direct) ====================

  async explainConcept(prompt: string, context?: string): Promise<string> {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");

    if (!apiKey) {
      this.logger.warn(
        "GEMINI_API_KEY is not defined. Falling back to local AI Tutor model.",
      );
      return this.getLocalMockExplanation(prompt, context);
    }

    try {
      const systemInstruction = `You are the Lead Technical Coach at StudyAI.
Explain technical concepts, programming issues, networking, or cybersecurity vulnerabilities clearly, concisely, and with practical examples.
Keep your explanations under 150 words. Format with clean markdown.`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemInstruction}\n\nUser Context: ${context || "None"}\n\nUser Question/Code: ${prompt}`,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status code ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        throw new Error("Invalid response structure from Gemini API");
      }

      return textResponse;
    } catch (error) {
      this.logger.error(
        `Error communicating with Gemini API: ${error.message}`,
      );
      return this.getLocalMockExplanation(prompt, context);
    }
  }

  // ==================== SOCRATIC TUTOR (Guided Learning) ====================

  async socraticTutor(
    messages: TutorMessage[],
    topic?: string,
    userId?: string,
  ): Promise<{ response: string; followUp: string; hint: string }> {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");

    if (!apiKey) {
      return this.getLocalSocraticResponse(messages);
    }

    try {
      const systemInstruction = `You are StudyAI's Socratic Tutor — an AI that guides students to discover answers themselves rather than giving direct answers.

## Your Teaching Method:
1. **Never give the answer directly** — ask guiding questions instead
2. **Break complex problems** into smaller, manageable steps
3. **Provide hints** that lead toward the solution without revealing it
4. **Celebrate small wins** when the student makes progress
5. **Adapt difficulty** based on the student's demonstrated understanding

## Response Format:
- Main response: Guide the student with questions and encouragement
- Follow-up: A specific question to check understanding
- Hint: A gentle nudge if they're stuck (only if they've tried)

## Rules:
- Keep responses concise (under 100 words for main response)
- Use markdown for code examples when helpful
- If the student asks directly for the answer, redirect them: "Let's figure this out together. What do you think the first step might be?"
- Track conversation context and build on previous questions

Student${topic ? ` learning about ${topic}` : ""}:`;

      const conversationHistory = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: conversationHistory,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status code ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        throw new Error("Invalid response structure");
      }

      // Parse the structured response
      const parsed = this.parseSocraticResponse(textResponse);

      // Track conversation for XP
      if (userId) {
        await this.trackTutorInteraction(userId);
      }

      return parsed;
    } catch (error) {
      this.logger.error(`Socratic tutor error: ${error.message}`);
      return this.getLocalSocraticResponse(messages);
    }
  }

  private parseSocraticResponse(text: string): {
    response: string;
    followUp: string;
    hint: string;
  } {
    const lines = text.split("\n").filter((l) => l.trim());

    let response = "";
    let followUp = "";
    let hint = "";

    for (const line of lines) {
      if (
        line.toLowerCase().includes("follow-up:") ||
        line.toLowerCase().includes("check:")
      ) {
        followUp = line.replace(/^[-*]\s*(follow-up|check):\s*/i, "").trim();
      } else if (line.toLowerCase().includes("hint:")) {
        hint = line.replace(/^[-*]\s*hint:\s*/i, "").trim();
      } else if (!response) {
        response = line;
      } else {
        response += " " + line;
      }
    }

    return {
      response: response || text.slice(0, 200),
      followUp: followUp || "Can you explain your reasoning?",
      hint: hint || "",
    };
  }

  private async trackTutorInteraction(userId: string) {
    try {
      // Track activity via audit log instead of separate activity table
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: "AI_TUTOR_CHAT",
          details: {},
        },
      });
    } catch (error) {
      this.logger.warn("Failed to track tutor interaction");
    }
  }

  // ==================== CODE REVIEW ====================

  async reviewCode(
    code: string,
    language: string,
  ): Promise<{
    rating: number;
    feedback: string;
    improvements: string[];
    securityIssues: string[];
  }> {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");

    if (!apiKey) {
      return {
        rating: 7,
        feedback:
          "Code looks functional. Connect Gemini API for detailed review.",
        improvements: [
          "Consider adding error handling",
          "Add comments for clarity",
        ],
        securityIssues: [],
      };
    }

    try {
      const systemInstruction = `You are a senior code reviewer. Analyze the code and provide:
1. A rating from 1-10
2. Brief feedback (under 100 words)
3. List of improvements (max 3)
4. Security issues if any (max 3)

Respond in JSON format:
{
  "rating": <number>,
  "feedback": "<string>",
  "improvements": ["<string>", ...],
  "securityIssues": ["<string>", ...]
}`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: [
              {
                parts: [
                  {
                    text: `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``,
                  },
                ],
              },
            ],
          }),
        },
      );

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      const jsonMatch = textResponse?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        rating: 7,
        feedback: textResponse || "Review complete.",
        improvements: [],
        securityIssues: [],
      };
    } catch (error) {
      this.logger.error(`Code review error: ${error.message}`);
      return {
        rating: 5,
        feedback: "Unable to complete review. Please try again.",
        improvements: [],
        securityIssues: [],
      };
    }
  }

  // ==================== HINT GENERATOR ====================

  async generateHint(
    question: string,
    difficulty: "easy" | "medium" | "hard",
  ): Promise<string> {
    const hints = {
      easy: `Here's a gentle nudge: Think about the basic components involved. What are the key terms in this question?`,
      medium: `Consider breaking this down: What would happen if you tried the opposite approach? Sometimes understanding why something doesn't work helps find what does.`,
      hard: `This is challenging! Try working backwards from the desired outcome. What conditions need to be true for the answer to work?`,
    };

    return hints[difficulty] || hints.medium;
  }

  async generateStudyPlan(
    input: StudyPlanInput,
    userId?: string,
  ): Promise<StudyPlan> {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");

    if (!apiKey) {
      return this.getLocalStudyPlan(input, userId);
    }

    try {
      const systemInstruction = `You are StudyAI's curriculum planner.
Create practical learning plans with clear weekly deliverables.
Respond with valid JSON only. Do not wrap the JSON in markdown.`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: [
              {
                parts: [
                  {
                    text: `Create a study plan for this input:
${JSON.stringify(input)}

Required JSON shape:
{
  "goal": "string",
  "level": "string",
  "weeklyHours": number,
  "durationWeeks": number,
  "milestones": ["string"],
  "weeks": [
    {
      "week": number,
      "theme": "string",
      "objectives": ["string"],
      "activities": ["string"],
      "deliverable": "string"
    }
  ]
}`,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status code ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const plan = this.parseStudyPlan(textResponse, input);
      return this.persistStudyPlan(plan, input, userId);
    } catch (error) {
      this.logger.error(`Study plan generation error: ${error.message}`);
      return this.getLocalStudyPlan(input, userId);
    }
  }

  async listStudyPlans(userId: string) {
    return this.prisma.studyPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  async getLatestStudyPlan(userId: string) {
    return this.prisma.studyPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // ==================== LOCAL MOCK RESPONSES ====================

  private getLocalMockExplanation(prompt: string, context?: string): string {
    const contentLower = (prompt + " " + (context || "")).toLowerCase();

    if (contentLower.includes("python") || contentLower.includes("print")) {
      return `### Python Printing Guide
In Python, \`print()\` outputs text.
- Ensure your parenthesis are closed.
- Quote your strings correctly: \`print("Hello, StudyAI!")\`.
- You can format outputs using f-strings: \`print(f"XP: {user_xp}")\`.`;
    }

    if (
      contentLower.includes("subnet") ||
      contentLower.includes("mask") ||
      contentLower.includes("cidr")
    ) {
      return `### Subnet Mask Guide
Subnetting partitions Class C blocks:
- **/24**: Netmask \`255.255.255.0\` (256 IPs, 254 hosts).
- **/26**: Netmask \`255.255.255.192\` (64 IPs, 62 hosts).
- **/30**: Netmask \`255.255.255.252\` (4 IPs, 2 hosts - WAN standard).
Formulas: Hosts = \(2^{(32-N)} - 2\).`;
    }

    if (
      contentLower.includes("suid") ||
      contentLower.includes("privilege") ||
      contentLower.includes("exploit")
    ) {
      return `### Linux SUID Privilege Escalation
SUID files run with the permissions of the file owner (e.g. root):
- Identified by \`-rws---\` permissions.
- If a binary has SUID set and takes input unsafely, a buffer overflow can overwrite the instruction pointer and spawn a root shell.
- Run: \`run vuln-helper AAAAAAAAAAAAAAAAAAAAAAAAAAAAA\` to trigger.`;
    }

    return `### StudyAI Tutor Explanation
- **Review your parameters**: Check syntax and type compatibility.
- **Consult manuals**: Look for SUID bits, CIDR rules, or Python function definitions.
- **AI Recommendation**: Enable a live connection to Gemini by adding your \`GEMINI_API_KEY\` to your \`backend/.env\` configuration file!`;
  }

  private async getLocalSocraticResponse(messages: TutorMessage[]): Promise<{
    response: string;
    followUp: string;
    hint: string;
  }> {
    const lastMessage =
      messages[messages.length - 1]?.content.toLowerCase() || "";

    if (
      lastMessage.includes("stuck") ||
      lastMessage.includes("help") ||
      lastMessage.includes("hint")
    ) {
      return {
        response:
          "That's okay — everyone gets stuck sometimes! Let's think about this differently. What have you tried so far?",
        followUp:
          "Can you describe what happened when you tried that approach?",
        hint: "Start by identifying the main components of the problem.",
      };
    }

    return {
      response:
        "Great question! Before I help, let me ask — what do you think might be the first step here?",
      followUp: "What makes you think that?",
      hint: "",
    };
  }

  private parseStudyPlan(
    text: string | undefined,
    input: StudyPlanInput,
  ): StudyPlan {
    if (!text) {
      throw new Error("Invalid response structure");
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Study plan response did not contain JSON");
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<StudyPlan>;
    if (
      !parsed.weeks ||
      !Array.isArray(parsed.weeks) ||
      parsed.weeks.length === 0
    ) {
      throw new Error("Study plan response missing weeks");
    }

    return {
      goal: parsed.goal || input.goal,
      level: parsed.level || input.currentLevel,
      weeklyHours: parsed.weeklyHours || input.weeklyHours,
      durationWeeks: parsed.durationWeeks || parsed.weeks.length,
      milestones: parsed.milestones || [],
      weeks: parsed.weeks,
    };
  }

  private async getLocalStudyPlan(
    input: StudyPlanInput,
    userId?: string,
  ): Promise<StudyPlan> {
    const durationWeeks = this.calculateStudyPlanWeeks(input.targetDate);
    const focusAreas =
      input.focusAreas.length > 0
        ? input.focusAreas
        : ["foundations", "practice", "project work"];

    const weeks = Array.from({ length: durationWeeks }, (_, index) => {
      const focus = focusAreas[index % focusAreas.length];
      const week = index + 1;

      return {
        week,
        theme: `${focus} sprint`,
        objectives: [
          `Build ${input.currentLevel} understanding of ${focus}`,
          `Complete targeted practice for ${input.goal}`,
        ],
        activities: [
          `Study core ${focus} concepts for ${Math.max(1, Math.floor(input.weeklyHours * 0.4))} hours`,
          `Complete hands-on exercises for ${Math.max(1, Math.floor(input.weeklyHours * 0.4))} hours`,
          "Write a short reflection with gaps and next actions",
        ],
        deliverable: `A working ${focus} artifact or solved challenge set`,
      };
    });

    const plan: StudyPlan = {
      goal: input.goal,
      level: input.currentLevel,
      weeklyHours: input.weeklyHours,
      durationWeeks,
      milestones: [
        "Baseline assessment completed",
        "Core concepts practiced with feedback",
        "Capstone deliverable completed",
      ],
      weeks,
    };

    return this.persistStudyPlan(plan, input, userId);
  }

  private async persistStudyPlan(
    plan: StudyPlan,
    input: StudyPlanInput,
    userId?: string,
  ): Promise<StudyPlan & { id?: string }> {
    await this.trackStudyPlanGenerated(userId, input);

    if (!userId) {
      return plan;
    }

    try {
      const saved = await this.prisma.studyPlan.create({
        data: {
          userId,
          goal: plan.goal,
          level: plan.level,
          weeklyHours: plan.weeklyHours,
          durationWeeks: plan.durationWeeks,
          milestones: plan.milestones,
          weeks: plan.weeks as any,
          focusAreas: input.focusAreas,
        },
      });

      return { ...plan, id: saved.id };
    } catch (error) {
      this.logger.warn("Failed to persist study plan");
      return plan;
    }
  }

  private calculateStudyPlanWeeks(targetDate?: string): number {
    if (!targetDate) {
      return 6;
    }

    const target = new Date(targetDate);
    if (Number.isNaN(target.getTime())) {
      return 6;
    }

    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const weeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
    return Math.min(24, Math.max(1, weeks));
  }

  private async trackStudyPlanGenerated(
    userId: string | undefined,
    input: StudyPlanInput,
  ) {
    if (!userId) {
      return;
    }

    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: "AI_STUDY_PLAN_GENERATED",
          details: {
            goal: input.goal,
            currentLevel: input.currentLevel,
            weeklyHours: input.weeklyHours,
            focusAreas: input.focusAreas,
          },
        },
      });
    } catch (error) {
      this.logger.warn("Failed to track study plan generation");
    }
  }
}
