import React, { useState, useRef } from 'react';
import type { TargetClass, FreeCourse } from '../types/free-course.types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { INITIAL_INSTRUCTORS } from '../data/InitialFreeCourses';
import {
  ShieldCheck,
  Check,
  AlertCircle,
  UploadCloud,
  Trash2,
  Camera,
  User,
  UserCheck,
} from 'lucide-react';

interface AddFreeCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseData: any) => Promise<any>;
}

const textareaCls =
  'w-full bg-white dark:bg-[#0B0F19] border border-[#e2e8f0] dark:border-[#374151] rounded-xl px-3.5 py-2.5 text-xs text-[#0f172a] dark:text-gray-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#3b82f6]';

const sectionTitleCls =
  'text-xs font-bold text-[#686E7D] dark:text-slate-400 uppercase tracking-widest mb-3';

export const AddFreeCourseModal: React.FC<AddFreeCourseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState(`FC-${Math.floor(100 + Math.random() * 900)}`);
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [targetClass, setTargetClass] = useState<TargetClass>('Class 10');
  const [subject, setSubject] = useState('Science');
  const [customSubject, setCustomSubject] = useState('');
  const [board, setBoard] = useState<'CBSE' | 'ICSE' | 'State Board' | 'All Boards'>('CBSE');
  const [language, setLanguage] = useState<'Hindi' | 'English' | 'Hinglish' | 'Urdu'>('Hindi');
  const [instructorId, setInstructorId] = useState(INITIAL_INSTRUCTORS[0].id);
  const [instructorPhoto, setInstructorPhoto] = useState(INITIAL_INSTRUCTORS[0].avatar);
  const instructorImageInputRef = useRef<HTMLInputElement>(null);

  const [thumbnail, setThumbnail] = useState(
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80'
  );
  const [duration, setDuration] = useState('45 Hours');
  const [courseType, setCourseType] = useState<FreeCourse['courseType']>('Foundation');
  const [demoVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [allowEnrollment, setAllowEnrollment] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInstructorChange = (id: string) => {
    setInstructorId(id);
    const found = INITIAL_INSTRUCTORS.find((i) => i.id === id);
    if (found) {
      setInstructorPhoto(found.avatar);
    }
  };

  const handleInstructorPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setInstructorPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sampleThumbnails = [
    { label: 'Science / Lab', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80' },
    { label: 'Mathematics', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80' },
    { label: 'Physics / Space', url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80' },
    { label: 'Chemistry', url: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80' },
    { label: 'Biology', url: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=600&auto=format&fit=crop&q=80' },
    { label: 'Books / Literature', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80' },
    { label: 'Coding / Tech', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80' },
  ];

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Please select an image smaller than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setThumbnail(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (status: 'Draft' | 'Published') => {
    if (!title.trim()) {
      setErrorMsg('Course Title is required');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    const chosenInstructor =
      INITIAL_INSTRUCTORS.find((i) => i.id === instructorId) || INITIAL_INSTRUCTORS[0];
    const finalInstructor = {
      ...chosenInstructor,
      avatar: instructorPhoto || chosenInstructor.avatar,
    };
    const finalSubject = subject === 'Other' ? customSubject.trim() || 'General' : subject;

    try {
      await onSubmit({
        courseCode,
        title: title.trim(),
        shortDescription: shortDesc.trim() || 'Comprehensive free learning module for school students.',
        fullDescription: fullDesc.trim() || shortDesc.trim(),
        targetClass,
        primarySubject: finalSubject,
        additionalSubjects: [],
        board,
        language,
        instructor: finalInstructor,
        thumbnail,
        demoVideoUrl,
        demoVideoStorage: 'youtube',
        duration,
        courseType,
        modulesCount: 1,
        lessonsCount: 3,
        enrollmentsCount: 0,
        activeStudentsCount: 0,
        completionRate: 0,
        allowFreeEnrollment: allowEnrollment,
        status,
        approvalStatus: status === 'Published' ? 'Approved' : 'Pending',
        qaEnabled: true,
        partnerInstructorEnabled: false,
        level: 'Beginner',
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedInstructor = INITIAL_INSTRUCTORS.find((i) => i.id === instructorId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <span className="text-lg font-bold">Create New Free Course</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#E7F7ED] text-[#16A34A] border border-[#16A34A]/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
            100% Free
          </span>
        </div>
      }
      subtitle="Fill in the course details for Classes 9–12. All free courses require ₹0 payment from students."
      maxWidth="4xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave('Draft')}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Save as Draft
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSave('Published')}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            icon={<Check className="w-4 h-4" />}
          >
            Publish Free Course
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {errorMsg && (
          <div className="p-3 bg-[#FCEAE4] dark:bg-rose-500/15 border border-[#DC5B3E]/30 dark:border-rose-500/30 rounded-xl text-[#DC5B3E] dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Free Course Guarantee Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#E7F7ED] to-[#EAF0FE] dark:from-emerald-950/40 dark:via-[#0d2228] dark:to-[#0f1d38] border border-[#16A34A]/30 dark:border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/70 dark:bg-emerald-500/20 text-[#16A34A] dark:text-emerald-400 border border-[#16A34A]/30 dark:border-emerald-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#16A34A] dark:text-emerald-300 uppercase tracking-wider">
                Free Educational Content Guarantee
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Enrollment fee is fixed at{' '}
                <strong className="text-[#12141C] dark:text-white">₹0.00 (FREE)</strong>. No payment gateway or
                student charge will ever apply.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-emerald-500 text-emerald-950 font-extrabold rounded-lg text-xs shadow-md">
            ₹0 FEE
          </span>
        </div>

        {/* Section 1: Basic Information */}
        <div>
          <h4 className={sectionTitleCls}>1. Basic Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Course Title"
                requiredBadge
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Class 10 Science: Board Formula Booster"
              />
            </div>
            <div>
              <Input
                label="Course Code / ID"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="FC-1002"
              />
            </div>
          </div>

          <div className="mt-3">
            <Input
              label="Short Description"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="A brief punchy summary explaining what the student will master..."
            />
          </div>

          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">
              Full Syllabus Description
            </label>
            <textarea
              rows={3}
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              placeholder="Enter comprehensive course overview, learning outcomes, chapter breakdown..."
              className={textareaCls}
            />
          </div>
        </div>

        {/* Section 2: Academic Classification */}
        <div>
          <h4 className={sectionTitleCls}>2. Academic Classification (Classes 9–12)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select
              label="Target Class"
              requiredBadge
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value as TargetClass)}
              options={[
                { value: 'Class 9', label: 'Class 9' },
                { value: 'Class 10', label: 'Class 10' },
                { value: 'Class 11', label: 'Class 11' },
                { value: 'Class 12', label: 'Class 12' },
              ]}
            />

            <Select
              label="Primary Subject"
              requiredBadge
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              options={[
                { value: 'Mathematics', label: 'Mathematics' },
                { value: 'Science', label: 'Science' },
                { value: 'Physics', label: 'Physics' },
                { value: 'Chemistry', label: 'Chemistry' },
                { value: 'Biology', label: 'Biology' },
                { value: 'English', label: 'English' },
                { value: 'Hindi', label: 'Hindi' },
                { value: 'Social Science', label: 'Social Science' },
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'Other', label: '+ Other (Custom Subject)' },
              ]}
            />

            <Select
              label="Academic Board"
              value={board}
              onChange={(e) => setBoard(e.target.value as any)}
              options={[
                { value: 'CBSE', label: 'CBSE' },
                { value: 'ICSE', label: 'ICSE' },
                { value: 'State Board', label: 'State Board' },
                { value: 'All Boards', label: 'All Boards' },
              ]}
            />

            <Select
              label="Instruction Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              options={[
                { value: 'Hindi', label: 'Hindi (हिंदी)' },
                { value: 'English', label: 'English' },
                { value: 'Hinglish', label: 'Hinglish (Bilingual)' },
                { value: 'Urdu', label: 'Urdu (اردو)' },
              ]}
            />
          </div>

          {subject === 'Other' && (
            <div className="mt-3">
              <Input
                label="Specify Custom Subject"
                requiredBadge
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="e.g. Sanskrit, Biotechnology, Statistics..."
              />
            </div>
          )}
        </div>

        {/* Section 3: Instructor & Media */}
        <div>
          <h4 className={sectionTitleCls}>3. Instructor & Content Format</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Assign Instructor"
              requiredBadge
              value={instructorId}
              onChange={(e) => handleInstructorChange(e.target.value)}
              options={INITIAL_INSTRUCTORS.map((i) => ({
                value: i.id,
                label: `${i.name} (${i.specialization})`,
              }))}
            />

            <Select
              label="Course Type"
              value={courseType}
              onChange={(e) => setCourseType(e.target.value as any)}
              options={[
                { value: 'Foundation', label: 'Foundation' },
                { value: 'Crash Course', label: 'Crash Course' },
                { value: 'Board Prep', label: 'Board Prep' },
                { value: 'Concept Revision', label: 'Concept Revision' },
                { value: 'Full Syllabus', label: 'Full Syllabus' },
              ]}
            />

            <Input
              label="Estimated Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 40 Hours"
            />
          </div>

          {/* Instructor Photo Preview & Upload Card */}
          <div className="mt-3.5 p-3.5 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#2451D9]/30 dark:border-blue-500/30 flex items-center justify-between gap-3 shadow-sm">
            <input
              type="file"
              ref={instructorImageInputRef}
              onChange={handleInstructorPhotoUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative group shrink-0">
                {instructorPhoto ? (
                  <img
                    src={instructorPhoto}
                    alt="Instructor"
                    className="w-12 h-12 rounded-xl object-cover border-2 border-[#2451D9]/40 dark:border-blue-500/40 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#EAF0FE] dark:bg-blue-600/20 border-2 border-dashed border-[#2451D9]/40 dark:border-blue-500/40 flex items-center justify-center font-bold">
                    <User className="w-6 h-6 text-[#2451D9] dark:text-blue-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#2451D9] dark:text-blue-400" />
                  <span className="text-xs font-bold text-[#12141C] dark:text-white truncate">
                    {selectedInstructor?.name || 'Faculty Member'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E7F7ED] text-[#16A34A] dark:bg-emerald-500/20 dark:text-emerald-400 font-bold">
                    Faculty Photo
                  </span>
                </div>
                <p className="text-[11px] text-[#686E7D] dark:text-slate-400 truncate mt-0.5">
                  {selectedInstructor?.specialization || 'Subject Specialist'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => instructorImageInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{instructorPhoto ? 'Change Photo' : 'Upload Photo'}</span>
              </button>
              {instructorPhoto && (
                <button
                  type="button"
                  onClick={() => setInstructorPhoto('')}
                  className="p-1.5 rounded-lg bg-[#FCEAE4] hover:bg-[#F8DACF] dark:bg-rose-500/20 dark:hover:bg-rose-500/30 text-[#DC5B3E] dark:text-rose-300 cursor-pointer transition-colors"
                  title="Remove Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Thumbnail preview & controls */}
          <div className="mt-4 p-3.5 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              {thumbnail ? (
                <div className="relative group w-full sm:w-44 h-24 rounded-lg overflow-hidden border border-[#E6E8EE] dark:border-slate-700 bg-slate-100 dark:bg-slate-950 shrink-0">
                  <img
                    src={thumbnail}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1 rounded bg-blue-600 text-white text-[10px]"
                      title="Upload from device"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnail('')}
                      className="p-1 rounded bg-rose-600 text-white text-[10px]"
                      title="Delete thumbnail"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-44 h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#2451D9] dark:hover:border-blue-500 bg-white dark:bg-[#070e1c] flex flex-col items-center justify-center p-2 cursor-pointer transition-colors text-center shrink-0"
                >
                  <UploadCloud className="w-5 h-5 text-[#2451D9] dark:text-blue-400 mb-1" />
                  <span className="text-[10px] font-bold text-[#12141C] dark:text-white">Upload Image</span>
                </div>
              )}

              <div className="flex-1 w-full space-y-2">
                <Input
                  label="Course Thumbnail Image URL"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://... (or upload from device)"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-[#EAF0FE] hover:bg-[#DCE6FD] dark:bg-blue-600/20 dark:hover:bg-blue-600/30 border border-[#2451D9]/30 dark:border-blue-500/40 text-[#2451D9] dark:text-blue-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-3 h-3" />
                    <span>Upload from Device</span>
                  </button>
                  {thumbnail && (
                    <button
                      type="button"
                      onClick={() => setThumbnail('')}
                      className="px-2.5 py-1 rounded-lg bg-[#FCEAE4] hover:bg-[#F8DACF] dark:bg-rose-500/15 dark:hover:bg-rose-500/25 border border-[#DC5B3E]/30 dark:border-rose-500/35 text-[#DC5B3E] dark:text-rose-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[11px] text-[#686E7D] dark:text-slate-400 font-semibold shrink-0">
                Presets:
              </span>
              {sampleThumbnails.map((st) => (
                <button
                  type="button"
                  key={st.label}
                  onClick={() => setThumbnail(st.url)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                    thumbnail === st.url
                      ? 'bg-[#EAF0FE] dark:bg-blue-600/20 border-[#2451D9] dark:border-blue-500 text-[#2451D9] dark:text-blue-300 font-bold'
                      : 'border-[#E6E8EE] dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:text-[#12141C] dark:hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Enrollment settings */}
        <div className="p-3.5 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#12141C] dark:text-white">Enable Open Free Enrollment</p>
            <p className="text-[11px] text-[#686E7D] dark:text-slate-400">
              Students can enroll with one click without any coupon or checkout gateway.
            </p>
          </div>
          <input
            type="checkbox"
            checked={allowEnrollment}
            onChange={(e) => setAllowEnrollment(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
          />
        </div>
      </div>
    </Modal>
  );
};