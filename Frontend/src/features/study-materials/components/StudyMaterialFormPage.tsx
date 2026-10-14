import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Check,
  FileText,
  Image as ImageIcon,
  Flame,
  Gauge,
  BookOpen,
  Layers,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  User,
  Calendar,
  GraduationCap,
  Folder,
  Download,
  Trash2,
  Tag,
  Bookmark,
  Sparkles,
  ShieldCheck,
  Award,
  RefreshCw,
  Camera,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  DifficultyLevel,
  MaterialFormData,
  MaterialStatus,
  MaterialType,
  StudyMaterialItem,
} from '../types';
import { PRESET_THUMBNAILS, getDefaultThumbnail } from '../../../utils/thumbnailPresets';

interface FormPageProps {
  initialData?: StudyMaterialItem | null;
  defaultType?: MaterialType;
  categoryTitle: string;
  onSave: (data: MaterialFormData, keepOpen?: boolean) => void;
  onCancel: () => void;
}

type TabKey = 'media' | 'details' | 'chapter' | 'assessment' | 'files';
type FileFormat = StudyMaterialItem['fileFormat'];

const TAB_ORDER: TabKey[] = ['media', 'details', 'chapter', 'assessment', 'files'];

/* ---------- shared theme-aware class constants ---------- */
const CARD =
  'bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] rounded-2xl shadow-2xs';
const FIELD_BASE =
  'bg-slate-50 dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] border';
const FIELD_OK = 'border-[#e2e8f0] dark:border-[#334155]';
const FIELD_ERR = 'border-rose-400 bg-rose-50/20 dark:bg-rose-500/10';
const HEAD = 'flex items-center gap-2 border-b border-slate-100 dark:border-[#334155]/60 pb-3';
const H3 =
  'text-xs font-bold uppercase tracking-wider text-[#0f172a] dark:text-gray-100 truncate';
const LBL = 'block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5';
const LBL_SM =
  'block text-[11px] font-semibold uppercase tracking-wider text-[#64748b] dark:text-gray-400 mb-1.5';
const ICON_L =
  'w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2';
const BTN_OUTLINE =
  'text-slate-700 dark:text-gray-300 bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-[#e2e8f0] dark:border-[#334155]';
const BTN_SOFT =
  'text-blue-700 dark:text-[#60A5FA] bg-blue-50 dark:bg-[#2451D9]/20 hover:bg-blue-100 dark:hover:bg-[#2451D9]/30 border border-blue-200 dark:border-[#2451D9]/40';
const FILE_INPUT =
  'w-full text-xs text-slate-500 dark:text-gray-400 file:mr-2.5 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-[#2451D9]/20 dark:file:text-[#60A5FA] dark:hover:file:bg-[#2451D9]/30 cursor-pointer';
const CHECKBOX =
  'w-4 h-4 rounded text-[#3b82f6] focus:ring-[#3b82f6] border-slate-300 dark:border-slate-600 dark:bg-[#0F172A] cursor-pointer flex-shrink-0';
const SOFT_ROW =
  'bg-slate-50 dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-[#334155] rounded-xl';
const HIDE_SCROLLBAR =
  '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

