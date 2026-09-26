import React from 'react';
import { FileText, CheckCircle2, Clock, Calendar, Archive, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Sparkline, type SparklineColorScheme } from '../../../components/ui/Sparkline';
import type { PostMetricCounts, PostStatus } from '../types/post.types';

interface MetricsCardsProps {
  counts: PostMetricCounts;
  activeFilter: string;
  onSelectStatusFilter: (status: string) => void;
}

type MetricKey = 'all' | PostStatus;

const METRICS: {
  key: MetricKey;
  title: string;
  countKey: keyof PostMetricCounts;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  sparkColor: SparklineColorScheme;
  change: string;
  isPositive: boolean;
  ringBorder: string;
  sparklineData: number[];
}[] = [
  { key: 'all', title: 'Total Posts', countKey: 'total', icon: FileText, iconBg: 'bg-purple-50 dark:bg-purple-500/10', iconColor: 'text-purple-600', sparkColor: 'accent', change: '12.5%', isPositive: true, ringBorder: '!border-purple-500', sparklineData: [20, 16, 24, 15, 22, 10, 16, 8, 12, 5, 10] },
  { key: 'Published', title: 'Published', countKey: 'published', icon: CheckCircle2, iconBg: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600', sparkColor: 'success', change: '8.2%', isPositive: true, ringBorder: '!border-emerald-500', sparklineData: [18, 22, 12, 16, 6, 14, 9, 18, 10, 16, 6] },
  { key: 'Draft', title: 'Draft', countKey: 'draft', icon: Clock, iconBg: 'bg-amber-50 dark:bg-amber-500/10', iconColor: 'text-amber-600', sparkColor: 'warning', change: '5.3%', isPositive: true, ringBorder: '!border-amber-500', sparklineData: [12, 8, 18, 12, 20, 14, 25, 18, 10, 15, 20] },
  { key: 'Scheduled', title: 'Scheduled', countKey: 'scheduled', icon: Calendar, iconBg: 'bg-red-50 dark:bg-red-500/10', iconColor: 'text-red-500', sparkColor: 'danger', change: '3.1%', isPositive: false, ringBorder: '!border-red-500', sparklineData: [24, 18, 22, 14, 18, 10, 14, 6, 9, 16, 10] },
  { key: 'Archived', title: 'Archived', countKey: 'archived', icon: Archive, iconBg: 'bg-sky-50 dark:bg-sky-500/10', iconColor: 'text-sky-600', sparkColor: 'teal', change: '1.2%', isPositive: true, ringBorder: '!border-sky-500', sparklineData: [14, 18, 12, 20, 14, 10, 18, 14, 22, 18, 24] },
];

export const MetricsCards: React.FC<MetricsCardsProps> = ({ counts, activeFilter, onSelectStatusFilter }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {METRICS.map((m) => {
        const Icon = m.icon;
        const isSelected = activeFilter === m.key;
        return (
          <Card
            key={m.key}
            padding="md"
            hoverable
            onClick={() => onSelectStatusFilter(m.key)}
            className={`cursor-pointer flex flex-col justify-between ${isSelected ? `ring-2 ring-blue-100 dark:ring-blue-500/20 ${m.ringBorder}` : ''}`}
          >
            <div>
              <div className="flex items-start gap-3.5 mb-3">
                <div className={`w-10 h-10 rounded-lg ${m.iconBg} ${m.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-0.5">{m.title}</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-gray-100 leading-none">{counts[m.countKey]}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-2">
                <span className={`inline-flex items-center gap-0.5 ${m.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {m.isPositive ? <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" /> : <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />}
                  {m.change}
                </span>
                <span className="text-slate-400 dark:text-gray-500 font-normal">vs last month</span>
              </div>
            </div>
            <Sparkline data={m.sparklineData} colorScheme={m.sparkColor} height={32} />
          </Card>
        );
      })}
    </div>
  );
};