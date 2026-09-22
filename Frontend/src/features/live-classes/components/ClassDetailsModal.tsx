import React from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  User,
  ExternalLink,
  Users,
  Repeat,
  Copy,
  Radio,
  Share2,
  FileCheck
} from 'lucide-react';
import type { LiveClass } from '../types/live-class.types';

interface ClassDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveClass: LiveClass | null;
  onJoinLive: (liveClass: LiveClass) => void;
  onViewRecording: (liveClass: LiveClass) => void;
  onCopyLink: (link: string) => void;
}

export const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({
  isOpen,
  onClose,
  liveClass,
  onJoinLive,
  onViewRecording,
  onCopyLink
}) => {
  if (!isOpen || !liveClass) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                liveClass.status === 'Live'
                  ? 'bg-emerald-100 text-emerald-800'
                  : liveClass.status === 'Upcoming'
                  ? 'bg-blue-100 text-blue-800'
                  : liveClass.status === 'Completed'
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {liveClass.status}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ID: {liveClass.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-5">
          {/* Title and Thumbnail */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative h-28 w-full sm:w-44 shrink-0 overflow-hidden rounded-xl bg-slate-900 shadow-xs">
              <img
                src={liveClass.thumbnail}
                alt={liveClass.title}
                className="h-full w-full object-cover"
              />
              {liveClass.status === 'Live' && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  LIVE NOW
                </div>
              )}
            </div>

            <div className="flex-1">
              <span className="inline-block rounded bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">
                {liveClass.category}
              </span>
              <h3 className="mt-1 text-base font-bold text-slate-900 leading-snug">
                {liveClass.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                Course: <span className="text-slate-800 font-semibold">{liveClass.course}</span>
              </p>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block font-medium">Start Time</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{liveClass.startTime}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block font-medium">Duration</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{liveClass.duration} Minutes</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block font-medium">Platform</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{liveClass.platform}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block font-medium">Enrolled Students</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{liveClass.students} Registered</span>
            </div>
          </div>

          {/* Instructor Card */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5">
            <div className="flex items-center gap-3">
              <img
                src={liveClass.instructor.avatar}
                alt={liveClass.instructor.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/20"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {liveClass.instructor.name}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {liveClass.instructor.specialty || 'Lead Faculty'}
                </p>
              </div>
            </div>
            <a
              href={`mailto:${liveClass.instructor.email || 'faculty@fukeyedu.com'}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Contact
            </a>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">
              Class Overview & Syllabus Objectives
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
              {liveClass.description ||
                'In-depth instructional session emphasizing conceptual clarity, NCERT step-by-step illustrations, doubt-clearing segments, and high-frequency exam questions.'}
            </p>
          </div>

          {/* Meeting Link & Controls */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-1.5">
              Live Stream & Meeting Information
            </h4>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5">
              <span className="text-xs text-slate-600 font-mono truncate max-w-sm">
                {liveClass.meetingUrl}
              </span>
              <button
                onClick={() => onCopyLink(liveClass.meetingUrl)}
                className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => onCopyLink(liveClass.meetingUrl)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <Share2 className="h-4 w-4" />
            <span>Share Invitation</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>

            {liveClass.status === 'Live' && (
              <button
                onClick={() => {
                  onClose();
                  onJoinLive(liveClass);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs"
              >
                <Radio className="h-4 w-4 animate-pulse" />
                <span>Join Broadcast Now</span>
              </button>
            )}

            {liveClass.status === 'Completed' && (
              <button
                onClick={() => {
                  onClose();
                  onViewRecording(liveClass);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-2xs"
              >
                <Video className="h-4 w-4" />
                <span>Watch Recording</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
