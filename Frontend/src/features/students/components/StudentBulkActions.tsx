import React from 'react';
import { Zap, Mail, Calendar, Download } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

interface StudentBulkActionsProps {
  selectedCount: number;
  onSendBulkEmail: () => void;
  onExtendBulkAccess: () => void;
  onExportBulk: () => void;
}

const ACTION_BTN =
  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-slate-800/60 text-[#0f172a] dark:text-gray-200 border border-[#e2e8f0] dark:border-[#334155] text-xs font-medium transition-all group cursor-pointer';

export const StudentBulkActions: React.FC<StudentBulkActionsProps> = ({
  selectedCount,
  onSendBulkEmail,
  onExtendBulkAccess,
  onExportBulk,
}) => {
  return (
    <Card padding="none" className="p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e2e8f0] dark:border-[#334155]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <h3 className="text-xs font-semibold text-[#0f172a] dark:text-gray-100 uppercase tracking-wider">
            Bulk Actions
          </h3>
        </div>
        {selectedCount > 0 && (
          <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60">
            {selectedCount} selected
          </span>
        )}
      </div>

      <div className="space-y-2">
        <button onClick={onSendBulkEmail} className={ACTION_BTN}>
          <Mail className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <span>Send Email</span>
        </button>

        <button onClick={onExtendBulkAccess} className={ACTION_BTN}>
          <Calendar className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
          <span>Extend Access</span>
        </button>

        <button onClick={onExportBulk} className={ACTION_BTN}>
          <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          <span>Export Student List</span>
        </button>
      </div>
    </Card>
  );
};

export default StudentBulkActions;