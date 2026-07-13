"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Award, ShieldCheck, Share2, Printer, ArrowLeft, Cpu } from "lucide-react";
import Link from "next/link";

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const certId = params.id as string;
  
  const [studentEmail, setStudentEmail] = useState("student@studyai.io");
  const [studentName, setStudentName] = useState("Operator");

  useEffect(() => {
    const session = localStorage.getItem("studyai_session");
    if (!session) {
      router.push("/login");
      return;
    }
    setStudentEmail(session);
    // Parse name from email
    const namePart = session.split("@")[0];
    setStudentName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
  }, [router]);

  // Determine course based on cert hash
  let courseTitle = "IP Subnetting & Network Topologies";
  let description = "For demonstrating advanced proficiency in Classless Inter-Domain Routing (CIDR) configuration, subnet calculations, and dynamic packet routing models.";
  
  if (certId.includes("py") || certId.includes("python")) {
    courseTitle = "Systems Programming & Python Scripting";
    description = "For demonstrating proficiency in shell script automation, standard streams optimization, and interpreted code safety parameters.";
  } else if (certId.includes("cyber") || certId.includes("suid") || certId.includes("hack")) {
    courseTitle = "Ethical Hacking & Linux Security Exploit Labs";
    description = "For demonstrating capabilities in buffer overflow payload configurations, SUID vulnerability discovery, and secure execution standards.";
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex flex-col items-center justify-center p-6 cyber-grid relative overflow-hidden">
      
      {/* Floating particles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-cyber-purple/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyber-blue/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Control Buttons */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 no-print">
        <Link 
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
          <button 
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-purple hover:bg-cyber-purple/90 text-zinc-950 text-xs font-bold transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-zinc-950" />
            <span>Share Link</span>
          </button>
        </div>
      </div>

      {/* Certificate Sheet Card */}
      <div className="w-full max-w-4xl p-1 bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-700 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.15)] relative glow-orange">
        
        {/* Certificate Content Container */}
        <div className="w-full bg-[#050505] rounded-[22px] p-8 md:p-14 border border-zinc-900 flex flex-col items-center justify-between text-center relative overflow-hidden">
          
          {/* Internal watermark */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
            <Award className="w-96 h-96 text-yellow-500" />
          </div>

          <div className="space-y-6 relative z-10 w-full">
            {/* Header Badge */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500 mb-2">
                <Award className="w-8 h-8" />
              </div>
              <span className="text-[10px] tracking-[4px] font-bold text-yellow-500 uppercase">Certificate of Completion</span>
            </div>

            {/* Achievement text */}
            <div className="space-y-3">
              <span className="text-zinc-500 text-xs italic">This certifies that software analyst</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide border-b border-zinc-900 pb-3 max-w-md mx-auto">
                {studentName}
              </h2>
              <span className="text-zinc-500 text-xs italic block pt-2">has successfully scaled all terminal security challenges in</span>
              <h3 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 py-1">
                {courseTitle}
              </h3>
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Signatures and Hash Details */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 mt-12 border-t border-zinc-900/80 relative z-10">
            {/* Sign 1 */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="font-mono text-xs text-zinc-300 italic border-b border-zinc-800 pb-1 px-4">A. Antigravity</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Lead Architect</span>
            </div>

            {/* Verification Center */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-cyber-green/10 border border-cyber-green/30 text-cyber-green rounded-full text-[9px] font-bold uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Certificate</span>
              </div>
              <span className="text-[8px] font-mono text-zinc-500 tracking-wider">HASH: {certId}</span>
            </div>

            {/* Sign 2 */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="font-mono text-xs text-zinc-300 italic border-b border-zinc-800 pb-1 px-4">StudyAI Laboratory</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Platform Assessor</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
