import React, { useState, useRef } from 'react';
import type { FreeCourse, TargetClass } from '../types/free-course.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { INITIAL_INSTRUCTORS } from '../data/InitialFreeCourses';
import { FreeCourseContentManager } from './FreeCourseContentManager';
import { useFreeToast as useToast } from '../hooks/useFreeToast';
import {
  FileText,
  SlidersHorizontal,
  FolderTree,
  BarChart3,
  CheckCircle,
  ShieldCheck,
  Save,
  ArrowLeft,
  Eye,
  UploadCloud,
  Trash2,
  RefreshCw,
  ZoomIn,
  Check,
} from 'lucide-react';

interface RedesignedEditCourseViewProps {
  course: FreeCourse;
  onSave: (updatedData: Partial<FreeCourse>) => Promise<any>;
  onCancel: () => void;
  onViewDetails?: () => void;
}

export const RedesignedEditCourseView: React.FC<RedesignedEditCourseViewProps> = ({
  course,
  onSave,
  onCancel,
  onViewDetails,
}) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'basic' | 'more' | 'content' | 'analytics' | 'finish'>('basic');
  const [isSaving, setIsSaving] = useState(false);

  // Form states initialized from course
  const [title, setTitle] = useState(course.title);
  const [courseCode, setCourseCode] = useState(course.courseCode);
  const [shortDescription, setShortDescription] = useState(course.shortDescription);
  const [fullDescription, setFullDescription] = useState(course.fullDescription);
  const [targetClass, setTargetClass] = useState<TargetClass>(course.targetClass);
  const [primarySubject, setPrimarySubject] = useState(course.primarySubject);
  const [board, setBoard] = useState(course.board);
  const [language, setLanguage] = useState(course.language);
  const [instructorId, setInstructorId] = useState(course.instructor.id);
  const [thumbnail, setThumbnail] = useState(course.thumbnail);
  const [demoVideoUrl, setDemoVideoUrl] = useState(course.demoVideoUrl || '');
  const [demoVideoStorage, setDemoVideoStorage] = useState(course.demoVideoStorage || 'youtube');
  const [duration, setDuration] = useState(course.duration);
  const [courseType, setCourseType] = useState(course.courseType);

  // Step 2: More Infos
  const [qaEnabled, setQaEnabled] = useState(course.qaEnabled ?? true);
  const [partnerInstructorEnabled, setPartnerInstructorEnabled] = useState(course.partnerInstructorEnabled ?? false);
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(course.level ?? 'Beginner');

  // Step 5: Finish
  const [status, setStatus] = useState<FreeCourse['status']>(course.status);
  const [reviewerMessage, setReviewerMessage] = useState(course.reviewerMessage || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const sampleThumbnails = [
    { label: 'Science / Lab', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80' },
    { label: 'Mathematics', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80' },
    { label: 'Physics / Space', url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80' },
    { label: 'Chemistry', url: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80' },
    { label: 'Biology', url: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=600&auto=format&fit=crop&q=80' },
    { label: 'Books / Literature', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80' },
    { label: 'Coding / Tech', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80' },
  ];

  // Thumbnail CRUD Handlers
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('File Too Large', 'Please select an image file under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setThumbnail(reader.result);
          success('Thumbnail Uploaded', 'New course thumbnail ready. Remember to save changes.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteThumbnail = () => {
    setThumbnail('');
    success('Thumbnail Removed', 'Course thumbnail cleared. You can upload a new one or choose a preset.');
  };

  const handleResetThumbnail = () => {
    setThumbnail(course.thumbnail);
    success('Thumbnail Restored', 'Reset to original course image.');
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    const chosenInstructor =
      INITIAL_INSTRUCTORS.find((i) => i.id === instructorId) || course.instructor;

    try {
      await onSave({
        title,
        courseCode,
        shortDescription,
        fullDescription,
        targetClass,
        primarySubject,
        board,
        language,
        instructor: chosenInstructor,
        thumbnail,
        demoVideoUrl,
        demoVideoStorage,
        duration,
        courseType,
        qaEnabled,
        partnerInstructorEnabled,
        level,
        status,
        reviewerMessage,
        price: 0, // Invariant: Always ₹0 Free
        isFreeCourse: true,
      });
      success('Free Course Updated', `Successfully updated "${title}"`);
    } catch (err: any) {
      error('Update Failed', err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Infos', icon: <FileText className="w-4 h-4" /> },
    { id: 'more', label: 'More Infos', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'content', label: 'Course Contents', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics & Students', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'finish', label: 'Finish & Publish', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header bar with breadcrumbs and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Back to Free Courses List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EAF0FE] text-[#2451D9] border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30">
                {course.courseCode}
              </span>
              <h1 className="text-xl font-bold text-[#12141C] dark:text-white tracking-tight">{title}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#E7F7ED] text-[#16A34A] border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                Free Course (₹0)
              </span>
            </div>
            <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-1">
              Redesigned Course Editor • Classes 9th to 12th • Open Free Enrollment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button size="sm" variant="outline" onClick={onViewDetails} icon={<Eye className="w-4 h-4" />}>
              Preview Course
            </Button>
          )}
          <Button
            size="sm"
            variant="primary"
            onClick={handleUpdate}
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Redesigned Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-2xl border border-[#E6E8EE] dark:border-[#334155] overflow-x-auto shadow-inner">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
                  : 'text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Basic Infos */}
      {activeTab === 'basic' && (
        <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-sm font-bold text-[#12141C] dark:text-white uppercase tracking-wider mb-1">
              General Course Information
            </h3>
            <p className="text-xs text-[#686E7D] dark:text-slate-400">
              Set title, descriptions, target class, instructor, and media.
            </p>
          </div>

          {/* Guaranteed Free Notice */}
          <div className="p-4 rounded-xl bg-[#E7F7ED] dark:bg-[#091524] border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#16A34A] dark:text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-[#16A34A] dark:text-emerald-300">
                  Fixed Pricing Policy: ₹0.00 (Free Enrollment)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Free courses do not charge any fee. Students get instantaneous access upon registration.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-[#16A34A] border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 text-xs font-bold">
              ₹0 Tuition
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Course Title"
                requiredBadge
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Course Code / ID"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Target Class"
              requiredBadge
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value as TargetClass)}
              options={[
                { value: 'Class 9th', label: 'Class 9' },
                { value: 'Class 10th', label: 'Class 10' },
                { value: 'Class 11th', label: 'Class 11' },
                { value: 'Class 12th', label: 'Class 12' },
              ]}
            />

            <Select
              label="Primary Subject"
              requiredBadge
              value={primarySubject}
              onChange={(e) => setPrimarySubject(e.target.value)}
              options={[
                { value: 'Science', label: 'Science' },
                { value: 'Mathematics', label: 'Mathematics' },
                { value: 'Physics', label: 'Physics' },
                { value: 'Chemistry', label: 'Chemistry' },
                { value: 'Biology', label: 'Biology' },
                { value: 'English', label: 'English' },
                { value: 'Hindi', label: 'Hindi' },
                { value: 'Social Science', label: 'Social Science' },
                { value: 'Computer Science', label: 'Computer Science' },
              ]}
            />

            <Select
              label="Assigned Instructor"
              requiredBadge
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              options={INITIAL_INSTRUCTORS.map((i) => ({
                value: i.id,
                label: i.name,
              }))}
            />

            <Select
              label="Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              options={[
                { value: 'Hindi', label: 'Hindi' },
                { value: 'English', label: 'English' },
                { value: 'Hinglish', label: 'Hinglish' },
                { value: 'Urdu', label: 'Urdu' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Board"
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
              label="Course Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 48 Hours"
            />
          </div>

          <div>
            <Input
              label="SEO / Short Description"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Concise overview for course card..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 tracking-wide">
              Detailed Description & Syllabus Highlights
            </label>
            <textarea
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              className="w-full bg-white dark:bg-[#0B0F19] border border-[#e2e8f0] dark:border-[#374151] text-[#0f172a] dark:text-gray-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#3b82f6]"
            />
          </div>

          {/* Media & Thumbnail Preview (Full CRUD: Upload, Edit, Delete, Presets) */}
          <div className="p-4 sm:p-5 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider">
                  Thumbnail & Demo Video
                </h4>
                <p className="text-[11px] text-[#686E7D] dark:text-slate-400 mt-0.5">
                  Manage course cover banner with full CRUD support (Upload from device, edit URL, choose presets, or delete).
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#2451D9] bg-[#EAF0FE] border border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20 px-2.5 py-1 rounded-lg">
                16:9 Ratio Recommended
              </span>
            </div>

            {/* Hidden device file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              className="hidden"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              {/* Thumbnail Display / Dropzone */}
              <div className="md:col-span-1">
                {thumbnail ? (
                  <div className="relative group h-36 rounded-xl overflow-hidden border border-[#E6E8EE] dark:border-slate-700 bg-slate-100 dark:bg-slate-950 shadow-md">
                    <img
                      src={thumbnail}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';
                      }}
                    />

                    {/* Hover Overlay with CRUD buttons */}
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-md cursor-pointer transition-colors"
                        title="Upload / Replace Image from PC"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Change</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowPreviewModal(true)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] shadow-md cursor-pointer transition-colors"
                        title="View Fullscreen"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteThumbnail}
                        className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] shadow-md cursor-pointer transition-colors"
                        title="Delete Thumbnail"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-1.5 left-2 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-slate-300">
                      16:9 • Attached
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-36 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-[#0B0F19] flex flex-col items-center justify-center p-4 cursor-pointer transition-colors group text-center"
                    title="Click to upload an image from your device"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EAF0FE] border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5 text-[#2451D9] dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-bold text-[#12141C] dark:text-white group-hover:text-[#2451D9] dark:group-hover:text-blue-400 transition-colors">
                      No Thumbnail Attached
                    </span>
                    <span className="text-[10px] text-[#686E7D] dark:text-slate-400 mt-0.5">
                      Click to upload from device or pick a preset
                    </span>
                  </div>
                )}

                {/* Quick actions directly below image */}
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#EAF0FE] hover:bg-blue-100 border border-blue-200 text-[#2451D9] dark:bg-blue-600/20 dark:hover:bg-blue-600/30 dark:border-blue-500/40 dark:text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>

                  {thumbnail && (
                    <button
                      type="button"
                      onClick={handleDeleteThumbnail}
                      className="py-1.5 px-2.5 rounded-lg bg-[#FCEAE4] hover:bg-rose-100 border border-rose-200 text-[#DC5B3E] dark:bg-rose-500/15 dark:hover:bg-rose-500/25 dark:border-rose-500/35 dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="Delete Thumbnail"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#DC5B3E] dark:text-rose-400" />
                      <span>Delete</span>
                    </button>
                  )}

                  {thumbnail !== course.thumbnail && (
                    <button
                      type="button"
                      onClick={handleResetThumbnail}
                      className="py-1.5 px-2 rounded-lg border border-[#E6E8EE] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="Reset to Original"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* URL & Preset Controls */}
              <div className="md:col-span-2 space-y-3">
                <Input
                  label="Thumbnail Image URL"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://... (or upload from device above)"
                />

                {/* Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-[#686E7D] dark:text-slate-400 font-semibold">
                      Or select from quick subject presets:
                    </span>
                    {thumbnail && (
                      <span className="text-[10px] text-[#16A34A] dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Live Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {sampleThumbnails.map((st) => (
                      <button
                        type="button"
                        key={st.label}
                        onClick={() => setThumbnail(st.url)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                          thumbnail === st.url
                            ? 'bg-[#EAF0FE] border-blue-500 text-[#2451D9] font-bold shadow-sm dark:bg-blue-600/30 dark:text-blue-300'
                            : 'border-[#E6E8EE] bg-white text-[#686E7D] hover:text-[#12141C] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Demo Video Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-[#E6E8EE] dark:border-[#334155] mt-2">
                  <Select
                    label="Demo Video Storage"
                    value={demoVideoStorage}
                    onChange={(e) => setDemoVideoStorage(e.target.value as any)}
                    options={[
                      { value: 'youtube', label: 'YouTube' },
                      { value: 'upload', label: 'Direct Upload' },
                      { value: 'vimeo', label: 'Vimeo' },
                    ]}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Demo Video URL"
                      value={demoVideoUrl}
                      onChange={(e) => setDemoVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: More Infos */}
      {activeTab === 'more' && (
        <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-sm font-bold text-[#12141C] dark:text-white uppercase tracking-wider mb-1">
              Additional Course Configuration
            </h3>
            <p className="text-xs text-[#686E7D] dark:text-slate-400">
              Configure student engagement options, difficulty level, and instructor pairing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Q&A Switch */}
            <div className="p-4 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#12141C] dark:text-white">Discussion & Q&A Board</p>
                <p className="text-[11px] text-[#686E7D] dark:text-slate-400">
                  Allow students to ask doubts directly below each lesson.
                </p>
              </div>
              <input
                type="checkbox"
                checked={qaEnabled}
                onChange={(e) => setQaEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* Partner Instructor Switch */}
            <div className="p-4 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#12141C] dark:text-white">Partner Instructor Collaboration</p>
                <p className="text-[11px] text-[#686E7D] dark:text-slate-400">
                  Enable co-teaching and joint assessment grading.
                </p>
              </div>
              <input
                type="checkbox"
                checked={partnerInstructorEnabled}
                onChange={(e) => setPartnerInstructorEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Level Selection */}
          <div className="p-4 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155]">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-3 uppercase tracking-wider">
              Student Difficulty Level
            </span>
            <div className="grid grid-cols-3 gap-3">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    level === lvl
                      ? 'bg-[#EAF0FE] border-blue-500 text-[#12141C] font-bold shadow-md shadow-blue-500/10 dark:bg-blue-600/20 dark:text-white'
                      : 'border-[#E6E8EE] bg-white text-[#686E7D] hover:text-[#12141C] dark:border-slate-800 dark:bg-[#070d1e] dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold">{lvl}</p>
                  <p className="text-[10px] text-[#686E7D] dark:text-slate-400 mt-0.5">
                    {lvl === 'Beginner' ? 'Fundamental clarity' : lvl === 'Intermediate' ? 'Standard board syllabus' : 'Olympiad & high rigor'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Course Contents */}
      {activeTab === 'content' && (
        <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl p-6 shadow-xl animate-in fade-in duration-150">
          <FreeCourseContentManager course={course} />
        </div>
      )}

      {/* Tab 4: Analytics & Student Reach */}
      {activeTab === 'analytics' && (
        <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-sm font-bold text-[#12141C] dark:text-white uppercase tracking-wider mb-1">
              Free Course Reach & Student Engagement
            </h3>
            <p className="text-xs text-[#686E7D] dark:text-slate-400">
              Track student enrollment volume, active completion milestones, and study progress.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F6F7FA] dark:bg-[#0B0F19] border border-[#E6E8EE] dark:border-[#334155]">
              <span className="text-xs text-[#686E7D] dark:text-slate-400 font-semibold">Total Students Reached</span>
              <p className="text-2xl font-extrabold text-[#12141C] dark:text-white mt-1">
                {course.enrollmentsCount.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#16A34A] dark:text-emerald-400 mt-1 font-medium">100% Free Enrolled</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F6F7FA] dark:bg-[#0B0F19] border border-[#E6E8EE] dark:border-[#334155]">
              <span className="text-xs text-[#686E7D] dark:text-slate-400 font-semibold">Active Weekly Learners</span>
              <p className="text-2xl font-extrabold text-[#2451D9] dark:text-blue-400 mt-1">
                {course.activeStudentsCount.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#686E7D] dark:text-slate-400 mt-1">Engaging with video & notes</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F6F7FA] dark:bg-[#0B0F19] border border-[#E6E8EE] dark:border-[#334155]">
              <span className="text-xs text-[#686E7D] dark:text-slate-400 font-semibold">Course Completion Rate</span>
              <p className="text-2xl font-extrabold text-[#16A34A] dark:text-emerald-400 mt-1">
                {course.completionRate}%
              </p>
              <p className="text-[11px] text-[#686E7D] dark:text-slate-400 mt-1">Finished all modules</p>
            </div>
          </div>

          {/* Progress bar breakdown */}
          <div className="p-4 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] space-y-3">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Study Progress Tracker (Completion Ranges)
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-[#686E7D] dark:text-slate-400 mb-1">
                  <span>Completed (80% - 100%)</span>
                  <span className="font-semibold text-[#12141C] dark:text-white">42% of students</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '42%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#686E7D] dark:text-slate-400 mb-1">
                  <span>In Progress (40% - 79%)</span>
                  <span className="font-semibold text-[#12141C] dark:text-white">38% of students</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '38%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#686E7D] dark:text-slate-400 mb-1">
                  <span>Starting Out (0% - 39%)</span>
                  <span className="font-semibold text-[#12141C] dark:text-white">20% of students</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Finish & Publish */}
      {activeTab === 'finish' && (
        <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-sm font-bold text-[#12141C] dark:text-white uppercase tracking-wider mb-1">
              Review & Publication Status
            </h3>
            <p className="text-xs text-[#686E7D] dark:text-slate-400">
              Select status and finalize changes for this free course.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Course Publishing Status"
              requiredBadge
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'Published', label: 'Published (Live & Free to Enroll)' },
                { value: 'Draft', label: 'Draft (Visible only to Admin)' },
                { value: 'Archived', label: 'Archived (Retired / Hidden)' },
              ]}
            />

            <div>
              <Input
                label="Reviewer / Editorial Note"
                value={reviewerMessage}
                onChange={(e) => setReviewerMessage(e.target.value)}
                placeholder="Internal verification remarks..."
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="p-4 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] space-y-2">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Publication Readiness Checklist
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[#16A34A] dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span>Zero tuition fee enforced (₹0 No payment needed)</span>
              </div>
              <div className="flex items-center gap-2 text-[#16A34A] dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span>Target Class configured ({targetClass})</span>
              </div>
              <div className="flex items-center gap-2 text-[#16A34A] dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span>Instructor assigned ({course.instructor.name})</span>
              </div>
              <div className="flex items-center gap-2 text-[#16A34A] dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span>Free open enrollment ready</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              isLoading={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              Update Free Course
            </Button>
          </div>
        </div>
      )}

      {/* Fullscreen Thumbnail Preview Modal */}
      {showPreviewModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowPreviewModal(false)}
          title="Course Thumbnail Full Preview"
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#686E7D] dark:text-slate-400">
                Resolution: 16:9 Standard Course Card & Banner
              </span>
              <Button variant="secondary" size="sm" onClick={() => setShowPreviewModal(false)}>
                Close Preview
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-[#E6E8EE] dark:border-slate-700 bg-slate-100 dark:bg-slate-950 shadow-2xl">
              <img
                src={thumbnail}
                alt={title}
                className="w-full max-h-[60vh] object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <div className="p-3 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] text-xs">
              <span className="text-[#686E7D] dark:text-slate-400">Course Title: </span>
              <strong className="text-[#12141C] dark:text-white">{title}</strong>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};