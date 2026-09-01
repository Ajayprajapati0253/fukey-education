import React from 'react';
import { ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react';
import { Sparkline, type SparklineColorScheme } from '../../../../components/ui/Sparkline';

export interface KpiCardProps {
  label: string;
  value: string | number;
  deltaPct?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  colorScheme: SparklineColorScheme;
  sparklineData: number[];
  warning?: boolean;
  isLoading?: boolean;
}

const colorSchemeMap: Record<
  SparklineColorScheme,
  { bg: string; text: string; iconBg: string }
> = {
  brand: { bg: 'bg-white', text: 'text-[#2451D9] dark:text-[#60A5FA]', iconBg: 'bg-[#EAF0FE] dark:bg-[#2451D9]/20' },
  warning: { bg: 'bg-white', text: 'text-[#D97706] dark:text-[#FBBF24]', iconBg: 'bg-[#FDF3E0] dark:bg-[#D97706]/20' },
  danger: { bg: 'bg-white', text: 'text-[#DC5B3E] dark:text-[#F87171]', iconBg: 'bg-[#FCEAE4] dark:bg-[#DC5B3E]/20' },
  success: { bg: 'bg-white', text: 'text-[#16A34A] dark:text-[#4ADE80]', iconBg: 'bg-[#E7F7ED] dark:bg-[#16A34A]/20' },
  accent: { bg: 'bg-white', text: 'text-[#7C3AED] dark:text-[#C084FC]', iconBg: 'bg-[#F1EAFE] dark:bg-[#7C3AED]/20' },
  teal: { bg: 'bg-white', text: 'text-[#0D9488] dark:text-[#2DD4BF]', iconBg: 'bg-[#E4F5F3] dark:bg-[#0D9488]/20' },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  deltaPct,
  deltaLabel = 'vs last month',
  icon: Icon,
  colorScheme = 'brand',
  sparklineData,
  warning = false,
  isLoading = false,
}) => {
  const scheme = colorSchemeMap[colorScheme] || colorSchemeMap.brand;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-[#E6E8EE] dark:border-[#334155] animate-pulse flex flex-col justify-between h-[130px]">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800" />
          <div className="space-y-1 text-right">
            <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded ml-auto" />
            <div className="h-6 w-12 bg-gray-100 dark:bg-gray-800 rounded ml-auto" />
          </div>
        </div>
        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg w-full mt-2" />
      </div>
    );
  }

  const isPositive = deltaPct !== undefined && deltaPct > 0;
  const isNegative = deltaPct !== undefined && deltaPct < 0;

  return (
    <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-[#E6E8EE] dark:border-[#334155] hover:border-[#D1D5DB] dark:hover:border-gray-600 transition-all duration-200 flex flex-col justify-between group shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
      {/* Top section: Icon on left, Label + Value + Delta on right */}
      <div className="flex justify-between items-start mb-2">
        <div
          className={`w-9 h-9 rounded-xl ${scheme.iconBg} ${scheme.text} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-200`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="text-right min-w-0 flex-1 ml-2">
          <p className="text-[11px] font-semibold text-[#686E7D] dark:text-[#94A3B8] tracking-tight truncate">{label}</p>
          <div className="flex items-baseline gap-1.5 justify-end mt-0.5 flex-wrap">
            <h3 className="text-xl font-bold text-[#12141C] dark:text-white tracking-tight tabular-nums">
              {value}
            </h3>

            {/* Delta pill badge or Warning badge */}
            {warning ? (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#FDF3E0] dark:bg-[#D97706]/20 text-[#D97706] dark:text-[#FBBF24] text-[10px] font-black leading-none select-none">
                !
              </span>
            ) : deltaPct !== undefined ? (
              <span
                className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-tight ${
                  isPositive
                    ? 'bg-[#E7F7ED] text-[#16A34A] dark:bg-[#16A34A]/20 dark:text-[#4ADE80]'
                    : isNegative
                    ? 'bg-[#FCEAE4] text-[#DC5B3E] dark:bg-[#DC5B3E]/20 dark:text-[#F87171]'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {isPositive && <ArrowUp className="w-2.5 h-2.5 mr-0.5 stroke-[2.5]" />}
                {isNegative && <ArrowDown className="w-2.5 h-2.5 mr-0.5 stroke-[2.5]" />}
                {Math.abs(deltaPct)}%
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bottom section: Comparison label + Sparkline */}
      <div className="mt-1">
        <p className="text-[10px] text-[#9DA2AF] dark:text-[#64748B] font-medium text-right mb-1 select-none">
          {deltaLabel}
        </p>
        <div className="w-full h-9 rounded-lg overflow-hidden flex items-end">
          <Sparkline
            data={sparklineData}
            colorScheme={colorScheme}
            height={36}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
