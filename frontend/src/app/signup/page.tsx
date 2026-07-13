"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/brand";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register({
        email: email.trim(),
        name: name.trim(),
        password,
        role,
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex items-center justify-center p-4 cyber-grid relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-purple/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-blue/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md space-y-5 glow-purple relative z-10">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Logo size="lg" />
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Create Account
            </h1>
            <p className="text-xs text-zinc-500 font-medium">Join the interactive technology learning laboratory.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cadet Miller"
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#050505] border border-zinc-800 focus:border-cyber-purple text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

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

          {/* Segmented Role Picker */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Select Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer ${role === "STUDENT" ? "bg-cyber-purple/10 border-cyber-purple text-cyber-purple" : "bg-[#050505] border-zinc-800 text-zinc-400 hover:border-zinc-700"}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("INSTRUCTOR")}
                className={`h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer ${role === "INSTRUCTOR" ? "bg-cyber-blue/10 border-cyber-blue text-cyber-blue" : "bg-[#050505] border-zinc-800 text-zinc-400 hover:border-zinc-700"}`}
              >
                Instructor
              </button>
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
                placeholder="Min. 8 characters"
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#050505] border border-zinc-800 focus:border-cyber-purple text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all"
                required
                minLength={8}
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
            <span>{loading ? "Creating account..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4 text-zinc-950" />
          </button>
        </form>

        {/* Redirect Link */}
        <div className="text-center pt-2">
          <p className="text-[10px] text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-cyber-purple font-bold hover:underline">
              Log In
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
