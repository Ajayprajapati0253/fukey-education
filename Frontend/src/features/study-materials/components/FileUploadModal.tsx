import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';
import type { StudyMaterialItem } from '../types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: StudyMaterialItem | null;
  onReplaceFile: (
    id: string,
    fileName: string,
    fileSize: string,
    fileFormat: 'pdf' | 'docx' | 'zip' | 'quiz' | 'json'
  ) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  material,
  onReplaceFile,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  const [fileFormat, setFileFormat] = useState<'pdf' | 'docx' | 'zip' | 'quiz' | 'json'>('pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isOpen || !material) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCustomFileName(file.name);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setFileFormat('pdf');
      else if (ext === 'docx' || ext === 'doc') setFileFormat('docx');
      else if (ext === 'zip' || ext === 'rar') setFileFormat('zip');
      else setFileFormat('pdf');
    }
  };

  const handleStartUpload = () => {
    if (!selectedFile && !customFileName) return;

    setIsUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            const sizeMb = selectedFile
              ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
              : '4.5 MB';
            const finalName = customFileName || selectedFile?.name || 'Updated_Material.pdf';
            onReplaceFile(material.id, finalName, sizeMb, fileFormat);
            setIsUploading(false);
            setUploadProgress(0);
            setSelectedFile(null);
            onClose();
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#334155] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#334155]/60 bg-slate-50/70 dark:bg-slate-800/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-gray-100">Replace Attached File</h2>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 truncate max-w-sm">
              For: {material.title}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Current File Banner */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-[#334155] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-700 dark:bg-[#2451D9]/20 dark:text-[#60A5FA] rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-2xs font-semibold text-slate-500 dark:text-gray-400 uppercase">Current Attached File</div>
                <div className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate max-w-xs">{material.fileName}</div>
              </div>
            </div>
            <span className="text-2xs font-medium text-slate-500 dark:text-gray-400 bg-white dark:bg-[#0F172A] px-2 py-1 rounded border border-slate-200 dark:border-[#334155]">
              {material.fileSize}
            </span>
          </div>

          {/* Drag & Drop Upload Zone */}
          <label className="border-2 border-dashed border-slate-200 dark:border-[#334155] hover:border-blue-400 dark:hover:border-[#60A5FA] bg-slate-50/50 dark:bg-slate-800/30 hover:bg-blue-50/20 dark:hover:bg-[#2451D9]/10 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
            <Upload className="w-8 h-8 text-blue-600 dark:text-[#60A5FA] mb-2" />
            <span className="text-xs font-semibold text-slate-800 dark:text-gray-100">
              {selectedFile ? selectedFile.name : 'Click to select or drag replacement file'}
            </span>
            <span className="text-2xs text-slate-500 dark:text-gray-400 mt-1">PDF, DOCX, ZIP or Quiz JSON up to 50MB</span>
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>

          {/* Editable File Name */}
          <div>
            <label className="block text-2xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
              File Name in Portal
            </label>
            <input
              type="text"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              placeholder="e.g. Revised_Physics_Notes_Final_v2.pdf"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-2xs font-semibold text-slate-600 dark:text-gray-400">
                <span>Uploading and indexing file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-[#334155]/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-gray-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartUpload}
            disabled={isUploading || (!selectedFile && !customFileName)}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Confirm & Replace'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};