import React, { useState } from 'react';
import {
  ExternalLink,
  Play,
  Pencil,
  MoreVertical,
  Radio,
  Copy,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { LiveClass, PlatformType } from '../types/live-class.types';

interface LiveClassesTableProps {
  classes: LiveClass[];
  totalResults: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetails: (liveClass: LiveClass) => void;
  onJoinLive: (liveClass: LiveClass) => void;
  onViewRecording: (liveClass: LiveClass) => void;
  onEditClass: (liveClass: LiveClass) => void;
  onDeleteClass: (id: string) => void;
  onStatusChange: (id: string, newStatus: LiveClass['status']) => void;
  onCopyLink: (link: string) => void;
}

export const LiveClassesTable: React.FC<LiveClassesTableProps> = ({
  classes,
  totalResults,
  currentPage,
  pageSize,
  onPageChange,
  onViewDetails,
  onJoinLive,
  onViewRecording,
  onEditClass,
  onDeleteClass,
  onStatusChange,
  onCopyLink
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const totalPages = Math.ceil(totalResults / pageSize);
  const startResult = (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalResults);

  const getPlatformBadge = (platform: PlatformType) => {
    switch (platform) {
      case 'YouTube':
        return (
          <span className="inline-flex items-center rounded-full border border-rose-300 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            YouTube
          </span>
        );
      case 'Jitsi':
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-blue-300 dark:border-blue-500/30 bg-blue-50/60 dark:bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            Jitsi
          </span>
        );
    }
  };

  const getStatusBadge = (status: LiveClass['status']) => {
    switch (status) {
      case 'Live':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        );
      case 'Upcoming':
        return (
          <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            Upcoming
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-[#334155] bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-gray-300">
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center rounded-full border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            Cancelled
          </span>
        );
    }
  };

  const getCategoryBadge = (category: string) => {
    return (
      <span className="inline-block mt-1 rounded bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-purple-400">
        {category}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-2xs overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-[#334155] bg-slate-50/60 dark:bg-[#0F172A]/60 font-semibold text-slate-600 dark:text-gray-400">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4 min-w-[280px]">Live Class</th>
              <th className="py-3 px-4 min-w-[170px]">Instructor</th>
              <th className="py-3 px-4 min-w-[130px]">Course</th>
              <th className="py-3 px-4 text-center min-w-[100px]">Platform</th>
              <th className="py-3 px-4 min-w-[130px]">Start Time</th>
              <th className="py-3 px-4 min-w-[90px]">Duration</th>
              <th className="py-3 px-4 text-center min-w-[95px]">Status</th>
              <th className="py-3 px-4 text-center min-w-[130px]">Meeting</th>
              <th className="py-3 px-4 text-center min-w-[80px]">Students</th>
              <th className="py-3 px-4 text-center min-w-[90px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
            {classes.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-500 dark:text-gray-400">
                  <div className="mx-auto max-w-xs space-y-2">
                    <Radio className="mx-auto h-8 w-8 text-slate-300 dark:text-gray-600" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">No live classes match your filters</p>
                    <p className="text-xs text-slate-400 dark:text-gray-500">Try adjusting your search criteria or resetting filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              classes.map((cls, idx) => (
                <tr
                  key={cls.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-[#0F172A]/50 transition-colors group"
                >
                  {/* # Column */}
                  <td className="py-3 px-4 text-center font-medium text-slate-500 dark:text-gray-400">
                    {cls.index || startResult + idx}
                  </td>

                  {/* Live Class Title & Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {/* Class Thumbnail */}
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-900 shadow-2xs">
                        <img
                          src={cls.thumbnail}
                          alt={cls.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {cls.status === 'Live' && (
                          <div className="absolute bottom-1 right-1 flex items-center gap-1 rounded bg-red-600/90 px-1 py-0.5 text-[9px] font-bold text-white shadow-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                            LIVE
                          </div>
                        )}
                        {cls.recurring && (
                          <div className="absolute top-1 left-1 rounded bg-blue-600/90 px-1 py-0.5 text-[8px] font-bold text-white">
                            RECURRING
                          </div>
                        )}
                      </div>

                      {/* Title & Category */}
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => onViewDetails(cls)}
                          className="text-left font-semibold text-slate-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-snug cursor-pointer"
                        >
                          {cls.title}
                        </button>
                        <div>{getCategoryBadge(cls.category)}</div>
                      </div>
                    </div>
                  </td>

                  {/* Instructor */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={cls.instructor.avatar}
                        alt={cls.instructor.name}
                        className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-[#334155]"
                      />
                      <span className="font-semibold text-slate-800 dark:text-gray-200 truncate max-w-[130px]">
                        {cls.instructor.name}
                      </span>
                    </div>
                  </td>

                  {/* Course */}
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-gray-300">
                    {cls.course}
                  </td>

                  {/* Platform */}
                  <td className="py-3 px-4 text-center">
                    {getPlatformBadge(cls.platform)}
                  </td>

                  {/* Start Time */}
                  <td className="py-3 px-4 text-slate-600 dark:text-gray-400 whitespace-nowrap">
                    {cls.startTime}
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-4 text-slate-600 dark:text-gray-400 whitespace-nowrap">
                    {cls.duration} mins
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(cls.status)}
                  </td>

                  {/* Meeting Actions */}
                  <td className="py-3 px-4 text-center">
                    {cls.status === 'Live' && (
                      <button
                        onClick={() => onJoinLive(cls)}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-[#0F172A] px-3 py-1 font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#0F172A] transition-colors shadow-2xs cursor-pointer"
                      >
                        <span>Join Live</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}

                    {cls.status === 'Upcoming' && (
                      <button
                        onClick={() => onViewDetails(cls)}
                        className="inline-flex items-center rounded-lg border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-[#0F172A] px-3 py-1 font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#0F172A] transition-colors shadow-2xs cursor-pointer"
                      >
                        View Details
                      </button>
                    )}

                    {cls.status === 'Completed' && (
                      <button
                        onClick={() => onViewRecording(cls)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] px-3 py-1 font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-[#0F172A] transition-colors shadow-2xs cursor-pointer"
                      >
                        <Play className="h-3 w-3 text-slate-500 dark:text-gray-400 fill-slate-500 dark:fill-gray-400" />
                        <span>View Recording</span>
                      </button>
                    )}

                    {cls.status === 'Cancelled' && (
                      <span className="text-slate-400 dark:text-gray-600 font-bold">—</span>
                    )}
                  </td>

                  {/* Students */}
                  <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-gray-300">
                    {cls.students}
                  </td>

                  {/* Actions Column */}
                  <td className="py-3 px-4 text-center">
                    <div className="relative inline-flex items-center gap-1">
                      {/* Edit Pencil Button */}
                      <button
                        onClick={() => onEditClass(cls)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-[#0F172A] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit live class"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      {/* More Menu Button */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === cls.id ? null : cls.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-[#0F172A] hover:text-slate-800 dark:hover:text-gray-200 transition-colors"
                          title="More options"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === cls.id && (
                          <div
                            onMouseLeave={() => setActiveMenuId(null)}
                            className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] py-1 shadow-lg text-left animate-in fade-in zoom-in-95"
                          >
                            <button
                              onClick={() => {
                                onViewDetails(cls);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-[#0F172A] font-medium"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-400 dark:text-gray-500" />
                              View Details
                            </button>

                            <button
                              onClick={() => {
                                onCopyLink(cls.meetingUrl);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-[#0F172A] font-medium"
                            >
                              <Copy className="h-3.5 w-3.5 text-slate-400 dark:text-gray-500" />
                              Copy Join Link
                            </button>

                            <button
                              onClick={() => {
                                onEditClass(cls);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-[#0F172A] font-medium"
                            >
                              <Pencil className="h-3.5 w-3.5 text-slate-400 dark:text-gray-500" />
                              Edit Class
                            </button>

                            <div className="border-t border-slate-100 dark:border-[#334155] my-1"></div>

                            {cls.status !== 'Live' && cls.status !== 'Completed' && (
                              <button
                                onClick={() => {
                                  onStatusChange(cls.id, 'Live');
                                  setActiveMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-medium"
                              >
                                <Radio className="h-3.5 w-3.5" />
                                Start Live Now
                              </button>
                            )}

                            {cls.status !== 'Completed' && (
                              <button
                                onClick={() => {
                                  onStatusChange(cls.id, 'Completed');
                                  setActiveMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 font-medium"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Mark as Completed
                              </button>
                            )}

                            {cls.status !== 'Cancelled' && (
                              <button
                                onClick={() => {
                                  onStatusChange(cls.id, 'Cancelled');
                                  setActiveMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 font-medium"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Cancel Class
                              </button>
                            )}

                            <div className="border-t border-slate-100 dark:border-[#334155] my-1"></div>

                            <button
                              onClick={() => {
                                onDeleteClass(cls.id);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete Class
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-4 py-3.5 text-xs text-slate-600 dark:text-gray-400">
        <div>
          Showing <span className="font-semibold text-slate-800 dark:text-gray-200">{classes.length > 0 ? startResult : 0}</span> to{' '}
          <span className="font-semibold text-slate-800 dark:text-gray-200">{endResult}</span> of{' '}
          <span className="font-semibold text-slate-800 dark:text-gray-200">{totalResults}</span> results
        </div>

        {/* Page Nav Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(0, 3)
            .map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === p
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-[#0F172A]'
                }`}
              >
                {p}
              </button>
            ))}

          {totalPages > 4 && <span className="px-1 text-slate-400 dark:text-gray-500">...</span>}

          {totalPages > 3 && (
            <button
              onClick={() => onPageChange(totalPages)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                currentPage === totalPages
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-[#0F172A]'
              }`}
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};