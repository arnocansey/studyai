"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { bffFetch } from "@/lib/api";

interface Question {
  id: string;
  question: string;
  options: string[];
}

interface QuizResult {
  isCorrect: boolean;
  message: string;
  xpAwarded: number;
}

export function QuizWidget({ lessonId }: { lessonId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchQuiz = async () => {
    try {
      const data = await bffFetch<{ questions: Question[] }>(
        `/api/quiz/lesson/${lessonId}`,
      );
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setScore(0);
      setTotalXP(0);
      setCompleted(false);
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
    }
  };

  const submitAnswer = async () => {
    if (!selected || loading) return;

    setLoading(true);
    try {
      const data = await bffFetch<QuizResult>("/api/quiz/verify", {
        method: "POST",
        body: JSON.stringify({
          questionId: questions[currentIndex].id,
          answer: selected,
        }),
      });

      setResult(data);

      if (data.isCorrect) {
        setScore((s) => s + 1);
        setTotalXP((xp) => xp + data.xpAwarded);
      }
    } catch (error) {
      console.error("Failed to verify answer:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setResult(null);
    } else {
      setCompleted(true);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Ready to test your knowledge?</p>
        <button
          onClick={fetchQuiz}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Quiz Complete!
        </h3>
        <div className="mt-4 space-y-2">
          <p className="text-lg">
            Score:{" "}
            <span className="font-bold text-purple-500">
              {score}/{questions.length}
            </span>
          </p>
          <p className="text-lg">
            XP Earned:{" "}
            <span className="font-bold text-yellow-500">+{totalXP}</span>
          </p>
        </div>
        <button
          onClick={fetchQuiz}
          className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all inline-flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </motion.div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-green-500 font-medium">{score} correct</span>
      </div>

      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl"
      >
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          {question.question}
        </p>
      </motion.div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => !result && setSelected(option)}
            disabled={!!result}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
              selected === option
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            } ${
              result && selected === option && result.isCorrect
                ? "!border-green-500 !bg-green-500/10"
                : result && selected === option && !result.isCorrect
                  ? "!border-red-500 !bg-red-500/10"
                  : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selected === option
                    ? "border-purple-500 bg-purple-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {selected === option && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <span className="text-gray-900 dark:text-white">{option}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${
            result.isCorrect
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {result.isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span
              className={`font-medium ${result.isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
            >
              {result.message}
            </span>
          </div>
          {result.xpAwarded > 0 && (
            <p className="mt-2 text-sm text-yellow-600">
              +{result.xpAwarded} XP
            </p>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        {result ? (
          <button
            onClick={nextQuestion}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all inline-flex items-center gap-2"
          >
            {currentIndex < questions.length - 1 ? "Next" : "Finish"}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={submitAnswer}
            disabled={!selected}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        )}
      </div>
    </div>
  );
}
