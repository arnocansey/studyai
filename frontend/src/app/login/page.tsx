"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/brand";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email.trim(), password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex items-center justify-center p-4 cyber-grid relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-purple/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-blue/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md space-y-6 glow-purple relative z-10">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Logo size="lg" />
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 font-medium">Enter your credentials to access the laboratory.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. cadet@studyai.io"
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#050505] border border-zinc-800 focus:border-cyber-purple text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#050505] border border-zinc-800 focus:border-cyber-purple text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-[10px] text-red-400 font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-cyber-purple to-cyber-blue hover:opacity-95 text-zinc-950 font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4 text-zinc-950" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[10px] text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-cyber-purple font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center text-[9px] text-zinc-600 pt-4 border-t border-zinc-900">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyber-purple" />
            <span>AI Sandbox Access Enabled</span>
          </div>
          <span>Secure JWT Auth</span>
        </div>
      </div>
    </div>
  );
}
