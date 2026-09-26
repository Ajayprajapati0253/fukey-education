import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  Play,
  Bell,
  Send,
  Users,
  CheckCircle2,
  Mail,
  MessageSquare,
  Phone,
  Copy,
  Check,
  Repeat,
  Sparkles,
  Edit,
} from 'lucide-react';
import type { CalendarLiveClass, CalendarClassStatus } from '../types/calendar-live-class.types';

interface CalendarClassDetailsModalProps {
  item: CalendarLiveClass | null;
  onClose: () => void;
  onJoinLive: (item: CalendarLiveClass) => void;
  onViewRecording: (item: CalendarLiveClass) => void;
  onEditClass: (item: CalendarLiveClass) => void;
  onTriggerReminders: (item: CalendarLiveClass, customMessage?: string) => void;
}

export const CalendarClassDetailsModal: React.FC<CalendarClassDetailsModalProps> = ({
  item,
  onClose,
  onJoinLive,
  onViewRecording,
  onEditClass,
  onTriggerReminders,
}) => {
  const [copied, setCopied] = useState(false);
  const [customBlastMessage, setCustomBlastMessage] = useState('');
  const [showBlastComposer, setShowBlastComposer] = useState(false);

  if (!item) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.meetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderStatusBadge = (status: CalendarClassStatus) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Class In Progress (Live)
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Scheduled Session
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div
      id="class-details-modal-overlay"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="class-details-modal-card"
        className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {item.title}
              </span>
              {renderStatusBadge(item.status)}
              {item.isRecurring && (
                <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                  <Repeat className="w-3 h-3 text-gray-400" /> Recurring
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{item.courseName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Room / Location: {item.roomName}</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEditClass(item)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="Edit Class"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-4 text-xs">
          {/* Schedule & Teacher Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/70 p-3.5 rounded-xl border border-gray-200/70">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">{item.date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{item.formattedTimeRange} ({item.durationMinutes} mins)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{item.currentEnrollment} students enrolled (Max: {item.maxParticipants})</span>
              </div>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l sm:pl-3 border-gray-200/80 flex items-center gap-3">
              <img
                src={item.teacherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={item.teacherName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <span className="text-[11px] text-gray-400 font-medium block">Lead Instructor</span>
                <span className="font-bold text-gray-900 text-sm">{item.teacherName}</span>
                <span className="text-[11px] text-gray-500 block">Department of {item.title}</span>
              </div>
            </div>
          </div>

          {/* Description & Topics */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Session Overview &amp; Curriculum</h4>
            <p className="text-gray-600 leading-relaxed bg-white border border-gray-100 p-3 rounded-lg">
              {item.description}
            </p>
            {item.topics && item.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Meeting Room Link */}
          <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
            <div className="truncate mr-3">
              <span className="text-[11px] font-semibold text-blue-900 block">Live Meeting Endpoint</span>
              <span className="text-xs font-mono text-blue-700 truncate block">{item.meetLink}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg text-blue-700 transition"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              {item.status === 'live' && (
                <button
                  type="button"
                  onClick={() => onJoinLive(item)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Video className="w-3.5 h-3.5" />
                  Join Room
                </button>
              )}
            </div>
          </div>

          {/* AUTOMATED REMINDERS CONTROL PANEL */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="font-bold text-gray-900 text-xs">Automated Reminders System</span>
                  <span className="text-[10px] text-gray-500 block">
                    Trigger schedule: {item.automatedReminders.offsetsMinutes.map(m => m >= 60 ? `${m/60}h` : `${m}m`).join(', ')} before session
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBlastComposer(!showBlastComposer)}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-lg shadow-2xs flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                Blast Reminder Now
              </button>
            </div>

            {/* Custom Blast Composer */}
            {showBlastComposer && (
              <div className="bg-white p-3 rounded-lg border border-indigo-200 space-y-2 text-xs">
                <span className="font-semibold text-gray-800 block text-[11px]">Instant Alert Message Override</span>
                <textarea
                  rows={2}
                  value={customBlastMessage}
                  onChange={(e) => setCustomBlastMessage(e.target.value)}
                  placeholder={item.automatedReminders.customMessageTemplate}
                  className="w-full border border-gray-200 rounded p-2 text-xs text-gray-800"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBlastComposer(false)}
                    className="px-3 py-1 text-[11px] text-gray-500 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerReminders(item, customBlastMessage || undefined);
                      setShowBlastComposer(false);
                      setCustomBlastMessage('');
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Send to All Enrolled
                  </button>
                </div>
              </div>
            )}

            {/* Participants Reminder Status Table */}
            <div>
              <span className="font-semibold text-gray-700 block mb-1 text-[11px]">Enrolled Participants &amp; Dispatch Status:</span>
              <div className="max-h-36 overflow-y-auto rounded-lg border border-gray-200/80 bg-white divide-y divide-gray-100">
                {item.participants.map((p) => (
                  <div key={p.id} className="p-2 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-bold text-gray-800">{p.name}</span>
                      <span className="text-gray-400 ml-2">({p.email})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-gray-400">
                        {p.reminderChannels.includes('email') && <Mail className="w-3 h-3 text-blue-500" />}
                        {p.reminderChannels.includes('whatsapp') && <MessageSquare className="w-3 h-3 text-emerald-500" />}
                        {p.reminderChannels.includes('sms') && <Phone className="w-3 h-3 text-purple-500" />}
                      </div>
                      {p.reminderSent ? (
                        <span className="text-emerald-700 bg-emerald-50 font-semibold px-2 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Delivered
                        </span>
                      ) : (
                        <span className="text-gray-500 bg-gray-100 font-medium px-2 py-0.5 rounded text-[10px]">
                          Scheduled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
          <div className="text-xs text-gray-400">
            Class ID: <span className="font-mono text-gray-600">{item.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {item.status === 'live' && (
              <button
                type="button"
                onClick={() => onJoinLive(item)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Video className="w-4 h-4" />
                Join Live Room
              </button>
            )}

            {item.status === 'completed' && (
              <button
                type="button"
                onClick={() => onViewRecording(item)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Play className="w-4 h-4" />
                Watch Recording
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};