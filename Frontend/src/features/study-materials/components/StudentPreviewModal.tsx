import React, { useState, useMemo } from 'react';
import {
  X,
  GraduationCap,
  Laptop,
  Tablet,
  Smartphone,
  Search,
  BookOpen,
  Download,
  Eye,
  Bookmark,
  Flame,
  CheckCircle,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import type { StudyMaterialItem, MaterialType } from '../types';

interface StudentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: StudyMaterialItem[];
  defaultCategory?: MaterialType | 'all';
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Resources' },
  { id: 'notes', label: 'Notes' },
  { id: 'practice-questions', label: 'Practice Questions' },
  { id: 'formula-sheets', label: 'Formula Sheets' },
  { id: 'mcq', label: 'MCQ Bank' },
  { id: 'important-questions', label: 'Important Questions' },
  { id: 'sample-papers', label: 'Sample Papers' },
  { id: 'test-series', label: 'Test Series' },
  { id: 'question-bank', label: 'Question Bank' },
];

const DIFF_BADGE = {
  Easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  Hard: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
};

export const StudentPreviewModal: React.FC<StudentPreviewModalProps> = ({
  isOpen,
  onClose,
  materials,
  defaultCategory = 'all',
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<MaterialType | 'all'>(
    defaultCategory === 'overview' ? 'all' : defaultCategory
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [readingItem, setReadingItem] = useState<StudyMaterialItem | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // ONLY PUBLISHED materials are visible to students!
  const publishedMaterials = useMemo(() => {
    return materials.filter((m) => m.status === 'published');
  }, [materials]);

  const subjects = useMemo(() => {
    const list = Array.from(new Set(publishedMaterials.map((m) => m.subject)));
    return ['All', ...list];
  }, [publishedMaterials]);

  const filteredMaterials = useMemo(() => {
    return publishedMaterials.filter((item) => {
      if (selectedSubject !== 'All' && item.subject !== selectedSubject) return false;
      if (selectedCategory !== 'all' && item.type !== selectedCategory) return false;
      if (selectedGrade !== 'All' && item.grade !== selectedGrade) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesChapter = item.chapter.toLowerCase().includes(q);
        const matchesTopic = item.topic?.toLowerCase().includes(q);
        const matchesAuthor = item.author.toLowerCase().includes(q);
        if (!matchesTitle && !matchesChapter && !matchesTopic && !matchesAuthor) return false;
      }
      return true;
    });
  }, [publishedMaterials, selectedSubject, selectedCategory, selectedGrade, searchQuery]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStudentDownload = (item: StudyMaterialItem) => {
    setDownloadSuccessId(item.id);
    setTimeout(() => setDownloadSuccessId(null), 2500);

    const textContent = `========================================================
RESOURCE: ${item.title}
CATEGORY: ${item.type.toUpperCase()}
SUBJECT: ${item.subject} | ${item.grade}
CHAPTER: ${item.chapter}
FACULTY: ${item.author}
ACADEMIC YEAR: ${item.academicYear || '2026-27'}
========================================================

DESCRIPTION:
${item.description}

TAGS: ${item.tags.join(', ')}

${item.questionsCount ? `TOTAL QUESTIONS: ${item.questionsCount}` : ''}
${item.durationMinutes ? `TIME ALLOTTED: ${item.durationMinutes} Minutes` : ''}
${item.totalMarks ? `MAX MARKS: ${item.totalMarks}` : ''}
${item.hasSolution ? `COMPLETE STEP-BY-STEP SOLUTION KEY INCLUDED` : ''}

--------------------------------------------------------
Downloaded via EduAdmin Student Academic Learning Portal
========================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.fileName || `${item.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* Top Admin Controller Bar (dark by design) */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Student Portal Preview</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-2xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live simulation • Only {publishedMaterials.length} published materials visible</span>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          {(
            [
              { id: 'desktop', label: 'Desktop', Icon: Laptop },
              { id: 'tablet', label: 'Tablet', Icon: Tablet },
              { id: 'mobile', label: 'Mobile', Icon: Smartphone },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDeviceMode(id)}
              className={`flex items-center gap-1.5 px-3 py-1 text-2xs font-semibold rounded-lg transition-colors cursor-pointer ${
                deviceMode === id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <X className="w-4 h-4" />
          <span>Exit Preview</span>
        </button>
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 flex items-start justify-center bg-slate-900/60">
        <div
          className={`bg-slate-50 dark:bg-[#0F172A] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-slate-200 dark:border-[#334155] flex flex-col ${
            deviceMode === 'desktop'
              ? 'w-full max-w-6xl min-h-[85vh]'
              : deviceMode === 'tablet'
              ? 'w-full max-w-2xl min-h-[85vh]'
              : 'w-full max-w-sm min-h-[85vh]'
          }`}
        >
          {/* Simulated Student Portal Header */}
          <header className="bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-[#334155] px-4 sm:px-6 py-3.5 sticky top-0 z-20 shadow-2xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-gray-100 leading-tight">
                    EduAcademy Portal
                  </div>
                  <div className="text-2xs text-slate-500 dark:text-gray-400 font-medium">
                    Student Study & Revision Hub
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-800 dark:text-gray-100">Rahul Sharma</div>
                  <div className="text-2xs text-blue-600 dark:text-[#60A5FA] font-semibold">
                    Class 12th PCM • Roll #104
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-[#2451D9]/20 dark:text-[#60A5FA] font-bold text-xs flex items-center justify-center border border-blue-200 dark:border-[#2451D9]/40">
                  RS
                </div>
              </div>
            </div>

            {/* Search & Quick Filters */}
            <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search syllabus notes, worksheets, formula sheets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0F172A] text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-[#334155] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="text-xs bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-gray-300 font-medium cursor-pointer"
                >
                  <option value="All">All Classes</option>
                  <option value="Class 9th">Class 9th</option>
                  <option value="Class 10th">Class 10th</option>
                  <option value="Class 11th">Class 11th</option>
                  <option value="Class 12th">Class 12th</option>
                </select>
              </div>
            </div>

            {/* Subject Pills */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 text-xs">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1 rounded-full text-2xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedSubject === sub
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </header>

          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white p-5 sm:p-6 shadow-inner relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-white/20 backdrop-blur-xs text-white mb-2">
                <Sparkles className="w-3 h-3 text-amber-300" />
                2026-27 Board & Competitive Academic Repository
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold leading-tight">
                Curated High-Yield Notes & Question Worksheets
              </h1>
              <p className="text-xs text-blue-100 mt-1">
                Verified by senior department faculty. Instant access to formula sheets, chapter summaries, and
                step-by-step solved test papers.
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-[#334155] px-4 sm:px-6 py-2 overflow-x-auto flex items-center gap-1.5">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as MaterialType | 'all')}
                className={`px-3 py-1.5 text-2xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#2451D9]/20 dark:text-[#60A5FA] dark:border-[#2451D9]/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Materials Grid */}
          <main className="flex-1 p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 font-medium">
              <span>Showing {filteredMaterials.length} student resources</span>
              {bookmarkedIds.size > 0 && (
                <span className="text-amber-600 dark:text-amber-300 font-semibold">
                  ★ {bookmarkedIds.size} Bookmarked
                </span>
              )}
            </div>

            {filteredMaterials.length === 0 ? (
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-2xl p-10 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-gray-100">No Materials Published Yet</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
                  Only materials with &quot;Published&quot; status appear in this student portal. Draft or archived
                  items remain hidden.
                </p>
              </div>
            ) : (
              <div
                className={`grid gap-4 ${
                  deviceMode === 'mobile'
                    ? 'grid-cols-1'
                    : deviceMode === 'tablet'
                    ? 'grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {filteredMaterials.map((item) => {
                  const isBookmarked = bookmarkedIds.has(item.id);
                  const isDownloaded = downloadSuccessId === item.id;
                  const diffKey = (item.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard';

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-[#2451D9]/60 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {item.thumbnailUrl && (
                          <div
                            onClick={() => setReadingItem(item)}
                            className="w-full h-32 rounded-xl overflow-hidden mb-3 border border-slate-100 dark:border-[#334155] bg-slate-100 dark:bg-slate-800 relative cursor-pointer group/thumb"
                            title="Click to read material"
                          >
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-end p-2.5">
                              <span className="text-white text-2xs font-semibold flex items-center gap-1 bg-slate-900/70 px-2 py-0.5 rounded backdrop-blur-xs">
                                <Eye className="w-3 h-3" /> Read Online
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-2xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-[#2451D9]/20 dark:text-[#60A5FA]">
                              {item.type.replace('-', ' ')}
                            </span>
                            {item.isImportant && (
                              <span
                                title="High Yield Exam Revision"
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 text-3xs font-bold border border-amber-200 dark:border-amber-500/30"
                              >
                                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span>HOT</span>
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleBookmark(item.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isBookmarked
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800'
                            }`}
                            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this note'}
                          >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                          </button>
                        </div>

                        <h3
                          onClick={() => setReadingItem(item)}
                          className="text-xs font-bold text-slate-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-[#60A5FA] transition-colors cursor-pointer"
                        >
                          {item.title}
                        </h3>

                        <div className="text-2xs text-slate-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {item.chapter} {item.topic && `• ${item.topic}`}
                        </div>

                        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap text-2xs">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-semibold text-slate-700 dark:text-gray-300">
                            {item.subject}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-medium text-slate-600 dark:text-gray-400">
                            {item.grade}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md font-bold ${DIFF_BADGE[diffKey]}`}>
                            {item.difficulty || 'Medium'}
                          </span>
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-[#2451D9]/20 dark:text-[#60A5FA] rounded-md font-bold uppercase">
                            {item.fileFormat}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#334155]/60 flex items-center justify-between gap-2">
                        <span className="text-2xs text-slate-400 dark:text-slate-500 font-mono">{item.fileSize}</span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setReadingItem(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Read</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStudentDownload(item)}
                            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs ${
                              isDownloaded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                            }`}
                          >
                            {isDownloaded ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3 h-3" />
                                <span>Download</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          <footer className="bg-white dark:bg-[#1E293B] border-t border-slate-200 dark:border-[#334155] px-6 py-4 text-center text-2xs text-slate-400 dark:text-slate-500">
            EduAdmin Academic Portal • Student Learning Management System • All rights reserved
          </footer>
        </div>
      </div>

      {/* Reader Modal */}
      {readingItem && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 border border-transparent dark:border-[#334155]">
            {/* Reader Header (dark by design) */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setReadingItem(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-xs font-bold line-clamp-1">{readingItem.title}</h3>
                  <div className="text-2xs text-slate-400">
                    {readingItem.subject} • {readingItem.grade} • {readingItem.chapter}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStudentDownload(readingItem)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReadingItem(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reader Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-50 dark:bg-[#0F172A]">
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 dark:border-[#334155]/60 pb-4">
                  <div className="text-2xs font-bold uppercase tracking-wider text-blue-600 dark:text-[#60A5FA]">
                    Official Course Document
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 mt-1">{readingItem.title}</h2>
                  <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                    Prepared by:{' '}
                    <span className="font-semibold text-slate-700 dark:text-gray-300">{readingItem.author}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                    Syllabus Scope & Chapter Overview
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-[#334155]/60">
                    {readingItem.description}
                  </p>
                </div>

                {readingItem.questionsCount && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-blue-50/50 dark:bg-[#2451D9]/10 rounded-xl border border-blue-100 dark:border-[#2451D9]/30 text-center">
                    <div>
                      <div className="text-2xs text-slate-500 dark:text-gray-400 font-semibold">Questions</div>
                      <div className="text-sm font-bold text-blue-700 dark:text-[#60A5FA]">
                        {readingItem.questionsCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xs text-slate-500 dark:text-gray-400 font-semibold">Duration</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-gray-100">
                        {readingItem.durationMinutes || 60} mins
                      </div>
                    </div>
                    <div>
                      <div className="text-2xs text-slate-500 dark:text-gray-400 font-semibold">Total Marks</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-gray-100">
                        {readingItem.totalMarks || 100}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xs text-slate-500 dark:text-gray-400 font-semibold">Passing Marks</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-gray-100">
                        {readingItem.passingMarks || 35}
                      </div>
                    </div>
                  </div>
                )}

                {readingItem.hasSolution && (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                      <span>Step-by-Step Marking & Solution Key included in document</span>
                    </div>
                    {readingItem.solutionFileName && (
                      <span className="text-2xs text-emerald-700 dark:text-emerald-300 font-mono">
                        {readingItem.solutionFileName}
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-[#334155]/60 flex items-center justify-between text-2xs text-slate-400 dark:text-slate-500">
                  <span>File: {readingItem.fileName}</span>
                  <span>Size: {readingItem.fileSize}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};