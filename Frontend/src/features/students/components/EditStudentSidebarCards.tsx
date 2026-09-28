import React, { useState } from 'react';
import {
  Mail,
  Calendar,
  Clock,
  GraduationCap,
  Award,
  Plus,
  ChevronRight,
  Layers,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import type { Student } from '../types';
import { StudentAvatar } from './StudentAvatar';

interface EditStudentSidebarCardsProps {
  student: Student;
  onSendEmail: () => void;
  onSendLoginLink: () => void;
  onExtendAccess: () => void;
  onDeleteAccount: () => void;
  onAddCourse: () => void;
  onSelectCourse?: (courseId: string) => void;
  isQuickActionsTargeted?: boolean;
}

const DIVIDER = 'border-[#e2e8f0] dark:border-[#334155]';

export const EditStudentSidebarCards: React.FC<EditStudentSidebarCardsProps> = ({
  student,
  onSendEmail,
  onSendLoginLink,
  onExtendAccess,
  onDeleteAccount,
  onAddCourse,
  onSelectCourse,
  isQuickActionsTargeted = false,
}) => {
  const [loginLinkSent, setLoginLinkSent] = useState(false);

  const handleLoginLinkClick = () => {
    onSendLoginLink();
    setLoginLinkSent(true);
    setTimeout(() => setLoginLinkSent(false), 2500);
  };

  const hasCerts = student.certificates && student.certificates > 0;

  return (
    <div className="space-y-4">
      <Card padding="none" className="p-5 relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <Badge
            variant={student.status === 'Active' ? 'success' : student.status === 'Expired' ? 'danger' : 'warning'}
          >
            {student.status}
          </Badge>
        </div>

        <div className="flex flex-col items-center pt-2">
          <div className="relative mb-3">
            <StudentAvatar
              name={student.name}
              initials={student.initials}
              avatarUrl={student.avatarUrl}
              avatarBgColor={student.avatarBgColor}
              size="xl"
              showIllustration={student.id === '1' || !student.avatarUrl}
            />
          </div>
          <h2 className="text-xl font-bold text-[#0f172a] dark:text-gray-100 text-center tracking-tight">
            {student.name}
          </h2>
          <p className="text-xs text-[#64748b] dark:text-gray-400 text-center mt-0.5">{student.phone}</p>
          <div className="flex items-center gap-1.5 text-xs text-[#0f172a] dark:text-gray-300 mt-2">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{student.email}</span>
          </div>
        </div>

        <div className={`border-t ${DIVIDER} my-4`} />

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#64748b] dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Joined At</span>
            </div>
            <span className="text-[#0f172a] dark:text-gray-100 font-medium">
              {student.joinedAt}
              {student.joinedTime ? `, ${student.joinedTime}` : ''}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#64748b] dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Access Until</span>
            </div>
            <span className="text-[#0f172a] dark:text-gray-100 font-medium">
              {student.accessUntil} {student.accessPeriodLabel}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#64748b] dark:text-gray-400">
              <GraduationCap className="w-4 h-4" />
              <span>Total Courses</span>
            </div>
            <span className="text-[#0f172a] dark:text-gray-100 font-medium">
              {student.totalCourses || student.courses.length || 1}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#64748b] dark:text-gray-400">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Certificates</span>
            </div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                hasCerts
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                  : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {hasCerts ? `${student.certificates} Earned` : '0 Earned'}
            </span>
          </div>
        </div>
      </Card>

      <Card padding="none" className="p-4">
        <div className={`flex items-center justify-between mb-3 pb-2 border-b ${DIVIDER}`}>
          <h3 className="text-xs font-semibold text-[#0f172a] dark:text-gray-100">Enrolled Courses</h3>
          <button
            onClick={onAddCourse}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800/60 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            Add Course
          </button>
        </div>

        <div className="space-y-2.5">
          {student.courses.map((course) => (
            <div
              key={course.id}
              onClick={() => onSelectCourse?.(course.id)}
              className="p-3 bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-[#e2e8f0] dark:border-[#334155] hover:border-blue-300 dark:hover:border-blue-900/60 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-[#0f172a] dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors truncate">
                      {course.name}
                    </span>
                    <Badge variant={course.status === 'Active' ? 'success' : 'danger'} size="xs">
                      {course.status}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0" />
              </div>
              <div className="text-[11px] text-[#64748b] dark:text-gray-400 mt-2 pl-10">
                Enrolled: {course.enrolledAt} | Ends: {course.endsAt}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        id="quick-actions-section"
        padding="none"
        className={`p-4 scroll-mt-24 ${
          isQuickActionsTargeted ? 'ring-2 ring-amber-500 !border-amber-500 shadow-xl shadow-amber-500/20' : ''
        }`}
      >
        <div className={`flex items-center justify-between mb-3 pb-2 border-b ${DIVIDER}`}>
          <h3 className="text-xs font-semibold text-[#0f172a] dark:text-gray-100 flex items-center gap-1.5">
            <span>Quick Actions</span>
            {isQuickActionsTargeted && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
          </h3>
          <span className="text-[10px] text-[#64748b] dark:text-gray-400">Manage Account</span>
        </div>

        <div className="space-y-2.5">
          <Button type="button" variant="primary" onClick={onSendEmail} className="w-full !py-2.5 text-xs !rounded-lg">
            <Mail className="w-4 h-4" />
            Send Email
          </Button>

          <Button type="button" variant="secondary" onClick={handleLoginLinkClick} className="w-full !py-2.5 text-xs !rounded-lg">
            <LinkIcon className="w-4 h-4" />
            {loginLinkSent ? 'Login Link Sent!' : 'Send Login Link'}
          </Button>

          <Button type="button" variant="warning" onClick={onExtendAccess} className="w-full !py-2.5 text-xs !rounded-lg">
            <Clock className="w-4 h-4" />
            Extend Access
          </Button>

          <Button type="button" variant="danger" onClick={onDeleteAccount} className="w-full !py-2.5 text-xs !rounded-lg">
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EditStudentSidebarCards;