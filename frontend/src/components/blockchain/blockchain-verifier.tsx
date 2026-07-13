'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, ExternalLink, Copy, Search } from 'lucide-react';

interface CertificateData {
  id: string;
  title: string;
  recipientName: string;
  issuedAt: string;
  hash: string;
  blockchainTx?: string;
  verified: boolean;
  issuer: string;
  skills: string[];
}

export function BlockchainVerifier() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<CertificateData | null>(null);

  const verifyCertificate = async (hash: string) => {
    setIsVerifying(true);
    
    // Simulate blockchain verification
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setResult({
      id: 'CERT-2026-ABC123',
      title: 'Python Programming Mastery',
      recipientName: 'Student Name',
      issuedAt: '2026-03-15',
      hash: hash || '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
      blockchainTx: '0x1234567890abcdef1234567890abcdef12345678',
      verified: true,
      issuer: 'StudyAI Platform',
      skills: ['Python', 'OOP', 'Data Structures'],
    });
    
    setIsVerifying(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-500" />
          Blockchain Certificate Verification
        </h3>
      </div>

      {/* Search */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 mb-4">
          Enter a certificate hash or ID to verify its authenticity on the blockchain.
        </p>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter certificate hash (e.g., 0x7a8b9c...)"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            />
          </div>
          <button
            onClick={() => verifyCertificate(searchQuery)}
            disabled={isVerifying || !searchQuery}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>

      {/* Verification Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              result.verified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {result.verified ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <Shield className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {result.verified ? 'Certificate Verified ✓' : 'Verification Failed'}
              </h4>
              <p className="text-sm text-gray-500">
                {result.verified
                  ? 'This certificate is authentic and has been verified on the blockchain.'
                  : 'This certificate could not be verified.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div>
              <p className="text-xs text-gray-500 mb-1">Certificate Title</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{result.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Recipient</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{result.recipientName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Issued Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{result.issuedAt}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Issuer</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{result.issuer}</p>
            </div>
          </div>

          {/* Hash */}
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Certificate Hash</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{result.hash}</p>
              </div>
              <button
                onClick={() => copyToClipboard(result.hash)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Blockchain TX */}
          {result.blockchainTx && (
            <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Blockchain Transaction</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{result.blockchainTx}</p>
                </div>
                <a
                  href={`https://etherscan.io/tx/${result.blockchainTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                >
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </a>
              </div>
            </div>
          )}

          {/* Skills */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Verified Skills</p>
            <div className="flex flex-wrap gap-2">
              {result.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* How it Works */}
      <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">How Blockchain Verification Works</h4>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Certificate is issued and its hash is recorded on the Ethereum blockchain' },
            { step: '2', text: 'The hash uniquely identifies this certificate and cannot be tampered with' },
            { step: '3', text: 'Anyone can verify the certificate by comparing its hash with the blockchain record' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {item.step}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
