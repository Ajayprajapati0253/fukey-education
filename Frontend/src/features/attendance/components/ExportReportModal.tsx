import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, X } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'json') => void;
  recordCount: number;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  recordCount,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.18)] dark:shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6E8EE] dark:border-[#172749] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EAF0FE] dark:bg-blue-600/20 text-[#2451D9] dark:text-blue-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#12141C] dark:text-white">Export Attendance Report</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#142038] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-[#12141C]/80 dark:text-slate-300">
            Export current filtered dataset ({recordCount} records) for administration audit and payroll.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedFormat('csv')}
              className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-2 transition ${
                selectedFormat === 'csv'
                  ? 'border-[#2451D9] bg-[#EAF0FE] dark:bg-blue-600/10 text-[#12141C] dark:text-white'
                  : 'border-[#E6E8EE] dark:border-[#1b2b4d] bg-[#F6F7FA] dark:bg-[#101b33] text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet className={`w-6 h-6 ${selectedFormat === 'csv' ? 'text-[#2451D9] dark:text-blue-400' : 'text-[#9DA2AF] dark:text-slate-400'}`} />
              <span className="text-xs font-semibold">CSV Spreadsheet</span>
              <span className="text-[10px] text-[#686E7D] dark:text-slate-400">Excel / Sheets compatible</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('json')}
              className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-2 transition ${
                selectedFormat === 'json'
                  ? 'border-[#2451D9] bg-[#EAF0FE] dark:bg-blue-600/10 text-[#12141C] dark:text-white'
                  : 'border-[#E6E8EE] dark:border-[#1b2b4d] bg-[#F6F7FA] dark:bg-[#101b33] text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white'
              }`}
            >
              <FileText className={`w-6 h-6 ${selectedFormat === 'json' ? 'text-[#2451D9] dark:text-blue-400' : 'text-[#9DA2AF] dark:text-slate-400'}`} />
              <span className="text-xs font-semibold">JSON Raw Data</span>
              <span className="text-[10px] text-[#686E7D] dark:text-slate-400">Developer API format</span>
            </button>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#E6E8EE] dark:border-[#172749] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#E6E8EE] dark:border-[#1b2b4d] bg-[#F6F7FA] dark:bg-[#101b33] text-xs font-medium text-[#686E7D] dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#152342] transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onExport(selectedFormat)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2451D9] hover:bg-[#1e43b8] text-xs font-semibold text-white shadow-md shadow-[#2451D9]/30 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};