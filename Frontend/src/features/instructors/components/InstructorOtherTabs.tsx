import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Radio,
  Clock,
  Users,
  Plus,
  Download,
  CheckCircle2,
  Copy,
  Play,
  Edit3,
  Trash2,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import type { Instructor, AssignedCourse } from '../types/instructor';
import { InstructorFeedbackSection } from './InstructorFeedbackSection';
import { CourseStatusPermissionModal } from '../../courses/components/CourseStatusPermissionModal';

interface InstructorOtherTabsProps {
  activeTab: string;
  instructor: Instructor;
  onUpdateField?: <K extends keyof Instructor>(key: K, value: Instructor[K]) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onOpenAssignCourseModal: () => void;
}

interface ClassLiveSession {
  id: string;
  courseId: string;
  courseName: string;
  classLevel: string;
  topic: string;
  date: string;
  time: string;
  duration: string;
  status: 'Upcoming' | 'Live' | 'Completed';
  attendeesCount: number;
  totalStudents: number;
}

interface ClassAttendanceRecord {
  id: string;
  courseId: string;
  courseName: string;
  classLevel: string;
  topic: string;
  date: string;
  presentCount: number;
  totalStudents: number;
  percentage: number;
  punctuality: string;
}

/**
 * Helper to generate clean, standard title: "Class <Level> <Subject>"
 * e.g. "Class 11th Chemistry", "Class 12th Chemistry", "Class 10th Hindi"
 */
function getClassDisplayName(course: AssignedCourse, instructorSubject: string): string {
  let level = course.classLevel;
  if (!level) {
    const match = course.name.match(/\b(9|10|11|12)(th)?\b/i);
    level = match ? (match[2] ? match[0] : `${match[1]}th`) : '10th';
  }
  const cleanLevel = level.toLowerCase().endsWith('th') ? level : `${level}th`;
  return `Class ${cleanLevel} ${instructorSubject}`;
}

