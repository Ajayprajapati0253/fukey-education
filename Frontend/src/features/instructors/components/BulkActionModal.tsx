import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  X,
  Mail,
  Users,
  ShieldAlert,
  Loader2,
  Bell,
  Sparkles,
  Info
} from 'lucide-react';
import type { Instructor, InstructorStatus, VerificationStatus } from '../types/instructor';

export type BulkActionType = 'activate' | 'deactivate' | 'verify' | 'delete';

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: BulkActionType;
  selectedInstructors: Instructor[];
  onConfirm: (payload: {
    actionType: BulkActionType;
    targetIds: string[];
    status?: InstructorStatus;
    verification?: VerificationStatus;
    reason?: string;
    notifyFaculty?: boolean;
    notifyCoordinators?: boolean;
  }) => Promise<void>;
}

export function BulkActionModal({
  isOpen,
  onClose,
  actionType,
  selectedInstructors,
  onConfirm,
}: BulkActionModalProps) {
  // Allow excluding instructors inside the modal
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form states for deactivation
  const [targetStatus, setTargetStatus] = useState<InstructorStatus>('Inactive');
  const [deactivateReason, setDeactivateReason] = useState<string>('Academic Term Break / Routine Faculty Rotation');
  const [customReason, setCustomReason] = useState<string>('');

  // Notification toggles
  const [notifyFaculty, setNotifyFaculty] = useState<boolean>(true);
  const [notifyCoordinators, setNotifyCoordinators] = useState<boolean>(true);

  // Deletion safety acknowledgment
  const [deleteConfirmed, setDeleteConfirmed] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeTargets = selectedInstructors.filter((inst) => !excludedIds.includes(inst.id));
  const activeCount = activeTargets.length;

  const toggleExclude = (id: string) => {
    setExcludedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecute = async () => {
    if (activeCount === 0) return;
    setSubmitting(true);
    try {
      const finalReason = deactivateReason === 'Other' ? customReason : deactivateReason;
      await onConfirm({
        actionType,
        targetIds: activeTargets.map((i) => i.id),
        status: actionType === 'activate' ? 'Active' : actionType === 'deactivate' ? targetStatus : undefined,
        verification: actionType === 'verify' ? 'Verified' : undefined,
        reason: finalReason,
        notifyFaculty,
        notifyCoordinators,
      });
      onClose();
    } catch (err) {
      console.error('Error executing bulk action:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getConfig = () => {
    switch (actionType) {
      case 'activate':
        return {
          title: 'Bulk Activate Faculty',
          subtitle: `Reactivate access and live class permissions for selected instructors`,
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
          headerBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
          badgeText: `${activeCount} Instructors to Activate`,
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
          confirmBtnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
          confirmLabel: `Confirm & Activate (${activeCount})`,
        };
      case 'deactivate':
        return {
          title: 'Bulk Deactivate / Suspend Faculty',
          subtitle: `Temporarily pause portal access and live class scheduling for selected instructors`,
          icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
          headerBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
          badgeText: `${activeCount} Instructors to Deactivate`,
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-700',
          confirmBtnClass: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
          confirmLabel: `Confirm & Update Status (${activeCount})`,
        };
      case 'verify':
        return {
          title: 'Bulk Faculty Verification',
          subtitle: `Grant official verification badges and authorize Classes 9th-12th board prep batches`,
          icon: <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
          headerBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
          badgeText: `${activeCount} Instructors to Verify`,
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-700',
          confirmBtnClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30',
          confirmLabel: `Confirm & Verify Credentials (${activeCount})`,
        };
      case 'delete':
        return {
          title: 'Bulk Delete Instructors (Irreversible)',
          subtitle: `Permanently delete selected instructor profiles and remove them from the system`,
          icon: <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
          headerBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
          badgeText: `${activeCount} Instructors to Delete`,
          badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border-rose-200 dark:border-rose-700',
          confirmBtnClass: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
          confirmLabel: `Permanently Delete (${activeCount})`,
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#111c34] border border-slate-200 dark:border-[#1e2c4c] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-start justify-between gap-3 ${config.headerBg}`}>
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#162238] border border-slate-200/80 dark:border-[#1e2c4c] flex items-center justify-center shrink-0 shadow-xs">
              {config.icon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {config.title}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badgeColor}`}>
                  {config.badgeText}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {config.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 dark:text-slate-200">
          {/* Target Instructors Preview Pill Carousel / List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Selected Faculty Members ({activeCount})</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Click ✕ on any instructor to exclude from this bulk action
              </span>
            </div>

            {selectedInstructors.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                No instructors selected.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-[#1e2c4c] rounded-xl divide-y divide-slate-100 dark:divide-[#1e2c4c] bg-slate-50/50 dark:bg-[#0b1329]">
                {selectedInstructors.map((inst) => {
                  const isExcluded = excludedIds.includes(inst.id);
                  return (
                    <div
                      key={inst.id}
                      className={`flex items-center justify-between p-2.5 sm:px-3.5 transition-colors ${
                        isExcluded ? 'opacity-40 bg-slate-100/50 dark:bg-slate-900/30' : 'hover:bg-white dark:hover:bg-[#14203a]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={inst.avatar}
                          alt={inst.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {inst.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {inst.subject}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {inst.email} · {inst.coursesCount} courses · {inst.studentsCount} students
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-600 dark:text-slate-300">
                          {inst.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleExclude(inst.id)}
                          className={`p-1 rounded-md text-xs transition-colors ${
                            isExcluded
                              ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 font-semibold'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30'
                          }`}
                          title={isExcluded ? 'Re-include instructor' : 'Exclude instructor'}
                        >
                          {isExcluded ? 'Include' : <X className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action-Specific Details & Policy Impact */}
          {actionType === 'activate' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Administrative Impact & Permissions Restoration</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1 text-[11px] leading-relaxed">
                  <li><strong>Instructor Portal:</strong> Selected faculty will immediately regain write permissions to create modules, conduct live classes, and log attendance.</li>
                  <li><strong>Student Rosters:</strong> Assigned courses for Classes 9th-12th (Hindi & English medium) will show active faculty badges on student dashboards.</li>
                  <li><strong>Batch Timetables:</strong> Live schedule reminders and SMS notifications will automatically resume.</li>
                </ul>
              </div>

              {/* Notification Checkbox */}
              <div className="space-y-2.5 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyFaculty}
                    onChange={(e) => setNotifyFaculty(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Send automated reactivation notification email/SMS to selected faculty accounts.
                  </span>
                </label>
              </div>
            </div>
          )}

          {actionType === 'deactivate' && (
            <div className="space-y-4">
              {/* Target Status Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Set Target Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      targetStatus === 'Inactive'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-semibold'
                        : 'border-slate-200 dark:border-[#1e2c4c] bg-white dark:bg-[#162238] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetStatus"
                      value="Inactive"
                      checked={targetStatus === 'Inactive'}
                      onChange={() => setTargetStatus('Inactive')}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="text-xs font-bold">Mark as Inactive</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Term break, temporary hiatus or leave
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      targetStatus === 'Suspended'
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 font-semibold'
                        : 'border-slate-200 dark:border-[#1e2c4c] bg-white dark:bg-[#162238] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetStatus"
                      value="Suspended"
                      checked={targetStatus === 'Suspended'}
                      onChange={() => setTargetStatus('Suspended')}
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs font-bold">Suspend Account</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Administrative review or policy hold
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Deactivation Reason Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Administrative Reason for Status Change
                </label>
                <select
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                >
                  <option value="Academic Term Break / Routine Faculty Rotation">Academic Term Break / Routine Faculty Rotation</option>
                  <option value="Faculty Leave of Absence / Medical Break">Faculty Leave of Absence / Medical Break</option>
                  <option value="Pending Performance & Attendance Review">Pending Performance & Attendance Review</option>
                  <option value="Curriculum Syllabus Restructuring">Curriculum Syllabus Restructuring</option>
                  <option value="Contract Period Completed">Contract Period Completed</option>
                  <option value="Other">Other (Specify below)</option>
                </select>

                {deactivateReason === 'Other' && (
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter reason for deactivation..."
                    className="w-full mt-2 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                )}
              </div>

              {/* Notice Box */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Important Protocol for Inactive Accounts</span>
                </div>
                <p>
                  Instructors will lose write access to classes and course content. Existing student enrollments in Classes 9th-12th will not be deleted; batch coordinators will be notified to review upcoming live sessions.
                </p>
              </div>

              {/* Notification Checkboxes */}
              <div className="space-y-2 pt-1 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyFaculty}
                    onChange={(e) => setNotifyFaculty(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <span>Send status change advisory email to selected instructors.</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyCoordinators}
                    onChange={(e) => setNotifyCoordinators(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <span>Notify batch coordinators to arrange substitute faculty for active classes.</span>
                </label>
              </div>
            </div>
          )}

          {actionType === 'verify' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Faculty Credential & Identity Verification</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Marking these instructors as <strong>Verified</strong> confirms that their identity documents, B.Ed / Master's degrees, and CBSE/State Board syllabus competency have been vetted and approved by Fukey Education Admin.
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1 text-[11px]">
                  <li>A verified badge will appear next to their name across the app and student mobile view.</li>
                  <li>Eligible to create certified test series and board exam sample paper solutions.</li>
                </ul>
              </div>

              {/* Notification Checkbox */}
              <div className="space-y-2 pt-1 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyFaculty}
                    onChange={(e) => setNotifyFaculty(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <span>Dispatch verification certificate confirmation email with official badge.</span>
                </label>
              </div>
            </div>
          )}

          {actionType === 'delete' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs space-y-2">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Irreversible Administrative Action</span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed font-medium">
                  You are about to permanently delete <strong>{activeCount} instructor profiles</strong> from Fukey Education.
                </p>
                <ul className="list-disc list-inside space-y-1 text-rose-700/90 dark:text-rose-300/80 pl-1 text-[11px]">
                  <li>All associated instructor profile metadata, bio, and login credentials will be erased.</li>
                  <li>Assigned courses will be unassigned to prevent dangling references.</li>
                  <li>Past attendance logs will be preserved in institutional audit records.</li>
                </ul>
              </div>

              {/* Safety Confirmation Checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-rose-300 dark:border-rose-700 dark:bg-slate-800"
                />
                <span className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                  I understand that this deletion is permanent and cannot be undone. I want to proceed with deleting {activeCount} instructors.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 border-t border-slate-200/80 dark:border-[#1e2c4c] bg-slate-50/60 dark:bg-[#0e1629] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {activeCount === 0 ? (
              <span className="text-rose-500 font-semibold">Please include at least 1 instructor</span>
            ) : (
              <span>Ready to update <strong>{activeCount}</strong> of {selectedInstructors.length} faculty members</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExecute}
              disabled={submitting || activeCount === 0 || (actionType === 'delete' && !deleteConfirmed)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${config.confirmBtnClass}`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing in real-time...</span>
                </>
              ) : (
                <span>{config.confirmLabel}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
