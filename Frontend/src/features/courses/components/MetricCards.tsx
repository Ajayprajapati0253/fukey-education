// src/features/courses/components/MetricCards.tsx

import React from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  XCircle,
  Archive,
} from 'lucide-react';

import { Card } from '../../../components/ui/Card';

import type {
  CourseStatus,
} from '../types/course.types';

interface MetricCardsProps {
  /**
   * Current page courses.
   * Used only as a fallback when metric counts are not provided.
   */
  courses: any[];

  /**
   * Total number of courses from API pagination meta.
   */
  totalCourses?: number;

  /**
   * Real status counts from API.
   */
  publishedCount?: number;
  pendingReviewCount?: number;
  draftCount?: number;
  archivedCount?: number;

  activeStatusFilter: string;

  onSelectStatusFilter: (
    status: string,
  ) => void;
}

type MetricKey =
  | 'All Status'
  | CourseStatus;

interface MetricConfig {
  key: MetricKey;
  label: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  ringColor: string;
  borderColor: string;
}

const METRICS: MetricConfig[] = [
  {
    key: 'All Status',
    label: 'Total Courses',
    icon: GraduationCap,
    iconBg:
      'bg-blue-50 dark:bg-blue-500/10',
    iconColor: 'text-[#3b82f6]',
    ringColor:
      'ring-blue-100 dark:ring-blue-500/20',
    borderColor:
      '!border-[#3b82f6]',
  },

  {
    key: 'Published',
    label: 'Published',
    icon: CheckCircle2,
    iconBg:
      'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor:
      'text-emerald-600',
    ringColor:
      'ring-emerald-100 dark:ring-emerald-500/20',
    borderColor:
      '!border-emerald-500',
  },

  {
    key: 'Pending Review',
    label: 'Pending Review',
    icon: Clock,
    iconBg:
      'bg-orange-50 dark:bg-orange-500/10',
    iconColor:
      'text-orange-500',
    ringColor:
      'ring-orange-100 dark:ring-orange-500/20',
    borderColor:
      '!border-orange-500',
  },

  {
    key: 'Draft',
    label: 'Draft',
    icon: XCircle,
    iconBg:
      'bg-rose-50 dark:bg-rose-500/10',
    iconColor:
      'text-rose-500',
    ringColor:
      'ring-rose-100 dark:ring-rose-500/20',
    borderColor:
      '!border-rose-500',
  },

  {
    key: 'Archived',
    label: 'Archived',
    icon: Archive,
    iconBg:
      'bg-blue-50 dark:bg-blue-500/10',
    iconColor:
      'text-[#3b82f6]',
    ringColor:
      'ring-blue-100 dark:ring-blue-500/20',
    borderColor:
      '!border-blue-500',
  },
];

export const MetricCards: React.FC<
  MetricCardsProps
> = ({
  courses = [],

  totalCourses,

  publishedCount,
  pendingReviewCount,
  draftCount,
  archivedCount,

  activeStatusFilter,
  onSelectStatusFilter,
}) => {
  /* --------------------------------------------------
     TOTAL
  -------------------------------------------------- */

  const total =
    typeof totalCourses === 'number'
      ? totalCourses
      : courses.length;

  /* --------------------------------------------------
     STATUS COUNTS
  -------------------------------------------------- */

  const countFor = (
    key: MetricKey,
  ): number => {
    switch (key) {
      case 'All Status':
        return total;

      case 'Published':
        if (
          typeof publishedCount ===
          'number'
        ) {
          return publishedCount;
        }

        return courses.filter(
          (course) =>
            String(
              course.status ?? '',
            )
              .trim()
              .toLowerCase() ===
            'published',
        ).length;

      case 'Pending Review':
        if (
          typeof pendingReviewCount ===
          'number'
        ) {
          return pendingReviewCount;
        }

        return courses.filter(
          (course) => {
            const status =
              String(
                course.status ?? '',
              )
                .trim()
                .toLowerCase();

            return (
              status === 'pending' ||
              status ===
                'pending review'
            );
          },
        ).length;

      case 'Draft':
        if (
          typeof draftCount ===
          'number'
        ) {
          return draftCount;
        }

        return courses.filter(
          (course) =>
            String(
              course.status ?? '',
            )
              .trim()
              .toLowerCase() ===
            'draft',
        ).length;

      case 'Archived':
        if (
          typeof archivedCount ===
          'number'
        ) {
          return archivedCount;
        }

        return courses.filter(
          (course) =>
            String(
              course.status ?? '',
            )
              .trim()
              .toLowerCase() ===
            'archived',
        ).length;

      default:
        return 0;
    }
  };

  /* --------------------------------------------------
     PERCENTAGE
  -------------------------------------------------- */

  const percentageFor = (
    key: MetricKey,
  ): string => {
    if (total <= 0) {
      return '0%';
    }

    const count = countFor(key);

    return `${(
      (count / total) *
      100
    ).toFixed(1)}%`;
  };

  /* --------------------------------------------------
     ACTIVE FILTER
  -------------------------------------------------- */

  const isActive = (
    key: MetricKey,
  ): boolean => {
    if (key === 'All Status') {
      return (
        activeStatusFilter ===
          'All Status' ||
        activeStatusFilter === ''
      );
    }

    return (
      activeStatusFilter === key
    );
  };

  /* --------------------------------------------------
     RENDER
  -------------------------------------------------- */

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

      {METRICS.map(
        ({
          key,
          label,
          icon: Icon,
          iconBg,
          iconColor,
          ringColor,
          borderColor,
        }) => {
          const active =
            isActive(key);

          const count =
            countFor(key);

          return (
            <Card
              key={key}
              padding="md"
              hoverable
              onClick={() =>
                onSelectStatusFilter(
                  active &&
                    key !==
                      'All Status'
                    ? 'All Status'
                    : key,
                )
              }
              className={`flex items-center gap-4 cursor-pointer ${
                active
                  ? `ring-2 ${ringColor} ${borderColor}`
                  : ''
              }`}
            >

              {/* ICON */}

              <div
                className={`w-12 h-12 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* CONTENT */}

              <div>

                <p className="text-xs font-medium text-[#64748b] dark:text-gray-400 mb-1">
                  {label}
                </p>

                <h3 className="text-2xl font-bold text-[#0f172a] dark:text-gray-100 leading-none mb-1">
                  {count.toLocaleString()}
                </h3>

                <p
                  className={`text-xs font-medium ${iconColor}`}
                >
                  {key ===
                  'All Status'
                    ? `${total.toLocaleString()} total`
                    : `${percentageFor(
                        key,
                      )} of total`}
                </p>

              </div>

            </Card>
          );
        },
      )}

    </div>
  );
};