export function InstructorOtherTabs({
  activeTab,
  instructor,
  onUpdateField,
  onShowToast,
  onOpenAssignCourseModal,
}: InstructorOtherTabsProps) {
  const navigate = useNavigate();

  // Available courses / classes taught by this instructor
  const courses = useMemo(() => {
    if (instructor.assignedCourses && instructor.assignedCourses.length > 0) {
      return instructor.assignedCourses;
    }
    // Fallback if none assigned
    return [
      {
        id: 'c-default-11',
        name: `Class 11th ${instructor.subject} (Hindi & English Medium)`,
        category: 'Class 11th',
        studentCount: 45,
        status: 'Active' as const,
        classLevel: '11th',
        batchTime: 'Mon, Wed, Fri 4:00 PM',
        medium: 'Hindi & English Both',
      },
      {
        id: 'c-default-12',
        name: `Class 12th ${instructor.subject} (Hindi & English Medium)`,
        category: 'Class 12th',
        studentCount: 52,
        status: 'Active' as const,
        classLevel: '12th',
        batchTime: 'Tue, Thu, Sat 6:00 PM',
        medium: 'Hindi & English Both',
      },
    ];
  }, [instructor]);

  // Selected class/course state for Live Classes tab
  const [selectedLiveClassId, setSelectedLiveClassId] = useState<string>('all');

  // Selected class/course state for Attendance tab
  const [selectedAttendanceClassId, setSelectedAttendanceClassId] = useState<string>('all');

  // Edit Course Modal State
  const [editingCourse, setEditingCourse] = useState<AssignedCourse | null>(null);
  const [editCourseName, setEditCourseName] = useState('');
  const [editSubject, setEditSubject] = useState(instructor.subject || 'Academic');
  const [editDescription, setEditDescription] = useState('');
  const [editClassLevel, setEditClassLevel] = useState('10th');
  const [editMedium, setEditMedium] = useState('Hindi & English Both');
  const [editBatchTime, setEditBatchTime] = useState('Mon, Wed, Fri 4:00 PM');
  const [editStudentCount, setEditStudentCount] = useState<number>(30);
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active');

  // Unassign Course from Instructor Confirmation
  const [unassignConfirmCourse, setUnassignConfirmCourse] = useState<{ id: string; name: string } | null>(null);

  // Status Permission Modal state for Courses tab
  const [statusPermissionTarget, setStatusPermissionTarget] = useState<AssignedCourse | null>(null);

  const handleToggleCourseStatus = (courseId: string) => {
    const list = instructor.assignedCourses && instructor.assignedCourses.length > 0
      ? instructor.assignedCourses
      : courses;
    const updated = list.map((c) => {
      if (c.id === courseId) {
        const nextStatus = (c.status === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    onUpdateField?.('assignedCourses', updated);
    const target = list.find((c) => c.id === courseId);
    const newStatus = target?.status === 'Active' ? 'Inactive' : 'Active';
    onShowToast(`Course status updated to ${newStatus}`, 'success');
  };

  const handleConfirmCourseStatusPermission = (options: {
    notifyStudents: boolean;
    notifyInstructor: boolean;
    reason: string;
  }) => {
    if (!statusPermissionTarget) return;
    const target = statusPermissionTarget;
    handleToggleCourseStatus(target.id);
    setStatusPermissionTarget(null);

    if (options.notifyStudents && (target.studentCount || 0) > 0) {
      setTimeout(() => {
        onShowToast(`Dispatched notification alert to ${target.studentCount} students (${options.reason})`, 'info');
      }, 700);
    }
  };

  const handleOpenEditCourse = (course: AssignedCourse) => {
    setEditingCourse(course);
    setEditCourseName(course.name);
    setEditSubject(course.category || instructor.subject || 'Academic');
    setEditDescription('Comprehensive board curriculum with complete syllabus and NCERT solutions.');
    setEditClassLevel(course.classLevel || '10th');
    setEditMedium(course.medium || 'Hindi & English Both');
    setEditBatchTime(course.batchTime || 'Mon, Wed, Fri 4:00 PM');
    setEditStudentCount(course.studentCount || 30);
    setEditStatus((course.status === 'Inactive' ? 'Inactive' : 'Active') as 'Active' | 'Inactive');
  };

  const handleSaveCourse = () => {
    if (!editingCourse) return;
    if (!editCourseName.trim()) {
      onShowToast('Please enter a course name', 'error');
      return;
    }
    const list = instructor.assignedCourses && instructor.assignedCourses.length > 0
      ? instructor.assignedCourses
      : courses;
    const updated = list.map((c) => {
      if (c.id === editingCourse.id) {
        return {
          ...c,
          name: editCourseName,
          category: editSubject,
          classLevel: editClassLevel,
          medium: editMedium,
          batchTime: editBatchTime,
          studentCount: Number(editStudentCount) || 0,
          status: editStatus,
        };
      }
      return c;
    });
    onUpdateField?.('assignedCourses', updated);
    const totalStudents = updated.reduce((sum, item) => sum + (item.studentCount || 0), 0);
    onUpdateField?.('studentsCount', totalStudents);
    setEditingCourse(null);
    onShowToast(`Course "${editCourseName}" updated successfully`, 'success');
  };

  const handleConfirmUnassign = () => {
    if (!unassignConfirmCourse) return;
    const { id: courseId, name: courseName } = unassignConfirmCourse;
    const list = instructor.assignedCourses && instructor.assignedCourses.length > 0
      ? instructor.assignedCourses
      : courses;
    const updated = list.filter((c) => c.id !== courseId);
    onUpdateField?.('assignedCourses', updated);
    onUpdateField?.('coursesCount', updated.length);
    const totalStudents = updated.reduce((sum, item) => sum + (item.studentCount || 0), 0);
    onUpdateField?.('studentsCount', totalStudents);
    setUnassignConfirmCourse(null);
    onShowToast(`Course "${courseName}" unassigned from instructor`, 'info');
  };

  // State for Create Live Class modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSessionCourseId, setNewSessionCourseId] = useState(courses[0]?.id || '');
  const [newSessionTopic, setNewSessionTopic] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('Tomorrow');
  const [newSessionTime, setNewSessionTime] = useState('05:00 PM');
  const [newSessionDuration, setNewSessionDuration] = useState('60 mins');

  // Realistic mock live classes generated per course/class
  const [liveSessions, setLiveSessions] = useState<ClassLiveSession[]>(() => {
    const list: ClassLiveSession[] = [];
    courses.forEach((c, idx) => {
      const isMath = instructor.subject.toLowerCase().includes('math');
      const isPhysics = instructor.subject.toLowerCase().includes('physic');
      const isChem = instructor.subject.toLowerCase().includes('chem');
      const isBio = instructor.subject.toLowerCase().includes('bio');
      const isHindi = instructor.subject.toLowerCase().includes('hindi');
      const isEng = instructor.subject.toLowerCase().includes('eng');

      let topics = [
        `Foundations & Key Formulae (Bilingual)`,
        `Problem Solving & NCERT Line-by-Line`,
        `High-Weightage Board Questions & Doubt Solving`,
      ];

      if (isChem) {
        if (c.classLevel === '11th' || c.name.includes('11')) {
          topics = [
            `Some Basic Concepts of Chemistry & Mole Concept`,
            `Structure of Atom & Quantum Numbers (Bilingual)`,
            `Chemical Bonding & Molecular Orbital Theory`,
          ];
        } else {
          topics = [
            `Solutions & Colligative Properties Numericals`,
            `Electrochemistry & Nernst Equation Board Practice`,
            `Haloalkanes & Haloarenes Organic Mechanisms`,
          ];
        }
      } else if (isMath) {
        if (c.classLevel === '11th' || c.name.includes('11')) {
          topics = [
            `Sets, Relations & Functions Concept Clearing`,
            `Trigonometric Functions & Identities NCERT Proofs`,
            `Complex Numbers & Quadratic Equations Practice`,
          ];
        } else if (c.classLevel === '12th' || c.name.includes('12')) {
          topics = [
            `Continuity and Differentiability Important Questions`,
            `Integrals & Differential Equations Masterclass`,
            `Vectors & Three Dimensional Geometry (Bilingual)`,
          ];
        } else {
          topics = [
            `Polynomials & Linear Equations in Two Variables`,
            `Coordinate Geometry & Distance Formula`,
            `Introduction to Trigonometry High-Scoring Problems`,
          ];
        }
      } else if (isPhysics) {
        if (c.classLevel === '11th' || c.name.includes('11')) {
          topics = [
            `Units and Measurements & Dimensional Analysis`,
            `Kinematics: Motion in a Straight Line & Vectors`,
            `Laws of Motion & Friction Numerical Problem Session`,
          ];
        } else {
          topics = [
            `Ray Optics & Optical Instruments Lens Maker Formula`,
            `Current Electricity & Kirchhoff's Laws Circuit Analysis`,
            `Electromagnetic Induction & AC Generator Theory`,
          ];
        }
      } else if (isHindi) {
        if (c.classLevel === '10th' || c.name.includes('10')) {
          topics = [
            `Surdas ke Pad - Vyakhya & Prashn-Uttar`,
            `Hindi Vyakaran - Vakya Bhed & Samas Practice`,
            `Kshitij - Netaji ka Chashma Live Discussion`,
          ];
        } else if (c.classLevel === '11th' || c.name.includes('11')) {
          topics = [
            `Antra Part 1 - Kabirdas ke Pad Vyakhya`,
            `Hindi Vyakaran - Patralekhan & Jan Sanchar Madhyam`,
            `Antral - Husain ki Kahani Apni Zabani`,
          ];
        } else {
          topics = [
            `Aatm Parichay - Harivansh Rai Bachchan Vyakhya`,
            `Abhivyakti aur Madhyam - Rachnatmak Lekhan`,
            `Aroh - Bhaktin Live Analysis & Board Questions`,
          ];
        }
      } else if (isBio) {
        topics = [
          `Human Physiology - Respiration & Circulation`,
          `Genetics - Mendel Laws & Monohybrid Cross`,
          `Biotechnology Principles & Applications`,
        ];
      } else if (isEng) {
        topics = [
          `Literature Prose - Summary & Question Bank`,
          `English Grammar - Reported Speech & Tenses`,
          `Letter to the Editor & Analytical Paragraph`,
        ];
      }

      list.push(
        {
          id: `ls-${c.id}-1`,
          courseId: c.id,
          courseName: c.name,
          classLevel: c.classLevel || '10th',
          topic: topics[0],
          date: 'Today',
          time: idx === 0 ? '05:00 PM' : '06:30 PM',
          duration: '60 mins',
          status: idx === 0 ? 'Live' : 'Upcoming',
          attendeesCount: Math.round(c.studentCount * 0.92),
          totalStudents: c.studentCount,
        },
        {
          id: `ls-${c.id}-2`,
          courseId: c.id,
          courseName: c.name,
          classLevel: c.classLevel || '10th',
          topic: topics[1],
          date: 'Yesterday',
          time: '04:00 PM',
          duration: '75 mins',
          status: 'Completed',
          attendeesCount: Math.round(c.studentCount * 0.95),
          totalStudents: c.studentCount,
        },
        {
          id: `ls-${c.id}-3`,
          courseId: c.id,
          courseName: c.name,
          classLevel: c.classLevel || '10th',
          topic: topics[2] || topics[0],
          date: '22 Jun',
          time: '05:00 PM',
          duration: '60 mins',
          status: 'Completed',
          attendeesCount: Math.round(c.studentCount * 0.88),
          totalStudents: c.studentCount,
        }
      );
    });
    return list;
  });

  // Realistic mock attendance logs per course/class
  const attendanceLogs: ClassAttendanceRecord[] = useMemo(() => {
    const records: ClassAttendanceRecord[] = [];
    courses.forEach((c) => {
      const dates = ['Today', 'Yesterday', '23 Jun', '21 Jun', '19 Jun'];
      dates.forEach((d, i) => {
        const perc = 88 + ((i * 3) % 11);
        const present = Math.round((c.studentCount * perc) / 100);
        records.push({
          id: `att-${c.id}-${i}`,
          courseId: c.id,
          courseName: c.name,
          classLevel: c.classLevel || '10th',
          topic: `Lecture ${5 - i}: NCERT Key Problems & Practical Insights`,
          date: d,
          presentCount: present,
          totalStudents: c.studentCount,
          percentage: perc,
          punctuality: i === 0 ? 'On-time (0m delay)' : 'On-time (1m delay)',
        });
      });
    });
    return records;
  }, [courses]);

  // Filtered live classes by selected class pill
  const filteredLiveSessions = useMemo(() => {
    if (selectedLiveClassId === 'all') return liveSessions;
    return liveSessions.filter((s) => s.courseId === selectedLiveClassId);
  }, [liveSessions, selectedLiveClassId]);

  // Filtered attendance records by selected class pill
  const filteredAttendance = useMemo(() => {
    if (selectedAttendanceClassId === 'all') return attendanceLogs;
    return attendanceLogs.filter((a) => a.courseId === selectedAttendanceClassId);
  }, [attendanceLogs, selectedAttendanceClassId]);

  // Active course object for Live Classes
  const activeLiveCourse = courses.find((c) => c.id === selectedLiveClassId);

  // Active course object for Attendance
  const activeAttendanceCourse = courses.find((c) => c.id === selectedAttendanceClassId);

  const handleCreateLiveClass = () => {
    if (!newSessionTopic.trim()) {
      onShowToast('Please enter a session topic', 'error');
      return;
    }
    const targetCourse = courses.find((c) => c.id === newSessionCourseId) || courses[0];
    const newSession: ClassLiveSession = {
      id: `ls-${Date.now()}`,
      courseId: targetCourse.id,
      courseName: targetCourse.name,
      classLevel: targetCourse.classLevel || '10th',
      topic: newSessionTopic,
      date: newSessionDate,
      time: newSessionTime,
      duration: newSessionDuration,
      status: 'Upcoming',
      attendeesCount: 0,
      totalStudents: targetCourse.studentCount,
    };
    setLiveSessions([newSession, ...liveSessions]);
    setIsCreateModalOpen(false);
    setNewSessionTopic('');
    onShowToast(`Live session scheduled for ${getClassDisplayName(targetCourse, instructor.subject)}`, 'success');
  };

  const handleExportClassAttendance = (courseTitle: string) => {
    const records = filteredAttendance;
    const headers = ['ID', 'Class / Subject', 'Topic', 'Date', 'Present', 'Total Enrolled', 'Attendance %'];
    const rows = records.map((r) => [
      r.id,
      `"Class ${r.classLevel} ${instructor.subject}"`,
      `"${r.topic}"`,
      r.date,
      r.presentCount,
      r.totalStudents,
      `${r.percentage}%`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${courseTitle.replace(/\s+/g, '_')}_attendance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`Attendance log exported for ${courseTitle}`, 'success');
  };

  // 1. Courses Tab
  if (activeTab === 'Courses') {
    return (
      <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e2c4c]">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Assigned Courses & Batches ({courses.length})
            </h3>
            <p className="text-xs text-slate-500">
              Manage syllabus, enrollment capacity, timetable and toggle Active/Inactive status
            </p>
          </div>
          <button
            onClick={onOpenAssignCourseModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign New Course</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {courses.map((course) => {
            const isActive = course.status === 'Active';

            return (
              <div
                key={course.id}
                onClick={() => navigate(`/admin/users/instructors/${instructor.id}/courses/${course.id}`)}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-slate-50 dark:bg-[#0b1329] border-slate-200/70 dark:border-[#1e2c4c] hover:border-blue-500 hover:shadow-md'
                    : 'bg-slate-100/50 dark:bg-[#080e1c] border-slate-200/80 dark:border-slate-800/80 opacity-85 hover:border-blue-400'
                }`}
                title="Click to open complete Course Details and Syllabus"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
                          : 'bg-slate-500/10 text-slate-400 dark:bg-slate-700/30'
                      }`}
                    >
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                          {getClassDisplayName(course, instructor.subject)}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {course.medium || 'Hindi & English Both'}
                        </span>
                      </div>
                      <h4
                        className="text-xs font-bold text-slate-900 dark:text-white mt-1 line-clamp-1 group-hover:text-blue-500 transition-colors"
                        title={course.name}
                      >
                        {course.name}
                      </h4>
                    </div>
                  </div>

                  {/* Actions: Active/Inactive Toggle + Edit + Remove */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Toggle Active / Inactive Button with Permission Modal */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusPermissionTarget(course);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer shadow-2xs ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-300'
                      }`}
                      title={isActive ? 'Click to deactivate course (shows permissions popup)' : 'Click to activate course (shows permissions popup)'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span>{isActive ? 'Active' : 'Inactive'}</span>
                    </button>

                    {/* Edit Course Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/users/instructors/${instructor.id}/courses/${course.id}?tab=Information`);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                      title="Edit Course Information & Management"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Remove Course Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUnassignConfirmCourse({ id: course.id, name: course.name });
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Unassign Course from Instructor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-200/60 dark:border-[#1e2c4c]/60">
                  <span className="text-slate-500">
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">
                      {course.studentCount}
                    </strong>{' '}
                    Enrolled Students · <span className="text-[11px] text-slate-400">{course.batchTime || 'Mon-Fri'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-500 group-hover:translate-x-0.5 transition-transform">
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Course Modal */}
        {editingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-[#10192d] border border-slate-200 dark:border-[#1e2c4c] rounded-2xl shadow-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e2c4c] pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Assigned Course
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update course details, subject, description, and status
                  </p>
                </div>
                <button
                  onClick={() => setEditingCourse(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={editCourseName}
                    onChange={(e) => setEditCourseName(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Class Level
                    </label>
                    <select
                      value={editClassLevel}
                      onChange={(e) => setEditClassLevel(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="9th">Class 9th</option>
                      <option value="10th">Class 10th</option>
                      <option value="11th">Class 11th</option>
                      <option value="12th">Class 12th</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Teaching Medium
                    </label>
                    <select
                      value={editMedium}
                      onChange={(e) => setEditMedium(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="Hindi & English Both">Hindi & English Both</option>
                      <option value="Hindi Medium">Hindi Medium</option>
                      <option value="English Medium">English Medium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as 'Active' | 'Inactive')}
                      className={`w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editStatus === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Enrolled Students
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editStudentCount}
                      onChange={(e) => setEditStudentCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Batch Schedule / Timetable
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mon, Wed, Fri 4:00 PM"
                      value={editBatchTime}
                      onChange={(e) => setEditBatchTime(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Description
                  </label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Brief syllabus outline and key highlights..."
                    className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#1e2c4c] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCourse}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unassign Confirmation Dialog */}
        {unassignConfirmCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white dark:bg-[#10192d] border border-slate-200 dark:border-[#1e2c4c] rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Unassign Course From Faculty?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Unassign <strong className="text-slate-900 dark:text-white">{unassignConfirmCourse.name}</strong> from{' '}
                    <strong>{instructor.name}</strong>?
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                <p className="font-semibold">Safe Unassign Operation:</p>
                <p className="mt-0.5">
                  This only removes the instructor assignment link from {instructor.name}. The course and its syllabus, lessons, and batches will <strong>NOT</strong> be deleted.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setUnassignConfirmCourse(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUnassign}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 cursor-pointer shadow-sm"
                >
                  Unassign Course
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course Status Permission Confirmation Modal */}
        {statusPermissionTarget && (
          <CourseStatusPermissionModal
            isOpen={!!statusPermissionTarget}
            onClose={() => setStatusPermissionTarget(null)}
            onConfirm={handleConfirmCourseStatusPermission}
            currentStatus={statusPermissionTarget.status === 'Active' ? 'Active' : 'Inactive'}
            courseName={statusPermissionTarget.name}
            courseCode={statusPermissionTarget.id.toUpperCase()}
            studentCount={statusPermissionTarget.studentCount || 0}
            instructorName={instructor.name}
          />
        )}
      </div>
    );
  }

  // 2. Live Classes Tab (Class-Wise / Course-Wise)
  if (activeTab === 'Live Classes') {
    return (
      <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-5 shadow-xs space-y-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1e2c4c]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Classes by Class
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                Class-wise Sessions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a class below to view or schedule interactive live classes for that specific course
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer shrink-0"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Create Live Class</span>
          </button>
        </div>

        {/* Clean Class Selection Pills: e.g. "Class 11th Chemistry", "Class 12th Chemistry" */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Select Class / Subject:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {/* "All Classes" Pill */}
            <button
              type="button"
              onClick={() => setSelectedLiveClassId('all')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedLiveClassId === 'all'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 ring-2 ring-blue-500/20'
                  : 'bg-slate-100 dark:bg-[#0b1329] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#1e2c4c]'
              }`}
            >
              <span>All Classes</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${selectedLiveClassId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {liveSessions.length}
              </span>
            </button>

            {/* Individual Class Pills: "Class 11th Chemistry", "Class 12th Chemistry", etc. */}
            {courses.map((course) => {
              const isSelected = selectedLiveClassId === course.id;
              const countForCourse = liveSessions.filter((s) => s.courseId === course.id).length;
              const classTitle = getClassDisplayName(course, instructor.subject);

              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => setSelectedLiveClassId(course.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 ring-2 ring-blue-500/20'
                      : 'bg-slate-100 dark:bg-[#0b1329] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#1e2c4c]'
                  }`}
                >
                  <GraduationCap className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                  <span className="font-semibold">{classTitle}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'}`}>
                    {countForCourse}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Class Banner / Summary */}
        {activeLiveCourse && (
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-600 text-white">
                  {getClassDisplayName(activeLiveCourse, instructor.subject)}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {activeLiveCourse.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                Batch Schedule: <strong className="text-slate-700 dark:text-slate-200">{activeLiveCourse.batchTime || 'Mon, Wed, Fri 4:00 PM'}</strong> · {activeLiveCourse.studentCount} Students Enrolled · Hindi & English Both Medium
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-center">
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {filteredLiveSessions.filter((s) => s.status === 'Upcoming' || s.status === 'Live').length}
                </div>
                <div className="text-[10px] text-slate-500">Upcoming</div>
              </div>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
              <div className="text-center">
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {filteredLiveSessions.filter((s) => s.status === 'Completed').length}
                </div>
                <div className="text-[10px] text-slate-500">Completed</div>
              </div>
            </div>
          </div>
        )}

        {/* Live Classes List for Selected Class */}
        <div className="space-y-3">
          {filteredLiveSessions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No live classes scheduled for this class yet. Click "Create Live Class" to schedule one.
            </div>
          ) : (
            filteredLiveSessions.map((cls) => {
              const isLive = cls.status === 'Live';
              const isUpcoming = cls.status === 'Upcoming';

              return (
                <div
                  key={cls.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isLive
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/20'
                      : 'bg-slate-50 dark:bg-[#0b1329] border-slate-200/70 dark:border-[#1e2c4c] hover:border-blue-400/40'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isLive
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isUpcoming
                          ? 'bg-purple-500/10 text-purple-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}
                    >
                      <Radio className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {cls.topic}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                          Class {cls.classLevel} {instructor.subject}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {cls.courseName}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {cls.date}, {cls.time}
                        </span>
                        <span>·</span>
                        <span>{cls.duration}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Users className="w-3 h-3 text-slate-400" />
                          {cls.attendeesCount} / {cls.totalStudents} attended
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isLive
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 animate-pulse'
                          : isUpcoming
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                      }`}
                    >
                      {isLive ? '● Live Now' : cls.status}
                    </span>

                    {isLive ? (
                      <button
                        onClick={() => onShowToast(`Joined live stream for "${cls.topic}"`, 'info')}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-xs"
                      >
                        Join Stream
                      </button>
                    ) : isUpcoming ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText?.(`https://fukeyeducation.com/live/${cls.id}`);
                            onShowToast(`Stream link copied for ${cls.topic}`, 'success');
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onShowToast(`Live session started for "${cls.topic}"`, 'success')}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-xs"
                        >
                          Start Class
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onShowToast(`Playing recording for "${cls.topic}"`, 'info')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <Play className="w-3 h-3 text-emerald-500" />
                        <span>Recording</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal: Schedule Class-Specific Live Class */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-[#10192d] border border-slate-200 dark:border-[#1e2c4c] rounded-2xl shadow-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e2c4c] pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Schedule Live Class
                  </h3>
                  <p className="text-xs text-slate-500">
                    Schedule an online interactive session for a specific class
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {/* Select Class/Course */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Target Class / Course *
                  </label>
                  <select
                    value={newSessionCourseId}
                    onChange={(e) => setNewSessionCourseId(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {getClassDisplayName(c, instructor.subject)} — ({c.studentCount} students)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session Topic */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lesson / Chapter Topic *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chemical Bonding: Molecular Orbital Theory Numericals"
                    value={newSessionTopic}
                    onChange={(e) => setNewSessionTopic(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      type="text"
                      value={newSessionDate}
                      onChange={(e) => setNewSessionDate(e.target.value)}
                      placeholder="e.g. Tomorrow"
                      className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Time
                    </label>
                    <input
                      type="text"
                      value={newSessionTime}
                      onChange={(e) => setNewSessionTime(e.target.value)}
                      placeholder="e.g. 05:00 PM"
                      className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration
                  </label>
                  <select
                    value={newSessionDuration}
                    onChange={(e) => setNewSessionDuration(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100"
                  >
                    <option value="45 mins">45 mins</option>
                    <option value="60 mins">60 mins</option>
                    <option value="75 mins">75 mins</option>
                    <option value="90 mins">90 mins</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#1e2c4c] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateLiveClass}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white"
                >
                  Schedule Class
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Attendance Tab (Class-Wise / Course-Wise)
  if (activeTab === 'Attendance') {
    const currentClassAverage = activeAttendanceCourse
      ? Math.round(
          filteredAttendance.reduce((acc, curr) => acc + curr.percentage, 0) /
            (filteredAttendance.length || 1)
        )
      : instructor.attendancePercentage;

    const activeClassTitle = activeAttendanceCourse
      ? getClassDisplayName(activeAttendanceCourse, instructor.subject)
      : 'All Classes';

    return (
      <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-5 shadow-xs space-y-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1e2c4c]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Instructor Attendance by Class
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                Class-wise Logs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Track attendance rates, student turnouts, and session punctuality for each assigned class
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onShowToast(`Attendance recorded for today's session`, 'success')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Attendance</span>
            </button>

            <button
              onClick={() => handleExportClassAttendance(activeClassTitle)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Log</span>
            </button>
          </div>
        </div>

        {/* Clean Class Selection Pills: e.g. "Class 11th Chemistry", "Class 12th Chemistry" */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Select Class / Subject:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedAttendanceClassId('all')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedAttendanceClassId === 'all'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 ring-2 ring-blue-500/20'
                  : 'bg-slate-100 dark:bg-[#0b1329] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#1e2c4c]'
              }`}
            >
              <span>All Classes</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${selectedAttendanceClassId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {attendanceLogs.length} Sessions
              </span>
            </button>

            {courses.map((course) => {
              const isSelected = selectedAttendanceClassId === course.id;
              const classTitle = getClassDisplayName(course, instructor.subject);

              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => setSelectedAttendanceClassId(course.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 ring-2 ring-blue-500/20'
                      : 'bg-slate-100 dark:bg-[#0b1329] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#1e2c4c]'
                  }`}
                >
                  <GraduationCap className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                  <span className="font-semibold">{classTitle}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
                    {course.studentCount} St.
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Class Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c]">
            <span className="text-xs text-slate-400">Class Attendance Rate</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {currentClassAverage}%
            </div>
            <span className="text-[11px] text-emerald-500">
              {activeAttendanceCourse ? activeClassTitle : 'Across all batches'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c]">
            <span className="text-xs text-slate-400">Lectures Conducted</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {filteredAttendance.length} Sessions
            </div>
            <span className="text-[11px] text-blue-500">100% curriculum on schedule</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c]">
            <span className="text-xs text-slate-400">On-Time Start Rate</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              98.8%
            </div>
            <span className="text-[11px] text-slate-400">Avg delay &lt; 1 min</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c]">
            <span className="text-xs text-slate-400">Enrolled In This Class</span>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {activeAttendanceCourse ? activeAttendanceCourse.studentCount : instructor.studentsCount}
            </div>
            <span className="text-[11px] text-slate-400">Active learners</span>
          </div>
        </div>

        {/* Class Attendance Logs Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {activeAttendanceCourse ? `${activeClassTitle} — Lecture Logs` : 'All Class Lecture Attendance Logs'}
            </h4>
            <span className="text-[11px] text-slate-400">
              Showing {filteredAttendance.length} records
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-[#1e2c4c]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-[#1e2c4c] text-[11px] font-bold text-slate-400 uppercase bg-slate-50/70 dark:bg-[#0e1629]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Class / Subject</th>
                  <th className="py-2.5 px-3">Topic Taught</th>
                  <th className="py-2.5 px-3">Present / Total</th>
                  <th className="py-2.5 px-3">Turnout %</th>
                  <th className="py-2.5 px-3 text-right">Punctuality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e2c4c]/60">
                {filteredAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-[#14203a] transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {rec.date}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                        Class {rec.classLevel} {instructor.subject}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                      {rec.topic}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <strong className="text-slate-900 dark:text-white font-bold">{rec.presentCount}</strong> / {rec.totalStudents} Students
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              rec.percentage >= 90 ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${rec.percentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {rec.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
                      {rec.punctuality}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 4. Students Tab
  if (activeTab === 'Students') {
    return (
      <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e2c4c]">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Enrolled Students Directory ({instructor.studentsCount} Active)
            </h3>
            <p className="text-xs text-slate-500">
              Students actively attending {instructor.name}'s classes (9th to 12th)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-[#1e2c4c] text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Course / Class</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1e2c4c]/60">
              {[
                { name: 'Aarav Patel', course: `Class 10th ${instructor.subject}`, att: '96%', progress: '78%' },
                { name: 'Ananya Roy', course: `Class 12th ${instructor.subject}`, att: '92%', progress: '85%' },
                { name: 'Rohan Deshmukh', course: `Class 11th ${instructor.subject}`, att: '88%', progress: '64%' },
                { name: 'Diya Sen', course: `Class 10th ${instructor.subject}`, att: '98%', progress: '91%' },
              ].map((std, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#14203a]">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{std.name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{std.course}</td>
                  <td className="py-2.5 px-3 font-medium text-emerald-500">{std.att}</td>
                  <td className="py-2.5 px-3">{std.progress}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 5. Performance Tab
  if (activeTab === 'Performance') {
    return (
      <InstructorFeedbackSection
        instructor={instructor}
        onShowToast={onShowToast}
      />
    );
  }

  return null;
}
