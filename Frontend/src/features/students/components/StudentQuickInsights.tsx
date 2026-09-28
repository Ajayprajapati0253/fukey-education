import React from 'react';
import { Lightbulb, Trophy, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import type { QuickInsightFilterKey } from '../types';

interface StudentQuickInsightsProps {
  selectedInsight?: QuickInsightFilterKey;
  onSelectInsight?: (key: QuickInsightFilterKey) => void;
}

type InsightKey = 'most_enrolled' | 'needing_attention' | 'avg_progress';

const INSIGHTS: {
  key: InsightKey;
  label: string;
  title: string;
  sub: React.ReactNode;
  hint: string;
  icon: React.ElementType;
  iconBox: string;
  active: string;
  chip: string;
}[] = [
  {
    key: 'most_enrolled',
    label: 'Most Enrolled Course',
    title: 'Class 10th (All Subjects)',
    sub: '342 students (27%)',
    hint: 'Filter by Class 10th (All Subjects)',
    icon: Trophy,
    iconBox: 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-400',
    active: 'bg-amber-50 dark:bg-[#101e3d] border-amber-500/80 ring-2 ring-amber-500/30',
    chip: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/90 dark:border-amber-800/60',
  },
  {
    key: 'needing_attention',
    label: 'Students Needing Attention',
    title: 'Low Progress (< 35%)',
    sub: 'Priya Kumari (8%), Vikash (24%)',
    hint: 'Filter students with low progress (< 35%)',
    icon: AlertTriangle,
    iconBox: 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-400',
    active: 'bg-rose-50 dark:bg-[#28131e] border-rose-500/80 ring-2 ring-rose-500/30',
    chip: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/90 dark:border-rose-800/60',
  },
  {
    key: 'avg_progress',
    label: 'Average Course Progress',
    title: '62.6% Average Completion',
    sub: 'Students on-track (≥ 50%)',
    hint: 'Show students on track (progress ≥ 50%)',
    icon: TrendingUp,
    iconBox: 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400',
    active: 'bg-blue-50 dark:bg-[#0f1d3b] border-blue-500/80 ring-2 ring-blue-500/30',
    chip: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/90 dark:border-blue-800/60',
  },
];

export const StudentQuickInsights: React.FC<StudentQuickInsightsProps> = ({
  selectedInsight = null,
  onSelectInsight,
}) => {
  const handleClick = (key: InsightKey) => {
    if (!onSelectInsight) return;
    onSelectInsight(selectedInsight === key ? null : key);
  };

  return (
    <Card padding="none" className="p-4">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e2e8f0] dark:border-[#334155]">
        <Lightbulb className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        <h3 className="text-xs font-semibold text-[#0f172a] dark:text-gray-100 uppercase tracking-wider">
          Quick Insights
        </h3>
      </div>

      <div className="space-y-2.5">
        {INSIGHTS.map((item) => {
          const Icon = item.icon;
          const isActive = selectedInsight === item.key;
          return (
            <div
              key={item.key}
              onClick={() => handleClick(item.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(item.key);
                }
              }}
              title={item.hint}
              className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
                isActive
                  ? item.active
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-[#e2e8f0] dark:hover:border-[#334155]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${item.iconBox}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-[#64748b] dark:text-gray-400">{item.label}</span>
                  {isActive && (
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${item.chip}`}>
                      Filtered
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-[#0f172a] dark:text-gray-100 mt-0.5 truncate">{item.title}</div>
                <div className="text-xs text-[#64748b] dark:text-gray-400 mt-0.5">{item.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default StudentQuickInsights;