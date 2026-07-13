'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, Calendar, CheckCircle, ExternalLink } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  courseName: string;
  issuedAt: string;
  hash: string;
  skills: string[];
  instructor: string;
  grade?: string;
  verified: boolean;
}

export function CertificateViewer() {
  const [certificates] = useState<Certificate[]>([
    {
      id: 'c1',
      title: 'Python Programming Mastery',
      courseName: 'Complete Python Bootcamp',
      issuedAt: '2026-03-15',
      hash: 'CERT-PY-2026-A1B2C3',
      skills: ['Python', 'OOP', 'Data Structures'],
      instructor: 'Dr. Sarah Chen',
      grade: 'A',
      verified: true,
    },
    {
      id: 'c2',
      title: 'Network Security Fundamentals',
      courseName: 'Cybersecurity Essentials',
      issuedAt: '2026-04-20',
      hash: 'CERT-NS-2026-D4E5F6',
      skills: ['Networking', 'Security', 'Firewalls'],
      instructor: 'Prof. Marcus Johnson',
      grade: 'A+',
      verified: true,
    },
    {
      id: 'c3',
      title: 'Cloud Architecture',
      courseName: 'AWS Solutions Architect',
      issuedAt: '2026-05-10',
      hash: 'CERT-CA-2026-G7H8I9',
      skills: ['AWS', 'Cloud', 'Infrastructure'],
      instructor: 'Alex Rivera',
      verified: true,
    },
  ]);

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async (cert: Certificate) => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      if (certRef.current) {
        const canvas = await html2canvas(certRef.current);
        const link = document.createElement('a');
        link.download = `${cert.title.replace(/\s+/g, '-').toLowerCase()}-certificate.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error('Failed to download certificate');
    }
  };

  const verifyCertificate = (hash: string) => {
    // In production, this would verify against blockchain/backend
    alert(`Verifying certificate hash: ${hash}\n\nStatus: ✅ Verified on StudyAI Blockchain`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Certificates
        </h3>
        <span className="text-sm text-gray-500">{certificates.length} certificates earned</span>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map((cert, i) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedCert(cert)}
            className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 hover:border-yellow-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Award className="w-6 h-6 text-white" />
              </div>
              {cert.verified && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>

            <h4 className="font-semibold text-gray-900 dark:text-white">{cert.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{cert.courseName}</p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {cert.skills.map((skill) => (
                <span key={skill} className="px-2 py-0.5 bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-yellow-200/50 dark:border-yellow-800/50">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {cert.issuedAt}
              </span>
              {cert.grade && (
                <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded-full">
                  {cert.grade}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Certificate Preview Modal */}
      {selectedCert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedCert(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            {/* Certificate Card */}
            <div
              ref={certRef}
              className="p-8 bg-white rounded-2xl shadow-2xl border-4 border-yellow-400"
              style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fffbeb 100%)',
              }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-yellow-700 uppercase tracking-widest font-medium">Certificate of Achievement</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">StudyAI</h2>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <p className="text-gray-600">This certifies that</p>
                <h3 className="text-3xl font-bold text-gray-900 my-2">Student Name</h3>
                <p className="text-gray-600">has successfully completed</p>
                <h4 className="text-xl font-semibold text-purple-600 mt-2">{selectedCert.title}</h4>
                <p className="text-gray-500 mt-1">{selectedCert.courseName}</p>
              </div>

              {/* Details */}
              <div className="flex justify-center gap-8 mb-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase">Date Issued</p>
                  <p className="text-sm font-medium text-gray-900">{selectedCert.issuedAt}</p>
                </div>
                {selectedCert.grade && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Grade</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCert.grade}</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase">Certificate ID</p>
                  <p className="text-sm font-mono text-gray-900">{selectedCert.hash}</p>
                </div>
              </div>

              {/* Skills */}
              <div className="flex justify-center gap-2 mb-6">
                {selectedCert.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end pt-4 border-t border-yellow-300">
                <div className="text-center">
                  <div className="w-32 border-b border-gray-400 mb-1"></div>
                  <p className="text-xs text-gray-500">{selectedCert.instructor}</p>
                  <p className="text-xs text-gray-400">Instructor</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-gray-400 mb-1"></div>
                  <p className="text-xs text-gray-500">StudyAI Platform</p>
                  <p className="text-xs text-gray-400">Issuer</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => downloadCertificate(selectedCert)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-700 transition-all"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                onClick={() => verifyCertificate(selectedCert.hash)}
                className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-700 rounded-xl font-medium hover:bg-green-50 transition-all"
              >
                <CheckCircle className="w-4 h-4" /> Verify
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
