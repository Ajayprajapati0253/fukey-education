import React from 'react';
import {
  ShoppingCart,
  Clock,
  GraduationCap,
  IndianRupee,
  Layers,
  Users,
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import type { DashboardOverviewResponse } from '../types/dashboard.types';

interface KpiCardGridProps {
  kpis?: DashboardOverviewResponse['kpis'];
  currency?: string;
  isLoading?: boolean;
}

export const KpiCardGrid: React.FC<KpiCardGridProps> = ({
  kpis,
  currency = 'INR',
  isLoading = false,
}) => {
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
      {/* 1. Total Orders */}
      <KpiCard
        label="Total orders"
        value={kpis ? kpis.totalOrders.value.toLocaleString() : '0'}
        deltaPct={kpis?.totalOrders.deltaPct}
        deltaLabel={kpis?.totalOrders.comparisonLabel}
        icon={ShoppingCart}
        colorScheme="brand"
        sparklineData={kpis?.totalOrders.sparkline || []}
        isLoading={isLoading}
      />

      {/* 2. Pending Orders */}
      <KpiCard
        label="Pending orders"
        value={kpis ? kpis.pendingOrders.value.toLocaleString() : '0'}
        deltaPct={kpis?.pendingOrders.deltaPct}
        deltaLabel={kpis?.pendingOrders.comparisonLabel}
        icon={Clock}
        colorScheme="warning"
        sparklineData={kpis?.pendingOrders.sparkline || []}
        isLoading={isLoading}
      />

      {/* 3. Total Courses */}
      <KpiCard
        label="Total courses"
        value={kpis ? kpis.totalCourses.value.toLocaleString() : '0'}
        deltaPct={kpis?.totalCourses.deltaPct}
        deltaLabel={kpis?.totalCourses.comparisonLabel}
        icon={GraduationCap}
        colorScheme="danger"
        sparklineData={kpis?.totalCourses.sparkline || []}
        isLoading={isLoading}
      />

      {/* 4. Total Earnings */}
      <KpiCard
        label="Total earnings"
        value={
          kpis
            ? `${currencySymbol}${kpis.totalEarnings.value.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : `${currencySymbol}0.00`
        }
        deltaPct={kpis?.totalEarnings.deltaPct}
        deltaLabel={kpis?.totalEarnings.comparisonLabel}
        icon={IndianRupee}
        colorScheme="success"
        sparklineData={kpis?.totalEarnings.sparkline || []}
        isLoading={isLoading}
      />

      {/* 5. Pending Courses */}
      <KpiCard
        label="Pending courses"
        value={kpis ? kpis.pendingCourses.value.toLocaleString() : '0'}
        deltaLabel={kpis?.pendingCourses.comparisonLabel}
        icon={Layers}
        colorScheme="accent"
        sparklineData={kpis?.pendingCourses.sparkline || []}
        warning={true}
        isLoading={isLoading}
      />

      {/* 6. Total Students */}
      <KpiCard
        label="Total students "
        value={kpis ? kpis.totalStudents.value.toLocaleString() : '0'}
        deltaPct={kpis?.totalStudents.deltaPct}
        deltaLabel={kpis?.totalStudents.comparisonLabel}
        icon={Users}
        colorScheme="teal"
        sparklineData={kpis?.totalStudents.sparkline || []}
        isLoading={isLoading}
      />
    </div>
  );
};

export default KpiCardGrid;
