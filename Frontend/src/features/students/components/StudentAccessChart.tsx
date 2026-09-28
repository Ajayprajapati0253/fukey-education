import React from 'react';
import { Shield } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import type { StudentAccessBreakdown } from '../types';

interface StudentAccessChartProps {
  data?: StudentAccessBreakdown | null;
}

export const StudentAccessChart: React.FC<StudentAccessChartProps> = ({ data }) => {
  const activeCount = data?.activeCount ?? 1132;
  const expiringCount = data?.expiringCount ?? 64;
  const expiredCount = data?.expiredCount ?? 116;
  const total = data?.total ?? 1248;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const activeStroke = (90 / 100) * circumference;
  const expiringStroke = (5 / 100) * circumference;
  const expiredStroke = (5 / 100) * circumference;

  return (
    <Card padding="none" className="p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#e2e8f0] dark:border-[#334155]">
        <Shield className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        <h3 className="text-xs font-semibold text-[#0f172a] dark:text-gray-100 uppercase tracking-wider">
          Student Access
        </h3>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[#0f172a] dark:text-gray-300">
              Active ({activeCount.toLocaleString()}){' '}
              <span className="text-[#64748b] dark:text-gray-400 font-medium">90%</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-[#0f172a] dark:text-gray-300">
              Expiring Soon ({expiringCount}){' '}
              <span className="text-[#64748b] dark:text-gray-400 font-medium">5%</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-[#0f172a] dark:text-gray-300">
              Expired ({expiredCount}){' '}
              <span className="text-[#64748b] dark:text-gray-400 font-medium">5%</span>
            </span>
          </div>
        </div>

        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r={radius}
              strokeWidth="9" fill="transparent"
              className="stroke-[#e2e8f0] dark:stroke-[#334155]"
            />
            <circle
              cx="50" cy="50" r={radius}
              stroke="#10b981" strokeWidth="9"
              strokeDasharray={`${activeStroke} ${circumference}`}
              strokeDashoffset="0" strokeLinecap="round" fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <circle
              cx="50" cy="50" r={radius}
              stroke="#f59e0b" strokeWidth="9"
              strokeDasharray={`${expiringStroke} ${circumference}`}
              strokeDashoffset={-activeStroke} strokeLinecap="round" fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <circle
              cx="50" cy="50" r={radius}
              stroke="#f43f5e" strokeWidth="9"
              strokeDasharray={`${expiredStroke} ${circumference}`}
              strokeDashoffset={-(activeStroke + expiringStroke)} strokeLinecap="round" fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-sm font-bold text-[#0f172a] dark:text-gray-100 leading-none">
              {total.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#64748b] dark:text-gray-400 leading-none mt-1">Total</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentAccessChart;