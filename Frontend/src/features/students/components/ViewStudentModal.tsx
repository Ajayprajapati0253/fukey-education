import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Mail, Phone, Calendar, Clock, BookOpen, Award, MapPin } from 'lucide-react';
import type { Student } from '../types';
import { StudentAvatar } from './StudentAvatar';

interface ViewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const STAT_BOX = 'p-2.5 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-[#e2e8f0] dark:border-[#334155]';
const STAT_LABEL = 'text-[11px] text-[#64748b] dark:text-gray-400 flex items-center justify-center gap-1';

export const ViewStudentModal: React.FC<ViewStudentModalProps> = ({ isOpen, onClose, student }) => {
  const navigate = useNavigate();

  if (!isOpen || !student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Details" maxWidth="lg">
      <div className="space-y-5">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155]">
          <StudentAvatar
            name={student.name}
            initials={student.initials}
            avatarUrl={student.avatarUrl}
            avatarBgColor={student.avatarBgColor}
            size="lg"
            showIllustration={student.id === '1'}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-[#0f172a] dark:text-gray-100 truncate">{student.name}</h4>
              <Badge variant={student.status === 'Active' ? 'success' : 'danger'}>{student.status}</Badge>
            </div>
            <p className="text-xs text-[#64748b] dark:text-gray-400 mt-0.5 truncate">{student.primaryCourse}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-[#0f172a] dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {student.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {student.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className={STAT_BOX}>
            <div className={STAT_LABEL}><Calendar className="w-3 h-3" />Joined</div>
            <div className="text-xs font-semibold text-[#0f172a] dark:text-gray-100 mt-1">{student.joinedAt}</div>
          </div>
          <div className={STAT_BOX}>
            <div className={STAT_LABEL}><Clock className="w-3 h-3" />Access Until</div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">{student.accessUntil}</div>
          </div>
          <div className={STAT_BOX}>
            <div className={STAT_LABEL}><BookOpen className="w-3 h-3" />Courses</div>
            <div className="text-xs font-semibold text-[#0f172a] dark:text-gray-100 mt-1">{student.totalCourses}</div>
          </div>
          <div className={STAT_BOX}>
            <div className={STAT_LABEL}><Award className="w-3 h-3" />Progress</div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">{student.progress}%</div>
          </div>
        </div>

        <div className="text-xs space-y-2 text-[#0f172a] dark:text-gray-300">
          <div>
            <span className="text-[#64748b] dark:text-gray-400 font-medium">Bio: </span>
            {student.bio}
          </div>
          <div className="flex items-center gap-1 text-[#64748b] dark:text-gray-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>{student.address || `${student.city}, ${student.state}, ${student.country}`}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0] dark:border-[#334155]">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              navigate(`/admin/users/students/${student.id}/edit`);
            }}
          >
            Open Full Edit Page
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewStudentModal;