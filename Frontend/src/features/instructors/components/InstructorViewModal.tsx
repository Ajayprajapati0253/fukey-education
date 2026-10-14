import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Instructor } from '../types/instructor';
import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Users,
  Video,
  Award,
  Edit2
} from 'lucide-react';

interface InstructorViewModalProps {
  instructor: Instructor | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InstructorViewModal({ instructor, isOpen, onClose }: InstructorViewModalProps) {
  const navigate = useNavigate();
  if (!instructor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Instructor Overview"
      subtitle={`Profile details for ${instructor.name}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header Profile Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#1e2c4c]">
          <img
            src={instructor.avatar}
            alt={instructor.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/40"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {instructor.name}
              </h3>
              <Badge variant={instructor.status === 'Active' ? 'success' : instructor.status === 'Pending' ? 'warning' : 'danger'}>
                {instructor.status}
              </Badge>
              {instructor.verification === 'Verified' && (
                <Badge variant="blue">Verified</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {instructor.designation} · {instructor.subject}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                {instructor.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                {instructor.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {instructor.city}, {instructor.state}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#1e2c4c] text-center">
            <GraduationCap className="w-4 h-4 mx-auto text-blue-500 mb-1" />
            <div className="text-[11px] text-slate-500">Total Courses</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {instructor.coursesCount}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#1e2c4c] text-center">
            <Users className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
            <div className="text-[11px] text-slate-500">Students</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {instructor.studentsCount}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#1e2c4c] text-center">
            <Video className="w-4 h-4 mx-auto text-purple-500 mb-1" />
            <div className="text-[11px] text-slate-500">Live Classes</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {instructor.liveClassesDone}/{instructor.totalLiveClasses}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#1e2c4c] text-center">
            <Award className="w-4 h-4 mx-auto text-amber-500 mb-1" />
            <div className="text-[11px] text-slate-500">Attendance</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {instructor.attendancePercentage}%
            </div>
          </div>
        </div>

        {/* Bio and Experience */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            About Instructor
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {instructor.fullBio || instructor.shortBio}
          </p>
        </div>

        {/* Skills & Specialization */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Key Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {instructor.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-[#1e2c4c] flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Edit2 className="w-3.5 h-3.5" />}
            onClick={() => {
              onClose();
              navigate(`/admin/users/instructors/${instructor.id}/edit`);
            }}
          >
            Edit Full Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
}
