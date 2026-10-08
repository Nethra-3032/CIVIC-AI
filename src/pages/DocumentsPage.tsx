import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DocumentItem } from '../types';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { BlockchainBadge } from '../components/BlockchainBadge';
import { 
  FileCheck, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Calendar, 
  Hash, 
  X, 
  ScanLine 
} from 'lucide-react';

interface DocumentsPageProps {
  navigate: (path: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ navigate }) => {
  const { language } = useVoiceAndAccessibility();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [readinessScore, setReadinessScore] = useState(82);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('Income_Cert');
  const [uploadDocName, setUploadDocName] = useState('Renewed Income Certificate 2026-27');
  const [uploading, setUploading] = useState(false);
  const [analyzingDoc, setAnalyzingDoc] = useState<any>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.getDocuments();
      setDocuments(res.documents);
      setReadinessScore(res.document_readiness_score || 82);
    } catch (e) {
      console.warn("Failed to load documents", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const newDoc = await api.uploadDocument(uploadDocType, uploadDocName);
      setAnalyzingDoc(newDoc);
      setShowUploadModal(false);
      await fetchDocs();
    } catch (err: any) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner with Readiness Score Gauge */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold mb-2">
              <FileCheck className="w-3.5 h-3.5" />
              <span>CIVIC APPLY — DOCUMENT CENTER</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Document Intelligence Hub</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Securely store certificates, run OCR field extraction, detect expiry dates, and anchor verification proofs onto the blockchain ledger.
            </p>
          </div>

          {/* Document Readiness Score Widget */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl glass-card border border-cyan-500/30">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" className="text-slate-800" fill="transparent" />
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" strokeDasharray={201} strokeDashoffset={201 - (201 * readinessScore) / 100} className="text-emerald-400" strokeLinecap="round" fill="transparent" />
              </svg>
              <span className="absolute font-black text-white text-base">{readinessScore}%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Readiness</span>
              <span className="text-sm font-bold text-white">High Readiness</span>
              <span className="text-[11px] text-amber-300 block mt-0.5">1 Certificate Expiring Soon</span>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Certificate (PDF / JPG)</span>
          </button>
        </div>
      </div>

      {/* AI Analysis Scan Result Pill if recently scanned */}
      {analyzingDoc && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/50 shadow-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-3 text-xs">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white">AI OCR Extraction Succeeded:</span>
              <p className="text-slate-300 mt-0.5">
                Verified: <span className="text-cyan-300 font-semibold">{analyzingDoc.name}</span> • Issuing Authority verified with SHA-256 hash.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAnalyzingDoc(null)}
            className="text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => {
          const isAttention = doc.status === 'ATTENTION_REQUIRED';
          const isVerified = doc.status === 'VERIFIED';
          const extracted = doc.extracted_data || {};

          return (
            <div
              key={doc.id}
              className={`glass-card rounded-2xl p-5 border transition-all ${
                isAttention 
                  ? 'border-amber-500/60 bg-amber-950/15' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {doc.doc_type}
                  </span>
                  <h3 className="font-bold text-white text-sm mt-1.5 line-clamp-1">{doc.name}</h3>
                </div>

                {isVerified && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>VERIFIED</span>
                  </span>
                )}
                {isAttention && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    <span>EXPIRES SOON</span>
                  </span>
                )}
              </div>

              {/* Extracted Details & OCR Intelligence */}
              <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Expiry Date:</span>
                  <span className={isAttention ? 'text-amber-300 font-bold' : 'text-slate-200'}>
                    {doc.expiry_date || 'LIFETIME'}
                  </span>
                </div>

                {extracted.annual_income && (
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Extracted Income:</span>
                    <span className="text-emerald-400 font-bold">{extracted.annual_income}</span>
                  </div>
                )}

                {extracted.institution && (
                  <div className="text-[11px] text-slate-400 truncate">
                    <span>Inst: {extracted.institution}</span>
                  </div>
                )}

                {extracted.alert && (
                  <div className="mt-1 p-2 rounded bg-amber-950/40 border border-amber-800/80 text-[10px] text-amber-200 leading-snug">
                    {extracted.alert}
                  </div>
                )}
              </div>

              {/* SHA-256 Hash & Blockchain Proof */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 text-slate-400 font-mono text-[10px]">
                  <Hash className="w-3 h-3 text-cyan-400" />
                  <span className="truncate max-w-[120px]">{doc.doc_hash.substring(0, 16)}...</span>
                </div>

                <BlockchainBadge 
                  referenceCode={`DOC-${doc.id.toUpperCase()}`}
                  eventType="DOCUMENT_REGISTERED"
                />
              </div>

            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-700 p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Upload Government Certificate</h3>
            <p className="text-xs text-slate-400 mb-4">Supported formats: PDF, JPG, PNG (Max 5MB)</p>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Document Category</label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-cyan-500"
                >
                  <option value="Income_Cert">Tahsildar Income Certificate</option>
                  <option value="College_ID">College Bonafide Certificate</option>
                  <option value="Community_Cert">Community Certificate (BC/MBC/SC/ST)</option>
                  <option value="Smart_Ration_Card">Digital Smart Ration Card</option>
                  <option value="Bank_Passbook">Bank Account Passbook (NPCI Mapped)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Certificate Title</label>
                <input
                  type="text"
                  required
                  value={uploadDocName}
                  onChange={(e) => setUploadDocName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-cyan-500"
                />
              </div>

              {/* Drag Drop Mock Area */}
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-6 text-center cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs text-slate-200 font-semibold">Click to select certificate file</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Automated AI OCR will run upon upload</p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-900 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-bold text-xs"
                >
                  {uploading ? 'Processing OCR & Hashing...' : 'Upload & Anchor to Chain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
