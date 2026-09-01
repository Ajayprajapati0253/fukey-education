import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Tabs, type TabItem } from '../../../../components/ui/Tabs';
import type { TimeRange, DashboardOverviewResponse } from '../types/dashboard.types';
import { useUIStore } from '../../../../store/ui.store';

interface RevenueOverviewChartProps {
  data?: DashboardOverviewResponse['revenueOverview'];
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  currency?: string;
  isLoading?: boolean;
}

const timeRangeTabs: TabItem<TimeRange>[] = [
  { id: '7D', label: '7D' },
  { id: '30D', label: '30D' },
  { id: '3M', label: '3M' },
  { id: '6M', label: '6M' },
  { id: '1Y', label: '1Y' },
  { id: 'custom', label: 'Custom' },
];

export const RevenueOverviewChart: React.FC<RevenueOverviewChartProps> = ({
  data,
  selectedRange,
  onRangeChange,
  currency = 'INR',
  isLoading = false,
}) => {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const points = data?.points || [];

  const gridStroke = isDark ? '#334155' : '#F1F3F8';
  const axisStroke = isDark ? '#94A3B8' : '#9DA2AF';
  const axisLineStroke = isDark ? '#334155' : '#E6E8EE';

  return (
    <div className="bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-[#E6E8EE] dark:border-[#334155] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
      {/* Header: Title + Timeframe Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-bold text-[#12141C] dark:text-white tracking-tight">Revenue Overview</h3>
        <Tabs<TimeRange>
          tabs={timeRangeTabs}
          activeTab={selectedRange}
          onChange={onRangeChange}
          size="sm"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mb-3 text-xs font-semibold text-[#686E7D] dark:text-[#94A3B8]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2451D9] dark:bg-[#60A5FA]" />
          <span>Revenue ({currencySymbol})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] dark:bg-[#4ADE80]" />
          <span>Orders</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[230px] sm:h-[260px] relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50/70 dark:bg-gray-800/70 rounded-xl animate-pulse">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Loading chart analytics...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2451D9" stopOpacity={isDark ? 0.35 : 0.25} />
                  <stop offset="95%" stopColor="#2451D9" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={isDark ? 0.3 : 0.2} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />

              <XAxis
                dataKey="date"
                stroke={axisStroke}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: axisLineStroke }}
                dy={6}
              />

              {/* Left Y Axis: Revenue */}
              <YAxis
                yAxisId="left"
                stroke={axisStroke}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  val >= 1000 ? `${currencySymbol}${(val / 1000).toFixed(0)}k` : `${currencySymbol}${val}`
                }
              />

              {/* Right Y Axis: Orders count */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={axisStroke}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}`}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-[#0F172A] p-3 rounded-xl border border-[#E6E8EE] dark:border-[#334155] shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.4)] text-xs font-sans space-y-1">
                        <p className="font-bold text-[#12141C] dark:text-white">{label}</p>
                        <div className="flex items-center justify-between gap-4 text-[#2451D9] dark:text-[#60A5FA]">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#2451D9] dark:bg-[#60A5FA]" /> Revenue:
                          </span>
                          <span className="font-bold tabular-nums">
                            {currencySymbol}
                            {Number(payload[0]?.value || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-[#16A34A] dark:text-[#4ADE80]">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#16A34A] dark:bg-[#4ADE80]" /> Orders:
                          </span>
                          <span className="font-bold tabular-nums">{payload[1]?.value || 0}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#2451D9"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                activeDot={{ r: 5, fill: '#2451D9', stroke: isDark ? '#1E293B' : '#fff', strokeWidth: 2 }}
              />

              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#16A34A"
                strokeWidth={2}
                strokeDasharray="4 2"
                fillOpacity={1}
                fill="url(#ordersGradient)"
                activeDot={{ r: 4, fill: '#16A34A', stroke: isDark ? '#1E293B' : '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom 4-Column Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-[#F1F3F8] dark:border-gray-800">
        {/* Stat 1: Total Revenue */}
        <div className="text-center">
          <h4 className="text-base sm:text-lg font-bold text-[#12141C] dark:text-white tabular-nums">
            {currencySymbol}
            {data?.totalRevenue.value.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || '0.00'}
          </h4>
          <p className="text-[11px] font-medium text-[#686E7D] dark:text-[#94A3B8] flex items-center justify-center gap-1 mt-0.5">
            <span>Total Revenue</span>
            {data?.totalRevenue.deltaPct !== undefined && (
              <span className="text-[#16A34A] dark:text-[#4ADE80] font-bold inline-flex items-center">
                <ArrowUp className="w-2.5 h-2.5 stroke-[2.5]" /> {data.totalRevenue.deltaPct}%
              </span>
            )}
          </p>
        </div>

        {/* Stat 2: Total Orders */}
        <div className="text-center sm:border-l border-[#F1F3F8] dark:border-gray-800">
          <h4 className="text-base sm:text-lg font-bold text-[#12141C] dark:text-white tabular-nums">
            {data?.totalOrders.value.toLocaleString() || '93'}
          </h4>
          <p className="text-[11px] font-medium text-[#686E7D] dark:text-[#94A3B8] flex items-center justify-center gap-1 mt-0.5">
            <span>Total Orders</span>
            {data?.totalOrders.deltaPct !== undefined && (
              <span className="text-[#16A34A] dark:text-[#4ADE80] font-bold inline-flex items-center">
                <ArrowUp className="w-2.5 h-2.5 stroke-[2.5]" /> {data.totalOrders.deltaPct}%
              </span>
            )}
          </p>
        </div>

        {/* Stat 3: Avg. Order Value */}
        <div className="text-center sm:border-l border-[#F1F3F8] dark:border-gray-800">
          <h4 className="text-base sm:text-lg font-bold text-[#12141C] dark:text-white tabular-nums">
            {currencySymbol}
            {data?.avgOrderValue.value.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || '0.00'}
          </h4>
          <p className="text-[11px] font-medium text-[#686E7D] dark:text-[#94A3B8] flex items-center justify-center gap-1 mt-0.5">
            <span>Avg. Order Value</span>
            {data?.avgOrderValue.deltaPct !== undefined && (
              <span className="text-[#16A34A] dark:text-[#4ADE80] font-bold inline-flex items-center">
                <ArrowUp className="w-2.5 h-2.5 stroke-[2.5]" /> {data.avgOrderValue.deltaPct}%
              </span>
            )}
          </p>
        </div>

        {/* Stat 4: Refunds */}
        <div className="text-center sm:border-l border-[#F1F3F8] dark:border-gray-800">
          <h4 className="text-base sm:text-lg font-bold text-[#12141C] dark:text-white tabular-nums">
            {data?.refunds.value.toLocaleString() || '0'}
          </h4>
          <p className="text-[11px] font-medium text-[#686E7D] dark:text-[#94A3B8] flex items-center justify-center gap-1 mt-0.5">
            <span>Refunds</span>
            {data?.refunds.deltaPct !== undefined && (
              <span className="text-[#DC5B3E] dark:text-[#F87171] font-bold inline-flex items-center">
                <ArrowDown className="w-2.5 h-2.5 stroke-[2.5]" /> {data.refunds.deltaPct}%
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueOverviewChart;
