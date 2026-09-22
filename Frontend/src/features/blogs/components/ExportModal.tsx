// src/features/blogs/components/ExportModal.tsx
import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileCode, Check, Copy } from 'lucide-react';
import type { Post } from '../types/post.types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, posts }) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateCSV = () => {
    const headers = ['SN', 'Title', 'Author', 'Category', 'Language', 'Status', 'Published Date', 'Views', 'Show Homepage', 'Popular'];
    const rows = posts.map((p, idx) => [
      p.sn || idx + 1,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.author.name}"`,
      p.category,
      p.language,
      p.status,
      `"${p.publishedDate} ${p.publishedTime}"`,
      p.views,
      p.showHomepage ? 'Yes' : 'No',
      p.isPopular ? 'Yes' : 'No',
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const generateJSON = () => JSON.stringify(posts, null, 2);

  const handleDownload = () => {
    let content = '';
    let filename = `fukey-posts-export-${new Date().toISOString().slice(0, 10)}`;
    let type = '';

    if (format === 'csv') {
      content = generateCSV();
      filename += '.csv';
      type = 'text/csv;charset=utf-8;';
    } else {
      content = generateJSON();
      filename += '.json';
      type = 'application/json;charset=utf-8;';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const handleCopy = () => {
    const text = format === 'csv' ? generateCSV() : generateJSON();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#334155] flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 dark:text-gray-100">Export Posts Data</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <p className="text-xs text-slate-600 dark:text-gray-400">
            Export <span className="font-bold text-slate-900 dark:text-gray-100">{posts.length}</span> currently filtered
            educational articles with complete metadata.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider block">
              Choose Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  format === 'csv'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-[#334155] text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">CSV / Excel</span>
                <span className="text-[10px] text-slate-400 dark:text-gray-500">Spreadsheet ready</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  format === 'json'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-[#334155] text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <FileCode className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold">JSON Data</span>
                <span className="text-[10px] text-slate-400 dark:text-gray-500">Developer friendly</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-[#334155] bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 border border-slate-200 dark:border-[#334155] rounded-lg text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700/50 flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5 text-emerald-600" /><span className="text-emerald-600">Copied!</span></>
            ) : (
              <><Copy className="w-3.5 h-3.5 text-slate-500" /><span>Copy to Clipboard</span></>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100">
              Cancel
            </button>
            <button onClick={handleDownload} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs">
              <Download className="w-3.5 h-3.5" /><span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};