export const StudyMaterialFormPage: React.FC<FormPageProps> = ({
  initialData,
  defaultType = 'notes',
  categoryTitle,
  onSave,
  onCancel,
}) => {
  const isEditing = !!initialData;

  const [activeTab, setActiveTab] = useState<TabKey>('media');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MaterialType>(defaultType);
  const [subject, setSubject] = useState('Physics');
  const [grade, setGrade] = useState('Class 12th');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('3.5 MB');
  const [fileFormat, setFileFormat] = useState<FileFormat>('pdf');
  const [status, setStatus] = useState<MaterialStatus>('published');
  const [isImportant, setIsImportant] = useState(false);
  const [author, setAuthor] = useState('Admin Faculty');
  const [tagsInput, setTagsInput] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  // Assessment attributes
  const [questionsCount, setQuestionsCount] = useState<number | undefined>(undefined);
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>(undefined);
  const [totalMarks, setTotalMarks] = useState<number | undefined>(undefined);
  const [passingMarks, setPassingMarks] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [hasSolution, setHasSolution] = useState(true);
  const [solutionFileName, setSolutionFileName] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-27');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setType(initialData.type);
      setSubject(initialData.subject);
      setGrade(initialData.grade);
      setChapter(initialData.chapter);
      setTopic(initialData.topic || '');
      setDescription(initialData.description || '');
      setFileName(initialData.fileName || '');
      setFileSize(initialData.fileSize || '3.5 MB');
      setFileFormat(initialData.fileFormat || 'pdf');
      setStatus(initialData.status);
      setIsImportant(!!initialData.isImportant);
      setAuthor(initialData.author || 'Admin Faculty');
      setTagsInput(initialData.tags?.join(', ') || '');
      setThumbnailUrl(initialData.thumbnailUrl || getDefaultThumbnail(initialData.subject, initialData.type));
      setQuestionsCount(initialData.questionsCount);
      setDurationMinutes(initialData.durationMinutes);
      setTotalMarks(initialData.totalMarks);
      setPassingMarks(initialData.passingMarks);
      setDifficulty(initialData.difficulty || 'Medium');
      setHasSolution(initialData.hasSolution);
      setSolutionFileName(initialData.solutionFileName || '');
      setAcademicYear(initialData.academicYear || '2026-27');
    } else {
      setTitle('');
      const resolvedType = defaultType === 'overview' ? 'notes' : defaultType;
      setType(resolvedType);
      setSubject('Physics');
      setGrade('Class 12th');
      setChapter('');
      setTopic('');
      setDescription('');
      setFileName('');
      setFileSize('3.2 MB');
      setFileFormat('pdf');
      setStatus('published');
      setIsImportant(false);
      setAuthor('Admin Faculty');
      setTagsInput('Class 12th, Physics, Study Material');
      setThumbnailUrl(getDefaultThumbnail('Physics', resolvedType));
      setQuestionsCount(resolvedType === 'mcq' ? 50 : resolvedType === 'sample-papers' ? 35 : undefined);
      setDurationMinutes(resolvedType === 'test-series' || resolvedType === 'sample-papers' ? 180 : undefined);
      setTotalMarks(resolvedType === 'test-series' || resolvedType === 'sample-papers' ? 100 : undefined);
      setPassingMarks(resolvedType === 'test-series' || resolvedType === 'sample-papers' ? 40 : undefined);
      setDifficulty('Medium');
      setHasSolution(true);
      setSolutionFileName('');
      setAcademicYear('2026-27');
    }
    setErrors({});
  }, [initialData, defaultType]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'docx' || ext === 'doc') setFileFormat('docx');
      else if (ext === 'zip' || ext === 'rar') setFileFormat('zip');
      else setFileFormat('pdf');
    }
  };

  const handleThumbnailFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setThumbnailUrl(reader.result);
          setSaveToast('Cover image updated!');
          setTimeout(() => setSaveToast(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!chapter.trim()) errs.chapter = 'Chapter name is required';
    if (!fileName.trim()) errs.fileName = 'Document file is required';
    setErrors(errs);

    if (errs.title && activeTab !== 'details') {
      setActiveTab('details');
    } else if (errs.chapter && activeTab !== 'chapter') {
      setActiveTab('chapter');
    } else if (errs.fileName && activeTab !== 'files') {
      setActiveTab('files');
    }

    return Object.keys(errs).length === 0;
  };

  const buildFormData = (): MaterialFormData => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    return {
      title: title.trim(),
      type,
      subject,
      grade,
      chapter: chapter.trim(),
      topic: topic.trim() || undefined,
      description: description.trim(),
      fileName: fileName.trim(),
      fileSize,
      fileFormat,
      thumbnailUrl: thumbnailUrl.trim() || getDefaultThumbnail(subject, type),
      status,
      isImportant,
      author: author.trim() || 'Admin Faculty',
      tags,
      questionsCount: questionsCount ? Number(questionsCount) : undefined,
      durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
      totalMarks: totalMarks ? Number(totalMarks) : undefined,
      passingMarks: passingMarks ? Number(passingMarks) : undefined,
      difficulty,
      hasSolution,
      solutionFileName: hasSolution ? solutionFileName.trim() : undefined,
      academicYear,
    };
  };

  const handleSaveProgress = () => {
    const data = buildFormData();
    onSave(data, true);

    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const nextTab = currentIndex < TAB_ORDER.length - 1 ? TAB_ORDER[currentIndex + 1] : activeTab;
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
      setSaveToast('Progress saved! Moved to next step.');
    } else {
      setSaveToast('Progress saved successfully!');
    }

    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    const data = buildFormData();
    onSave(data, false);
  };

  const handleDownloadDraft = () => {
    const textContent = `========================================================
RESOURCE PREVIEW: ${title || 'Untitled Document'}
CATEGORY: ${type.toUpperCase()}
SUBJECT: ${subject} | ${grade}
CHAPTER: ${chapter || 'N/A'}
FACULTY: ${author}
ACADEMIC YEAR: ${academicYear}
STATUS: ${status.toUpperCase()}
========================================================

DESCRIPTION:
${description || 'No description provided.'}

TAGS: ${tagsInput || 'None'}

${questionsCount ? `TOTAL QUESTIONS: ${questionsCount}` : ''}
${durationMinutes ? `TIME ALLOTTED: ${durationMinutes} Minutes` : ''}
${totalMarks ? `MAX MARKS: ${totalMarks}` : ''}
${passingMarks ? `PASSING MARKS: ${passingMarks}` : ''}
${hasSolution ? `SOLUTION KEY INCLUDED: ${solutionFileName || 'Yes'}` : ''}
========================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `${(title || 'resource').replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'media' as TabKey, label: 'Cover & Media', shortLabel: 'Cover', icon: ImageIcon, hasError: false },
    { id: 'details' as TabKey, label: 'Resource Details', shortLabel: 'Details', icon: BookOpen, hasError: !!errors.title },
    { id: 'chapter' as TabKey, label: 'Course & Chapter', shortLabel: 'Chapter', icon: Layers, hasError: !!errors.chapter },
    { id: 'assessment' as TabKey, label: 'Activity & Metrics', shortLabel: 'Metrics', icon: Clock, hasError: false },
    { id: 'files' as TabKey, label: 'Files & Access', shortLabel: 'Files', icon: FileText, hasError: !!errors.fileName },
  ];

  const currentStepNumber = TAB_ORDER.indexOf(activeTab) + 1;

  const diffText =
    difficulty === 'Easy'
      ? 'text-emerald-700 dark:text-emerald-300'
      : difficulty === 'Hard'
      ? 'text-rose-700 dark:text-rose-300'
      : 'text-amber-700 dark:text-amber-300';

  return (
    <div className="space-y-4 sm:space-y-5 pb-20 animate-in fade-in duration-200 min-w-0 w-full overflow-hidden">
      {/* Hidden file input for cover */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleThumbnailFileUpload}
        className="hidden"
      />

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1E293B] border border-transparent dark:border-[#334155] rounded-2xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155]/60 pb-3 flex-shrink-0">
              <div className="min-w-0 pr-3">
                <h3 className="text-sm font-semibold text-[#0f172a] dark:text-gray-100 truncate">Cover Image Preview</h3>
                <p className="text-[11px] text-[#64748b] dark:text-gray-400 truncate">{title || 'Resource Cover'}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full flex-1 min-h-48 max-h-[55vh] sm:max-h-[65vh] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-[#e2e8f0] dark:border-[#334155] flex items-center justify-center">
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="Cover Preview" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-center text-slate-400 dark:text-slate-500 p-4">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No cover image uploaded</p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer text-center"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  fileInputRef.current?.click();
                }}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${BTN_SOFT}`}
              >
                <Camera className="w-4 h-4 text-[#3b82f6] dark:text-[#60A5FA]" />
                <span>Upload New Cover</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Toast */}
      {saveToast && (
        <div className="fixed top-4 sm:top-5 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-200 max-w-xs sm:max-w-md">
          <div className="px-3.5 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/90 text-emerald-800 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-300 flex-shrink-0" />
            <span className="truncate">{saveToast}</span>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className={`${CARD} p-4 sm:p-5 space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-[#64748b] dark:text-gray-400 hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-[#e2e8f0] dark:border-[#334155] flex-shrink-0"
              title="Go back to list view"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] dark:text-gray-400 font-medium truncate">
                <span>Materials</span>
                <span>/</span>
                <span className="text-[#3b82f6] dark:text-[#60A5FA] font-semibold truncate">{categoryTitle}</span>
                <span>/</span>
                <span>{isEditing ? 'Edit' : 'New'}</span>
              </div>
              <h1 className="text-sm sm:text-base font-semibold text-[#0f172a] dark:text-gray-100 mt-0.5 truncate">
                {isEditing ? `Edit: ${initialData.title}` : 'Create New Study Material'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end pt-1 sm:pt-0">
            <button
              type="button"
              onClick={onCancel}
              className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center ${BTN_OUTLINE}`}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveProgress}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${BTN_SOFT}`}
              title="Save progress and proceed to next step"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Progress</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Publish Resource'}</span>
            </button>
          </div>
        </div>

        {/* Mobile accordion toggle */}
        <div className="block lg:hidden border-t border-slate-100 dark:border-[#334155]/60 pt-2.5">
          <button
            type="button"
            onClick={() => setShowMobileSummary((prev) => !prev)}
            className={`w-full py-2 px-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl text-xs font-semibold text-slate-700 dark:text-gray-300 flex items-center justify-between transition-colors cursor-pointer ${SOFT_ROW}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="truncate">Resource Info & Quick Actions</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">({status})</span>
            </div>
            {showMobileSummary ? (
              <ChevronUp className="w-4 h-4 text-slate-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start min-w-0">
        {/* LEFT: Summary & Quick Actions */}
        <div
          className={`space-y-4 min-w-0 ${showMobileSummary ? 'block' : 'hidden lg:block'} lg:col-span-4 xl:col-span-4`}
        >
          {/* Identity Card */}
          <div className={`${CARD} p-4 sm:p-5 relative overflow-hidden min-w-0`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
                Resource Cover
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                  status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
                    : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                />
                {status === 'published' ? 'Active / Published' : 'Draft Mode'}
              </span>
            </div>

            <div
              className="relative w-full h-40 sm:h-48 rounded-2xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xs group cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
              title="Click to view full preview"
            >
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Cover"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl sm:text-3xl">
                  {subject.charAt(0)}
                  <span className="text-xs font-semibold mt-1 opacity-80">{subject}</span>
                </div>
              )}

              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                <Maximize2 className="w-4 h-4" />
                <span className="text-xs font-bold">Preview</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute bottom-2.5 right-2.5 p-1.5 sm:p-2 bg-white/95 dark:bg-[#1E293B]/95 hover:bg-white dark:hover:bg-[#1E293B] text-slate-700 dark:text-gray-200 hover:text-blue-600 rounded-xl shadow-md border border-slate-200/90 dark:border-[#334155] transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-semibold"
                title="Change image file"
              >
                <Camera className="w-3.5 h-3.5 text-[#3b82f6] dark:text-[#60A5FA]" />
                <span className="hidden min-[480px]:inline">Change</span>
              </button>
            </div>

            <div className="mt-3 text-left min-w-0">
              <h2 className="text-sm font-semibold text-[#0f172a] dark:text-gray-100 line-clamp-2 leading-snug break-words">
                {title || 'Untitled Study Resource'}
              </h2>
              <div className="text-xs font-semibold text-[#3b82f6] dark:text-[#60A5FA] mt-1 truncate">{author}</div>
              <div className="text-xs text-[#64748b] dark:text-gray-400 mt-0.5 truncate">
                {grade} • {subject}
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-[#334155]/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#64748b] dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span>Year</span>
                </div>
                <span className="font-semibold text-[#0f172a] dark:text-gray-100 truncate">{academicYear}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#64748b] dark:text-gray-400">
                  <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span>Format</span>
                </div>
                <span className="font-semibold uppercase text-blue-700 dark:text-[#60A5FA] truncate">
                  {fileFormat} ({fileSize})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#64748b] dark:text-gray-400">
                  <Gauge className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span>Difficulty</span>
                </div>
                <span className={`font-semibold ${diffText}`}>{difficulty}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#64748b] dark:text-gray-400">
                  <Award className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span>Hotspot</span>
                </div>
                <span
                  className={`font-semibold ${
                    isImportant
                      ? 'text-amber-700 dark:text-amber-300 flex items-center gap-1'
                      : 'text-slate-500 dark:text-gray-400'
                  }`}
                >
                  {isImportant ? (
                    <>
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Flagged
                    </>
                  ) : (
                    'Standard'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`${CARD} p-4 sm:p-5 space-y-2.5`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f172a] dark:text-gray-100">
                Quick Actions
              </h3>
              <span className="text-[11px] text-[#64748b] dark:text-gray-400">Manage</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDownloadDraft}
                className="w-full py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Download Attachment</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('files')}
                className={`w-full py-2 px-3.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-gray-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${SOFT_ROW}`}
              >
                <FileText className="w-4 h-4 text-[#3b82f6] dark:text-[#60A5FA] flex-shrink-0" />
                <span className="truncate">Replace / Update File</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus(status === 'published' ? 'draft' : 'published')}
                className="w-full py-2 px-3.5 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-xl border border-amber-200 dark:border-amber-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-300 flex-shrink-0" />
                <span className="truncate">Switch to {status === 'published' ? 'Draft' : 'Published'}</span>
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2 px-3.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="truncate">Discard Changes & Exit</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Tabbed workspace */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4 min-w-0 w-full">
          {/* Tabs bar */}
          <div
            className={`${CARD} p-1.5 sm:p-2 flex items-center gap-1 sm:gap-1.5 overflow-x-auto ${HIDE_SCROLLBAR} scroll-smooth min-w-0 w-full`}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-[#64748b] dark:text-gray-400 hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  {tab.hasError && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#1E293B] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Cover & Media */}
          {activeTab === 'media' && (
            <div className="space-y-4 min-w-0">
              <div className={`${CARD} p-4 sm:p-6 space-y-4 min-w-0`}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155]/60 pb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <ImageIcon className="w-4 h-4 text-[#3b82f6] dark:text-[#60A5FA] flex-shrink-0" />
                    <h3 className={H3}>Cover Thumbnail & Visual Presentation</h3>
                  </div>
                  {thumbnailUrl && (
                    <button
                      type="button"
                      onClick={() => setThumbnailUrl('')}
                      className="text-xs text-rose-600 dark:text-rose-300 hover:text-rose-700 font-semibold cursor-pointer flex-shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start min-w-0">
                  <div
                    className="w-full h-44 sm:h-52 rounded-2xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center relative group cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                    title="Click to view full preview"
                  >
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-400 dark:text-slate-500 p-4">
                        <ImageIcon className="w-8 h-8 mx-auto opacity-40 mb-1" />
                        <span className="text-[11px]">No cover image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                      <Maximize2 className="w-4 h-4" />
                      <span>Full Preview</span>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4 min-w-0">
                    <div>
                      <label className={LBL_SM}>Upload Custom Cover Image</label>
                      <input type="file" accept="image/*" onChange={handleThumbnailFileUpload} className={FILE_INPUT} />
                    </div>

                    <div>
                      <label className={`${LBL_SM} mb-2`}>Or Pick From Presets</label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {PRESET_THUMBNAILS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setThumbnailUrl(preset.url)}
                            className={`h-13 sm:h-14 rounded-xl overflow-hidden border relative cursor-pointer transition-all ${
                              thumbnailUrl === preset.url
                                ? 'border-blue-600 ring-2 ring-blue-100 dark:ring-[#2451D9]/30 scale-95'
                                : 'border-[#e2e8f0] dark:border-[#334155] hover:border-slate-300 dark:hover:border-slate-500'
                            }`}
                            title={preset.title}
                          >
                            <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1 sm:p-2">
                <span className="text-xs text-[#64748b] dark:text-gray-400 font-medium text-center sm:text-left">
                  Step {currentStepNumber} of 5: Cover & Media
                </span>
                <button
                  type="button"
                  onClick={handleSaveProgress}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${BTN_SOFT}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Progress & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Resource Details */}
          {activeTab === 'details' && (
            <div className="space-y-4 min-w-0">
              <div className={`${CARD} p-4 sm:p-6 space-y-4 min-w-0`}>
                <div className={HEAD}>
                  <BookOpen className="w-4 h-4 text-[#3b82f6] dark:text-[#60A5FA] flex-shrink-0" />
                  <h3 className={H3}>Basic Information</h3>
                </div>

                <div>
                  <label className={LBL}>
                    Document Title <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className={`${ICON_L} flex-shrink-0`} />
                    <input
                      type="text"
                      placeholder="e.g. Matter in Our Surroundings Notes"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl transition-colors ${FIELD_BASE} ${
                        errors.title ? FIELD_ERR : FIELD_OK
                      }`}
                    />
                  </div>
                  {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <label className={LBL}>Academic Category / Type</label>
                    <div className="relative">
                      <Folder className={ICON_L} />
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as MaterialType)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl cursor-pointer capitalize ${FIELD_BASE} ${FIELD_OK}`}
                      >
                        <option value="notes">Notes</option>
                        <option value="practice-questions">Practice Questions</option>
                        <option value="formula-sheets">Formula Sheets</option>
                        <option value="mcq">MCQ Bank</option>
                        <option value="important-questions">Important Questions</option>
                        <option value="sample-papers">Sample Papers</option>
                        <option value="test-series">Test Series</option>
                        <option value="question-bank">Question Bank</option>
                      </select>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className={LBL}>Subject</label>
                    <div className="relative">
                      <BookOpen className={ICON_L} />
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl cursor-pointer ${FIELD_BASE} ${FIELD_OK}`}
                      >
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Biology">Biology</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="English">English</option>
                        <option value="Social Studies">Social Studies</option>
                        <option value="Science (Combined)">Science (Combined)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <label className={LBL}>Target Grade / Class</label>
                    <div className="relative">
                      <GraduationCap className={ICON_L} />
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl cursor-pointer ${FIELD_BASE} ${FIELD_OK}`}
                      >
                        <option value="Class 9th">Class 9th</option>
                        <option value="Class 10th">Class 10th</option>
                        <option value="Class 11th">Class 11th</option>
                        <option value="Class 12th">Class 12th</option>
                        <option value="JEE / NEET">JEE / NEET</option>
                        <option value="Foundation">Foundation</option>
                      </select>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className={LBL}>Academic Year</label>
                    <div className="relative">
                      <Calendar className={ICON_L} />
                      <input
                        type="text"
                        placeholder="2026-27"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl ${FIELD_BASE} ${FIELD_OK}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${CARD} p-4 sm:p-6 space-y-3 min-w-0`}>
                <div className={HEAD}>
                  <Layers className="w-4 h-4 text-[#3b82f6] dark:text-[#60A5FA] flex-shrink-0" />
                  <h3 className={H3}>Syllabus Coverage & Description</h3>
                </div>

                <div>
                  <textarea
                    rows={4}
                    placeholder="Enter detailed description, student learning goals, derivations, and topic summary..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full p-3.5 text-xs sm:text-sm rounded-xl resize-none leading-relaxed ${FIELD_BASE} ${FIELD_OK}`}
                  />
                  <div className="text-right text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    {description.length} characters
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1 sm:p-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('media')}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs whitespace-nowrap ${BTN_OUTLINE}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous: Cover & Media</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveProgress}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${BTN_SOFT}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Progress & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Course & Chapter */}
          {activeTab === 'chapter' && (
            <div className="space-y-4 min-w-0">
              <div className={`${CARD} p-4 sm:p-6 space-y-4 min-w-0`}>
                <div className={HEAD}>
                  <Layers className="w-4 h-4 text-[#3b82f6] dark:text-[#60A5FA] flex-shrink-0" />
                  <h3 className={H3}>Chapter & Topic Alignment</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <label className={LBL}>
                      Chapter Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Bookmark className={`${ICON_L} flex-shrink-0`} />
                      <input
                        type="text"
                        placeholder="e.g. Matter in Our Surroundings"
                        value={chapter}
                        onChange={(e) => setChapter(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl ${FIELD_BASE} ${
                          errors.chapter ? FIELD_ERR : FIELD_OK
                        }`}
                      />
                    </div>
                    {errors.chapter && <p className="text-[11px] text-rose-500 mt-1">{errors.chapter}</p>}
                  </div>

                  <div className="min-w-0">
                    <label className={LBL}>Specific Topic / Focus Area (Optional)</label>
                    <div className="relative">
                      <Sparkles className={`${ICON_L} flex-shrink-0`} />
                      <input
                        type="text"
                        placeholder="e.g. States of Matter, Latent Heat & Evaporation"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl ${FIELD_BASE} ${FIELD_OK}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <label className={LBL}>Author / Faculty Name</label>
                    <div className="relative">
                      <User className={`${ICON_L} flex-shrink-0`} />
                      <input
                        type="text"
                        placeholder="Sunita Mehra (Senior Science Faculty)"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl ${FIELD_BASE} ${FIELD_OK}`}
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className={LBL}>Tags (Comma-separated)</label>
                    <div className="relative">
                      <Tag className={`${ICON_L} flex-shrink-0`} />
                      <input
                        type="text"
                        placeholder="Class 9th, Science, Chemistry Basics"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl ${FIELD_BASE} ${FIELD_OK}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Flame className="w-5 h-5 text-amber-500 fill-amber-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-amber-900 dark:text-amber-200 truncate">
                        High-Yield Hotspot Resource
                      </div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-300/80">
                        Highlighted prominently for rapid student exam revision.
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className={`${CHECKBOX} self-end min-[480px]:self-auto`}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1 sm:p-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs whitespace-nowrap ${BTN_OUTLINE}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous: Details</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveProgress}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${BTN_SOFT}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Progress & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Activity & Metrics */}
          {activeTab === 'assessment' && (
            <div className="space-y-4 min-w-0">
              <div className={`${CARD} p-4 sm:p-6 space-y-4 min-w-0`}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155]/60 pb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-4 h-4 text-[#3b82f6] dark:text-[#60A5FA] flex-shrink-0" />
                    <h3 className={H3}>Assessment & Practice Metrics</h3>
                  </div>
                  <span className="text-[11px] text-[#64748b] dark:text-gray-400 flex-shrink-0">Optional</span>
                </div>

                <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <label className={`${LBL_SM} truncate`}>Questions Count</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={questionsCount ?? ''}
                      onChange={(e) => setQuestionsCount(e.target.value ? Number(e.target.value) : undefined)}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl ${FIELD_BASE} ${FIELD_OK}`}
                    />
                  </div>

                  <div className="min-w-0">
                    <label className={`${LBL_SM} truncate`}>Duration (Mins)</label>
                    <input
                      type="number"
                      placeholder="e.g. 180"
                      value={durationMinutes ?? ''}
                      onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : undefined)}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl ${FIELD_BASE} ${FIELD_OK}`}
                    />
                  </div>

                  <div className="min-w-0">
                    <label className={`${LBL_SM} truncate`}>Total Marks</label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={totalMarks ?? ''}
                      onChange={(e) => setTotalMarks(e.target.value ? Number(e.target.value) : undefined)}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl ${FIELD_BASE} ${FIELD_OK}`}
                    />
                  </div>

                  <div className="min-w-0">
                    <label className={`${LBL_SM} truncate`}>Passing Marks</label>
                    <input
                      type="number"
                      placeholder="e.g. 35"
                      value={passingMarks ?? ''}
                      onChange={(e) => setPassingMarks(e.target.value ? Number(e.target.value) : undefined)}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl ${FIELD_BASE} ${FIELD_OK}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1 sm:p-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('chapter')}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs whitespace-nowrap ${BTN_OUTLINE}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous: Chapter</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveProgress}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${BTN_SOFT}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Progress & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Files & Access */}
          {activeTab === 'files' && (
            <div className="space-y-4 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                {/* Attached Document File */}
                <div className={`${CARD} p-4 sm:p-6 space-y-4 min-w-0`}>
                  <div className={HEAD}>
                    <FileText className="w-4 h-4 text-[#3b82f6] dark:text-[#60A5FA] flex-shrink-0" />
                    <h3 className={H3}>Attached Document File</h3>
                  </div>

                  <div>
                    <label className={LBL}>
                      File Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Class9_Science_Matter_Notes.pdf"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl ${FIELD_BASE} ${
                        errors.fileName ? FIELD_ERR : FIELD_OK
                      }`}
                    />
                    {errors.fileName && <p className="text-[11px] text-rose-500 mt-1">{errors.fileName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <label className={LBL_SM}>File Size</label>
                      <input
                        type="text"
                        placeholder="3.5 MB"
                        value={fileSize}
                        onChange={(e) => setFileSize(e.target.value)}
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl ${FIELD_BASE} ${FIELD_OK}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <label className={LBL_SM}>Format</label>
                      <select
                        value={fileFormat}
                        onChange={(e) => setFileFormat(e.target.value as FileFormat)}
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl cursor-pointer uppercase ${FIELD_BASE} ${FIELD_OK}`}
                      >
                        <option value="pdf">PDF</option>
                        <option value="docx">DOCX</option>
                        <option value="zip">ZIP</option>
                        <option value="quiz">QUIZ</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={LBL_SM}>Replace / Upload New File</label>
                    <input type="file" onChange={handleFileUpload} className={FILE_INPUT} />
                  </div>

                  {/* Difficulty Level Buttons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-[#334155]/60 space-y-2">
                    <label className="block text-xs font-semibold text-[#0f172a] dark:text-gray-100">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => {
                        const isSelected = difficulty === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setDifficulty(lvl)}
                            className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? lvl === 'Easy'
                                  ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-bold ring-1 ring-emerald-200 dark:ring-emerald-500/20'
                                  : lvl === 'Hard'
                                  ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-500/10 text-rose-900 dark:text-rose-300 font-bold ring-1 ring-rose-200 dark:ring-rose-500/20'
                                  : 'border-amber-500 bg-amber-50/80 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold ring-1 ring-amber-200 dark:ring-amber-500/20'
                                : 'border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'
                            }`}
                          >
                            <div className="text-xs truncate">{lvl}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Solution & Publishing Status */}
                <div className={`${CARD} p-4 sm:p-6 space-y-4 flex flex-col justify-between min-w-0`}>
                  <div className="space-y-4 min-w-0">
                    <div className={HEAD}>
                      <ShieldCheck className="w-4 h-4 text-[#3b82f6] dark:text-[#60A5FA] flex-shrink-0" />
                      <h3 className={H3}>Solution & Access Control</h3>
                    </div>

                    <div className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 ${SOFT_ROW}`}>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#0f172a] dark:text-gray-100 truncate">
                          Answer Key Included
                        </div>
                        <div className="text-[11px] text-[#64748b] dark:text-gray-400">
                          Step-by-step marking rationale
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={hasSolution}
                        onChange={(e) => setHasSolution(e.target.checked)}
                        className={CHECKBOX}
                      />
                    </div>

                    {hasSolution && (
                      <div>
                        <label className={LBL_SM}>Solution File Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Optics_Solutions_Key.pdf"
                          value={solutionFileName}
                          onChange={(e) => setSolutionFileName(e.target.value)}
                          className={`w-full px-3.5 py-2.5 text-xs rounded-xl ${FIELD_BASE} ${FIELD_OK}`}
                        />
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-[#334155]/60">
                      <label className="block text-xs font-semibold text-[#0f172a] dark:text-gray-100 mb-2">
                        Publishing Status
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setStatus('published')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            status === 'published'
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-500/20'
                              : 'border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          🟢 Published
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus('draft')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            status === 'draft'
                              ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-800 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-500/20'
                              : 'border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          🟡 Draft
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Final save */}
                  <div className="pt-4 border-t border-slate-100 dark:border-[#334155]/60 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('assessment')}
                      className={`inline-flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs whitespace-nowrap ${BTN_OUTLINE}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous: Metrics</span>
                    </button>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveProgress}
                        className={`px-3 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center whitespace-nowrap ${BTN_SOFT}`}
                      >
                        Save Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save & Finish</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};