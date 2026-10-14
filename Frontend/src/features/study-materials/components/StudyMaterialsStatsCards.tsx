import React from 'react';
import { BookOpen, CheckCircle, Clock, Archive, Download, Eye } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    total: number;
    published: number;
    drafts: number;
    archived: number;
    totalDownloads: number;
    totalViews: number;
  };
  categoryTitle?: string;
  filterSummary?: string;
}

const CARD =
  'bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-500 transition-colors';
const LABEL =
  'text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-gray-400 truncate';

export const StudyMaterialsStatsCards: React.FC<StatsCardsProps> = ({
  stats,
  categoryTitle,
  filterSummary,
}) => {
  return (
    <div className="space-y-2 mb-6">
      {filterSummary && (
        <div className="flex items-center gap-2 text-2xs text-blue-700 dark:text-[#60A5FA] bg-blue-50/80 dark:bg-[#2451D9]/20 border border-blue-200/80 dark:border-[#2451D9]/40 px-3 py-1.5 rounded-lg w-fit">
          <span className="font-bold uppercase tracking-wider">Active Scope:</span>
          <span className="font-semibold">{filterSummary}</span>
          <span className="text-blue-500 dark:text-[#60A5FA]/70 font-medium">(Metrics updated live)</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Items */}
        <div className={CARD}>
          <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 mb-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 dark:bg-[#2451D9]/20 dark:text-[#60A5FA] rounded-lg flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className={LABEL}>Total Items</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-gray-100">{stats.total}</div>
          <div className="text-xs text-slate-500 dark:text-gray-400 mt-1 truncate" title={filterSummary || categoryTitle}>
            {filterSummary || categoryTitle || 'Study Materials'}
          </div>
        </div>

        {/* Published */}
        <div className={CARD}>
          <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 mb-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300 rounded-lg flex-shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className={LABEL}>Published</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{stats.published}</div>
          <div className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1 font-medium">Active for students</div>
        </div>

        {/* Drafts */}
        <div className={CARD}>
          <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 mb-2">
            <div className="p-1.5 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300 rounded-lg flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <span className={LABEL}>Drafts</span>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-300">{stats.drafts}</div>
          <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">Under review</div>
        </div>

        {/* Archived */}
        <div className={CARD}>
          <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 mb-2">
            <div className="p-1.5 bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300 rounded-lg flex-shrink-0">
              <Archive className="w-4 h-4" />
            </div>
            <span className={LABEL}>Archived</span>
          </div>
          <div className="text-2xl font-bold text-slate-700 dark:text-gray-300">{stats.archived}</div>
          <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">Hidden from catalog</div>
        </div>

        {/* Downloads */}
        <div className={CARD}>
          <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 mb-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300 rounded-lg flex-shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <span className={LABEL}>Downloads</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{stats.totalDownloads.toLocaleString()}</div>
          <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">Student fetches</div>
        </div>

        {/* Views */}
        <div className={CARD}>
          <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 mb-2">
            <div className="p-1.5 bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300 rounded-lg flex-shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <span className={LABEL}>Views</span>
          </div>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-300">{stats.totalViews.toLocaleString()}</div>
          <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">Student impressions</div>
        </div>
      </div>
    </div>
  );
};