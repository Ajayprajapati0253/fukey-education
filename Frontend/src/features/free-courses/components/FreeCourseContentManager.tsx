import React, { useState, useEffect, useRef } from 'react';
import type { CourseModule, ResourceItem, ContentResourceType, FreeCourse } from '../types/free-course.types';
import { freeCourseContentApi } from '../api/freeCourseContent.api';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useFreeToast as useToast } from '../hooks/useFreeToast';
import {
  FolderPlus,
  Plus,
  Video,
  FileText,
  FileQuestion,
  Link as LinkIcon,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Eye,
  Download,
  CheckCircle2,
  Radio,
  FileDown,
  UploadCloud,
  FileCheck,
  X,
  Check,
} from 'lucide-react';

interface FreeCourseContentManagerProps {
  course: FreeCourse;
  onClose?: () => void;
}

export const FreeCourseContentManager: React.FC<FreeCourseContentManagerProps> = ({
  course,
  onClose,
}) => {
  const { success, error, info } = useToast();
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [, setIsLoading] = useState(true);

  // Expanded toggles
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Modals
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  const [addChapterModal, setAddChapterModal] = useState<{ isOpen: boolean; moduleId: string }>({
    isOpen: false,
    moduleId: '',
  });
  const [newChapterTitle, setNewChapterTitle] = useState('');

  const [addLessonModal, setAddLessonModal] = useState<{
    isOpen: boolean;
    moduleId: string;
    chapterId: string;
  }>({ isOpen: false, moduleId: '', chapterId: '' });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    duration: '35 mins',
    contentType: 'youtube_recorded' as ContentResourceType,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: '',
  });

  // Resource CRUD state
  const initialResourceForm = {
    title: '',
    type: 'pdf' as ContentResourceType,
    url: '',
    fileSize: '',
    fileName: '',
    fileData: '',
    downloadable: true,
  };

  const [addResourceModal, setAddResourceModal] = useState<{
    isOpen: boolean;
    moduleId: string;
    chapterId: string;
    lessonId: string;
  }>({ isOpen: false, moduleId: '', chapterId: '', lessonId: '' });

  const [editResourceModal, setEditResourceModal] = useState<{
    isOpen: boolean;
    moduleId: string;
    chapterId: string;
    lessonId: string;
    resource: ResourceItem | null;
  }>({ isOpen: false, moduleId: '', chapterId: '', lessonId: '', resource: null });

  const [resourceForm, setResourceForm] = useState(initialResourceForm);
  const [editResourceForm, setEditResourceForm] = useState(initialResourceForm);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Resource preview modal
  const [previewResource, setPreviewResource] = useState<ResourceItem | null>(null);

  // File size & type helpers
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const detectResourceType = (fileName: string): ContentResourceType => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'doc' || ext === 'docx') return 'study_material';
    if (ext === 'ppt' || ext === 'pptx') return 'notes';
    if (ext === 'xls' || ext === 'xlsx') return 'question_set';
    return 'study_material';
  };

  const cleanFileNameToTitle = (fileName: string): string => {
    return fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleFileSelect = (file: File, isEdit: boolean = false) => {
    if (file.size > 25 * 1024 * 1024) {
      error('File Too Large', 'Please select a document smaller than 25MB.');
      return;
    }

    const calculatedSize = formatFileSize(file.size);
    const detectedType = detectResourceType(file.name);
    const suggestedTitle = cleanFileNameToTitle(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (isEdit) {
        setEditResourceForm((prev) => ({
          ...prev,
          fileName: file.name,
          fileSize: calculatedSize,
          fileData: dataUrl,
          title: prev.title.trim() ? prev.title : suggestedTitle,
          type: prev.type || detectedType,
        }));
      } else {
        setResourceForm((prev) => ({
          ...prev,
          fileName: file.name,
          fileSize: calculatedSize,
          fileData: dataUrl,
          title: prev.title.trim() ? prev.title : suggestedTitle,
          type: detectedType,
        }));
      }
      success('Document Loaded', `${file.name} (${calculatedSize}) ready to attach.`);
    };
    reader.readAsDataURL(file);
  };

  // Load modules
  const loadModules = async () => {
    setIsLoading(true);
    try {
      const data = await freeCourseContentApi.getModules(course.id);
      setModules(data);
      // Auto expand first module & chapters
      if (data.length > 0) {
        const expM: Record<string, boolean> = {};
        const expC: Record<string, boolean> = {};
        data.forEach((m) => {
          expM[m.id] = true;
          m.chapters?.forEach((c) => {
            expC[c.id] = true;
          });
        });
        setExpandedModules(expM);
        setExpandedChapters(expC);
      }
    } catch (err: any) {
      error('Failed to load course modules', err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, [course.id]);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const toggleChapter = (chapId: string) => {
    setExpandedChapters((prev) => ({ ...prev, [chapId]: !prev[chapId] }));
  };

  // Add Module
  const handleCreateModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      const created = await freeCourseContentApi.createModule(
        course.id,
        newModuleTitle.trim(),
        newModuleDesc.trim()
      );
      setModules((prev) => [...prev, created]);
      setExpandedModules((prev) => ({ ...prev, [created.id]: true }));
      setNewModuleTitle('');
      setNewModuleDesc('');
      setAddModuleOpen(false);
      success('Module Added', `Created "${created.title}"`);
    } catch (err: any) {
      error('Error creating module', err?.message);
    }
  };

  // Delete Module
  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this module and its chapters?')) return;
    try {
      await freeCourseContentApi.deleteModule(course.id, moduleId);
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      info('Module Deleted');
    } catch (err: any) {
      error('Error deleting module', err?.message);
    }
  };

  // Add Chapter
  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim() || !addChapterModal.moduleId) return;
    try {
      const created = await freeCourseContentApi.createChapter(
        course.id,
        addChapterModal.moduleId,
        newChapterTitle.trim()
      );
      setModules((prev) =>
        prev.map((m) => {
          if (m.id === addChapterModal.moduleId) {
            return { ...m, chapters: [...m.chapters, created] };
          }
          return m;
        })
      );
      setExpandedChapters((prev) => ({ ...prev, [created.id]: true }));
      setNewChapterTitle('');
      setAddChapterModal({ isOpen: false, moduleId: '' });
      success('Chapter Added', `Created "${created.title}"`);
    } catch (err: any) {
      error('Error creating chapter', err?.message);
    }
  };

  // Delete Chapter
  const handleDeleteChapter = async (moduleId: string, chapterId: string) => {
    if (!window.confirm('Delete this chapter?')) return;
    try {
      await freeCourseContentApi.deleteChapter(course.id, moduleId, chapterId);
      setModules((prev) =>
        prev.map((m) => {
          if (m.id === moduleId) {
            return { ...m, chapters: m.chapters.filter((c) => c.id !== chapterId) };
          }
          return m;
        })
      );
      info('Chapter Deleted');
    } catch (err: any) {
      error('Error deleting chapter', err?.message);
    }
  };

  // Add Lesson
  const handleCreateLesson = async () => {
    if (!lessonForm.title.trim()) return;
    try {
      const created = await freeCourseContentApi.createLesson(
        course.id,
        addLessonModal.moduleId,
        addLessonModal.chapterId,
        {
          title: lessonForm.title.trim(),
          duration: lessonForm.duration,
          contentType: lessonForm.contentType,
          videoUrl: lessonForm.videoUrl,
          description: lessonForm.description,
          isFreePreview: true,
        }
      );
      setModules((prev) =>
        prev.map((m) => {
          if (m.id === addLessonModal.moduleId) {
            return {
              ...m,
              chapters: m.chapters.map((c) => {
                if (c.id === addLessonModal.chapterId) {
                  return { ...c, lessons: [...c.lessons, created] };
                }
                return c;
              }),
            };
          }
          return m;
        })
      );
      setLessonForm({
        title: '',
        duration: '35 mins',
        contentType: 'youtube_recorded',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: '',
      });
      setAddLessonModal({ isOpen: false, moduleId: '', chapterId: '' });
      success('Lesson Created', `Added "${created.title}" to curriculum.`);
    } catch (err: any) {
      error('Error creating lesson', err?.message);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (moduleId: string, chapterId: string, lessonId: string) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await freeCourseContentApi.deleteLesson(course.id, moduleId, chapterId, lessonId);
      setModules((prev) =>
        prev.map((m) => {
          if (m.id === moduleId) {
            return {
              ...m,
              chapters: m.chapters.map((c) => {
                if (c.id === chapterId) {
                  return { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) };
                }
                return c;
              }),
            };
          }
          return m;
        })
      );
      info('Lesson Deleted');
    } catch (err: any) {
      error('Error deleting lesson', err?.message);
    }
  };

  // Add Resource (Create)
  const handleCreateResource = async () => {
    if (!resourceForm.title.trim()) {
      error('Title Required', 'Please enter a resource title or select a document.');
      return;
    }
    try {
      const created = await freeCourseContentApi.addResource(
        course.id,
        addResourceModal.moduleId,
        addResourceModal.chapterId,
        addResourceModal.lessonId,
        {
          title: resourceForm.title.trim(),
          type: resourceForm.type,
          url: resourceForm.url,
          fileSize: resourceForm.fileSize || '1.5 MB',
          fileName: resourceForm.fileName,
          fileData: resourceForm.fileData,
          downloadable: resourceForm.downloadable,
          uploadedAt: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        }
      );
      setModules((prev) =>
        prev.map((m) => {
          if (m.id === addResourceModal.moduleId) {
            return {
              ...m,
              chapters: m.chapters.map((c) => {
                if (c.id === addResourceModal.chapterId) {
                  return {
                    ...c,
                    lessons: c.lessons.map((l) => {
                      if (l.id === addResourceModal.lessonId) {
                        return { ...l, resources: [...(l.resources || []), created] };
                      }
                      return l;
                    }),
                  };
                }
                return c;
              }),
            };
          }
          return m;
        })
      );
      setResourceForm(initialResourceForm);
      setAddResourceModal({ isOpen: false, moduleId: '', chapterId: '', lessonId: '' });
      success('Resource Attached', `Successfully added "${created.title}"`);
    } catch (err: any) {
      error('Error adding resource', err?.message);
    }
  };

  // Open Edit Resource Modal (Update)
  const handleOpenEditResource = (
    moduleId: string,
    chapterId: string,
    lessonId: string,
    resource: ResourceItem
  ) => {
    setEditResourceForm({
      title: resource.title,
      type: resource.type,
      url: resource.url || '',
      fileSize: resource.fileSize || '',
      fileName: resource.fileName || '',
      fileData: resource.fileData || '',
      downloadable: resource.downloadable ?? true,
    });
    setEditResourceModal({
      isOpen: true,
      moduleId,
      chapterId,
      lessonId,
      resource,
    });
  };

  // Save Updated Resource
  const handleUpdateResource = async () => {
    if (!editResourceModal.resource || !editResourceForm.title.trim()) {
      error('Title Required', 'Please enter a title for the resource.');
      return;
    }
    try {
      const updated = await freeCourseContentApi.updateResource(
        course.id,
        editResourceModal.moduleId,
        editResourceModal.chapterId,
        editResourceModal.lessonId,
        editResourceModal.resource.id,
        {
          title: editResourceForm.title.trim(),
          type: editResourceForm.type,
          url: editResourceForm.url,
          fileSize: editResourceForm.fileSize || editResourceModal.resource.fileSize,
          fileName: editResourceForm.fileName || editResourceModal.resource.fileName,
          fileData: editResourceForm.fileData || editResourceModal.resource.fileData,
          downloadable: editResourceForm.downloadable,
        }
      );

      setModules((prev) =>
        prev.map((m) => {
          if (m.id === editResourceModal.moduleId) {
            return {
              ...m,
              chapters: m.chapters.map((c) => {
                if (c.id === editResourceModal.chapterId) {
                  return {
                    ...c,
                    lessons: c.lessons.map((l) => {
                      if (l.id === editResourceModal.lessonId) {
                        return {
                          ...l,
                          resources: (l.resources || []).map((r) =>
                            r.id === updated.id ? updated : r
                          ),
                        };
                      }
                      return l;
                    }),
                  };
                }
                return c;
              }),
            };
          }
          return m;
        })
      );
      setEditResourceModal({
        isOpen: false,
        moduleId: '',
        chapterId: '',
        lessonId: '',
        resource: null,
      });
      success('Resource Updated', `Changes saved for "${updated.title}"`);
    } catch (err: any) {
      error('Error updating resource', err?.message);
    }
  };

  // Delete Resource
  const handleDeleteResource = async (
    moduleId: string,
    chapterId: string,
    lessonId: string,
    resourceId: string
  ) => {
    if (!window.confirm('Are you sure you want to remove this study resource?')) return;
    try {
      await freeCourseContentApi.deleteResource(course.id, moduleId, chapterId, lessonId, resourceId);
      setModules((prev) =>
        prev.map((m) => {
          if (m.id === moduleId) {
            return {
              ...m,
              chapters: m.chapters.map((c) => {
                if (c.id === chapterId) {
                  return {
                    ...c,
                    lessons: c.lessons.map((l) => {
                      if (l.id === lessonId) {
                        return { ...l, resources: l.resources.filter((r) => r.id !== resourceId) };
                      }
                      return l;
                    }),
                  };
                }
                return c;
              }),
            };
          }
          return m;
        })
      );
      info('Resource Removed', 'Study resource deleted from lesson.');
    } catch (err: any) {
      error('Error deleting resource', err?.message);
    }
  };

  // Download / Open Resource
  const handleDownloadResource = (resource: ResourceItem) => {
    if (resource.fileData) {
      const a = document.createElement('a');
      a.href = resource.fileData;
      a.download = resource.fileName || `${resource.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      success('Download Started', `Downloading ${a.download}`);
    } else if (resource.url) {
      window.open(resource.url, '_blank');
    } else {
      // Generate a mock downloadable text/pdf note
      const blob = new Blob(
        [
          `Course: ${course.title}\nResource: ${resource.title}\nType: ${resource.type}\nStatus: 100% Free Open Educational Resource\nDate: ${new Date().toLocaleDateString()}`
        ],
        { type: 'text/plain' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resource.title.replace(/\s+/g, '_')}_Study_Notes.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      success('Download Started', `Downloaded study note`);
    }
  };

  const getContentTypeIcon = (type: ContentResourceType) => {
    switch (type) {
      case 'youtube_live':
        return <Radio className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
      case 'youtube_recorded':
        return <Video className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'notes':
        return <FileDown className="w-4 h-4 text-[#16A34A] dark:text-emerald-400" />;
      case 'question_set':
        return <FileQuestion className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <LinkIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#12141C] dark:text-white">Course Curriculum & Resources</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E7F7ED] text-[#16A34A] dark:bg-emerald-500/20 dark:text-emerald-400">
              Free Access
            </span>
          </div>
          <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-0.5">
            Organize modules, chapters, YouTube lessons, notes, and study material for {course.targetClass}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setAddModuleOpen(true)}
            icon={<FolderPlus className="w-4 h-4" />}
          >
            Add New Module
          </Button>
          {onClose && (
            <Button size="sm" variant="secondary" onClick={onClose}>
              Back to Table
            </Button>
          )}
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="p-8 text-center bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-2xl border border-dashed border-[#E6E8EE] dark:border-[#334155]">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No modules created yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Get started by adding the first educational module for this free course.
            </p>
            <Button size="sm" variant="primary" onClick={() => setAddModuleOpen(true)}>
              + Add First Module
            </Button>
          </div>
        ) : (
          modules.map((module, modIdx) => {
            const isModOpen = expandedModules[module.id] ?? true;

            return (
              <div
                key={module.id}
                className="rounded-2xl border border-[#E6E8EE] dark:border-[#334155] bg-white dark:bg-[#1E293B] overflow-hidden shadow-lg transition-all"
              >
                {/* Module Bar */}
                <div className="p-4 bg-slate-50 dark:bg-[#1E293B] flex items-center justify-between border-b border-[#E6E8EE] dark:border-[#334155]">
                  <div
                    className="flex items-center gap-3 cursor-pointer select-none flex-1"
                    onClick={() => toggleModule(module.id)}
                  >
                    <button className="text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white">
                      {isModOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2451D9] dark:text-blue-400 uppercase tracking-wider">
                          Module {modIdx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-[#12141C] dark:text-white">{module.title}</h4>
                      </div>
                      {module.description && (
                        <p className="text-[11px] text-[#686E7D] dark:text-slate-400 mt-0.5">{module.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setAddChapterModal({ isOpen: true, moduleId: module.id })}
                      icon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Chapter
                    </Button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="p-1.5 text-[#686E7D] dark:text-slate-400 hover:text-[#DC5B3E] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Chapters within Module */}
                {isModOpen && (
                  <div className="p-4 space-y-3 bg-[#F6F7FA]/60 dark:bg-[#0B0F19]/60">
                    {module.chapters.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-[#E6E8EE] dark:border-[#334155] rounded-xl">
                        No chapters in this module. Click "Add Chapter" above.
                      </div>
                    ) : (
                      module.chapters.map((chapter) => {
                        const isChapOpen = expandedChapters[chapter.id] ?? true;

                        return (
                          <div
                            key={chapter.id}
                            className="rounded-xl border border-[#E6E8EE] dark:border-[#334155] bg-white dark:bg-[#1E293B] overflow-hidden"
                          >
                            {/* Chapter Header */}
                            <div className="p-3 bg-slate-50 dark:bg-[#0B0F19]/40 flex items-center justify-between border-b border-[#E6E8EE] dark:border-[#334155]">
                              <div
                                className="flex items-center gap-2.5 cursor-pointer select-none flex-1"
                                onClick={() => toggleChapter(chapter.id)}
                              >
                                <button className="text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white">
                                  {isChapOpen ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-200">
                                  {chapter.title}
                                </span>
                                <span className="text-[10px] text-[#686E7D] dark:text-slate-400 font-mono">
                                  ({chapter.lessons.length} lessons)
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="xs"
                                  variant="secondary"
                                  onClick={() =>
                                    setAddLessonModal({
                                      isOpen: true,
                                      moduleId: module.id,
                                      chapterId: chapter.id,
                                    })
                                  }
                                  icon={<Plus className="w-3 h-3" />}
                                >
                                  Add Lesson
                                </Button>
                                <button
                                  onClick={() => handleDeleteChapter(module.id, chapter.id)}
                                  className="p-1 text-[#686E7D] dark:text-slate-400 hover:text-[#DC5B3E] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                                  title="Delete Chapter"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Lessons List */}
                            {isChapOpen && (
                              <div className="p-3 space-y-2">
                                {chapter.lessons.length === 0 ? (
                                  <p className="text-xs text-slate-500 text-center py-2">
                                    No lessons added.
                                  </p>
                                ) : (
                                  chapter.lessons.map((lesson) => (
                                    <div
                                      key={lesson.id}
                                      className="p-3 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-lg border border-[#E6E8EE] dark:border-[#334155] flex flex-col gap-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                                    >
                                      {/* Lesson Info */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                          {getContentTypeIcon(lesson.contentType)}
                                          <div>
                                            <span className="text-xs font-semibold text-[#12141C] dark:text-white">
                                              {lesson.title}
                                            </span>
                                            <div className="flex items-center gap-2 text-[10px] text-[#686E7D] dark:text-slate-400 mt-0.5">
                                              <span>{lesson.duration}</span>
                                              <span>•</span>
                                              <span className="capitalize">
                                                {lesson.contentType.replace('_', ' ')}
                                              </span>
                                              <span>•</span>
                                              <span className="text-[#16A34A] dark:text-emerald-400 font-bold">
                                                100% Free
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Button
                                            size="xs"
                                            variant="outline"
                                            onClick={() =>
                                              setAddResourceModal({
                                                isOpen: true,
                                                moduleId: module.id,
                                                chapterId: chapter.id,
                                                lessonId: lesson.id,
                                              })
                                            }
                                            icon={<Plus className="w-3 h-3" />}
                                          >
                                            Attach Resource
                                          </Button>
                                          <button
                                            onClick={() =>
                                              handleDeleteLesson(
                                                module.id,
                                                chapter.id,
                                                lesson.id
                                              )
                                            }
                                            className="p-1 text-[#686E7D] dark:text-slate-400 hover:text-[#DC5B3E] dark:hover:text-rose-400 transition-colors cursor-pointer"
                                            title="Delete Lesson"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Attached Resources */}
                                      {lesson.resources && lesson.resources.length > 0 && (
                                        <div className="pl-6 pt-1 flex flex-wrap gap-2">
                                          {lesson.resources.map((res) => (
                                            <div
                                              key={res.id}
                                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF0FE] dark:bg-[#131e3b] border border-blue-200 dark:border-blue-500/20 text-[11px] text-slate-600 dark:text-slate-300"
                                            >
                                              {getContentTypeIcon(res.type)}
                                              <span className="font-medium text-slate-700 dark:text-slate-200">
                                                {res.title}
                                              </span>
                                              {res.fileSize && (
                                                <span className="text-[10px] text-[#686E7D] dark:text-slate-400">
                                                  ({res.fileSize})
                                                </span>
                                              )}
                                              <button
                                                onClick={() => setPreviewResource(res)}
                                                className="text-[#686E7D] dark:text-slate-400 hover:text-[#2451D9] dark:hover:text-blue-400 ml-1 cursor-pointer transition-colors"
                                                title="Preview / View Resource"
                                              >
                                                <Eye className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleOpenEditResource(
                                                    module.id,
                                                    chapter.id,
                                                    lesson.id,
                                                    res
                                                  )
                                                }
                                                className="text-[#686E7D] dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 ml-0.5 cursor-pointer transition-colors"
                                                title="Edit / Update Resource"
                                              >
                                                <Edit3 className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleDeleteResource(
                                                    module.id,
                                                    chapter.id,
                                                    lesson.id,
                                                    res.id
                                                  )
                                                }
                                                className="text-[#686E7D] dark:text-slate-400 hover:text-[#DC5B3E] dark:hover:text-rose-400 ml-0.5 cursor-pointer transition-colors"
                                                title="Remove Resource"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Module Modal */}
      <Modal
        isOpen={addModuleOpen}
        onClose={() => setAddModuleOpen(false)}
        title="Add Course Module"
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddModuleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateModule}>
              Create Module
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Module Title"
            requiredBadge
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="e.g. Module 1: Chemical Reactions & Equations"
          />
          <Input
            label="Description / Roadmap (Optional)"
            value={newModuleDesc}
            onChange={(e) => setNewModuleDesc(e.target.value)}
            placeholder="e.g. Core concepts of oxidation, reduction, and stoichiometry..."
          />
        </div>
      </Modal>

      {/* Add Chapter Modal */}
      <Modal
        isOpen={addChapterModal.isOpen}
        onClose={() => setAddChapterModal({ isOpen: false, moduleId: '' })}
        title="Add Chapter to Module"
        maxWidth="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setAddChapterModal({ isOpen: false, moduleId: '' })}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateChapter}>
              Add Chapter
            </Button>
          </>
        }
      >
        <Input
          label="Chapter Title"
          requiredBadge
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
          placeholder="e.g. Chapter 1: Types of Chemical Reactions"
        />
      </Modal>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={addLessonModal.isOpen}
        onClose={() => setAddLessonModal({ isOpen: false, moduleId: '', chapterId: '' })}
        title="Add Lesson to Chapter"
        maxWidth="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setAddLessonModal({ isOpen: false, moduleId: '', chapterId: '' })}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateLesson}>
              Save Lesson
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Lesson Title"
            requiredBadge
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            placeholder="e.g. Exothermic vs Endothermic Reactions with Experiments"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Content Type"
              value={lessonForm.contentType}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, contentType: e.target.value as ContentResourceType })
              }
              options={[
                { value: 'youtube_live', label: 'YouTube Live Class' },
                { value: 'youtube_recorded', label: 'YouTube Recorded Lecture' },
                { value: 'pdf', label: 'PDF Reading Material' },
                { value: 'notes', label: 'Interactive Study Notes' },
                { value: 'question_set', label: 'Practice Question Set' },
              ]}
            />
            <Input
              label="Duration"
              value={lessonForm.duration}
              onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
              placeholder="e.g. 45 mins"
            />
          </div>

          <Input
            label="YouTube Video Link / URL"
            value={lessonForm.videoUrl}
            onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
      </Modal>

      {/* Add Resource Modal (Create) */}
      <Modal
        isOpen={addResourceModal.isOpen}
        onClose={() => {
          setAddResourceModal({ isOpen: false, moduleId: '', chapterId: '', lessonId: '' });
          setResourceForm(initialResourceForm);
        }}
        title="Attach Study Resource / Note / PDF"
        maxWidth="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setAddResourceModal({ isOpen: false, moduleId: '', chapterId: '', lessonId: '' });
                setResourceForm(initialResourceForm);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateResource}
              disabled={!resourceForm.title.trim()}
              icon={<Plus className="w-4 h-4" />}
            >
              Attach Resource
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file, false);
            }}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
            className="hidden"
          />

          {/* Interactive File Dropzone / Upload Box */}
          {resourceForm.fileName ? (
            <div className="p-3.5 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-blue-300 dark:border-blue-500/40 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#E7F7ED] border border-emerald-200 dark:bg-emerald-500/15 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5 text-[#16A34A] dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#12141C] dark:text-white truncate">{resourceForm.fileName}</p>
                  <p className="text-[10px] text-[#686E7D] dark:text-slate-400 mt-0.5">
                    {resourceForm.fileSize || 'Standard'} • Attached from your device
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-[#EAF0FE] hover:bg-blue-100 text-[#2451D9] border border-blue-200 dark:bg-blue-600/30 dark:hover:bg-blue-600/50 dark:text-blue-200 dark:border-blue-500/40 text-[11px] font-semibold cursor-pointer transition-colors"
                >
                  Replace File
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setResourceForm((prev) => ({
                      ...prev,
                      fileName: '',
                      fileData: '',
                      fileSize: '',
                    }))
                  }
                  className="p-1 rounded-lg bg-[#FCEAE4] hover:bg-rose-100 text-[#DC5B3E] dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:text-rose-300 cursor-pointer transition-colors"
                  title="Remove File"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileSelect(file, false);
              }}
              className={`p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center group ${
                isDragging
                  ? 'border-blue-500 bg-[#EAF0FE] dark:bg-blue-500/15 ring-2 ring-blue-500/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-[#F6F7FA] dark:bg-[#0B0F19]'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#EAF0FE] border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-[#2451D9] dark:text-blue-400" />
              </div>
              <p className="text-xs font-bold text-[#12141C] dark:text-white group-hover:text-[#2451D9] dark:group-hover:text-blue-300 transition-colors">
                Click or drag & drop PDF, Word Doc, or PPT to upload
              </p>
              <p className="text-[11px] text-[#686E7D] dark:text-slate-400 mt-0.5">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT (up to 25MB)
              </p>
            </div>
          )}

          {/* Quick Presets / Templates */}
          <div>
            <span className="text-[11px] text-[#686E7D] dark:text-slate-400 font-semibold block mb-1">
              Or pick a sample template:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {[
                {
                  title: 'States of Matter Hand-written Notes (PDF)',
                  type: 'pdf' as ContentResourceType,
                  fileSize: '3.4 MB',
                  fileName: 'States_of_Matter_NCERT_Notes.pdf',
                },
                {
                  title: 'Daily Practice Sheet (DPS #1)',
                  type: 'question_set' as ContentResourceType,
                  fileSize: '1.2 MB',
                  fileName: 'DPS_01_Practice_Questions.pdf',
                },
                {
                  title: 'Latent Heat Formula Mindmap',
                  type: 'notes' as ContentResourceType,
                  fileSize: '850 KB',
                  fileName: 'Latent_Heat_Mindmap.docx',
                },
                {
                  title: 'CBSE Board Sample Question Bank',
                  type: 'study_material' as ContentResourceType,
                  fileSize: '2.1 MB',
                  fileName: 'CBSE_Sample_Questions.pdf',
                },
              ].map((tmpl) => (
                <button
                  type="button"
                  key={tmpl.title}
                  onClick={() =>
                    setResourceForm((prev) => ({
                      ...prev,
                      title: tmpl.title,
                      type: tmpl.type,
                      fileSize: tmpl.fileSize,
                      fileName: tmpl.fileName,
                    }))
                  }
                  className="px-2.5 py-1 rounded-lg border border-[#E6E8EE] bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#12141C] dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white text-[11px] shrink-0 cursor-pointer transition-colors"
                >
                  {tmpl.title.split('(')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 pt-1">
            <Input
              label="Resource Title"
              requiredBadge
              value={resourceForm.title}
              onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
              placeholder="e.g. Chapter Formula Sheet & Mindmap"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Resource Type"
                value={resourceForm.type}
                onChange={(e) =>
                  setResourceForm({ ...resourceForm, type: e.target.value as ContentResourceType })
                }
                options={[
                  { value: 'pdf', label: 'PDF Document' },
                  { value: 'notes', label: 'Revision Notes' },
                  { value: 'study_material', label: 'Study Material / Doc' },
                  { value: 'question_set', label: 'DPS / Question Bank' },
                  { value: 'external_link', label: 'External Resource Link' },
                ]}
              />
              <Input
                label="File Size"
                value={resourceForm.fileSize}
                onChange={(e) => setResourceForm({ ...resourceForm, fileSize: e.target.value })}
                placeholder="e.g. 2.4 MB"
              />
            </div>

            <Input
              label="External Web / Cloud Link (Optional)"
              value={resourceForm.url}
              onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
              placeholder="https://drive.google.com/... or https://..."
            />

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7FA] dark:bg-[#0B0F19] border border-[#E6E8EE] dark:border-[#334155]">
              <div>
                <span className="text-xs font-semibold text-[#12141C] dark:text-white">Student Download Access</span>
                <p className="text-[11px] text-[#686E7D] dark:text-slate-400">
                  Allow enrolled free students to download this file offline.
                </p>
              </div>
              <input
                type="checkbox"
                checked={resourceForm.downloadable}
                onChange={(e) =>
                  setResourceForm({ ...resourceForm, downloadable: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Resource Modal (Update) */}
      <Modal
        isOpen={editResourceModal.isOpen}
        onClose={() => {
          setEditResourceModal({
            isOpen: false,
            moduleId: '',
            chapterId: '',
            lessonId: '',
            resource: null,
          });
          setEditResourceForm(initialResourceForm);
        }}
        title="Edit Study Resource / Note / PDF"
        maxWidth="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setEditResourceModal({
                  isOpen: false,
                  moduleId: '',
                  chapterId: '',
                  lessonId: '',
                  resource: null,
                });
                setEditResourceForm(initialResourceForm);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateResource}
              disabled={!editResourceForm.title.trim()}
              icon={<Check className="w-4 h-4" />}
            >
              Update Resource
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          {/* Hidden File Input for Edit */}
          <input
            type="file"
            ref={editFileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file, true);
            }}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
            className="hidden"
          />

          {/* Current / Uploaded File Display */}
          <div className="p-3.5 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-blue-300 dark:border-blue-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#EAF0FE] border border-blue-200 dark:bg-blue-500/15 dark:border-blue-500/30 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5 text-[#16A34A] dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#12141C] dark:text-white truncate">
                  {editResourceForm.fileName || `${editResourceForm.title}.pdf`}
                </p>
                <p className="text-[10px] text-[#686E7D] dark:text-slate-400 mt-0.5">
                  {editResourceForm.fileSize || 'Standard Size'} • Current Attached File
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => editFileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-[#EAF0FE] hover:bg-blue-100 text-[#2451D9] border border-blue-200 dark:bg-blue-600/30 dark:hover:bg-blue-600/50 dark:text-blue-200 dark:border-blue-500/40 text-[11px] font-semibold cursor-pointer transition-colors"
            >
              Upload / Replace File
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <Input
              label="Resource Title"
              requiredBadge
              value={editResourceForm.title}
              onChange={(e) =>
                setEditResourceForm({ ...editResourceForm, title: e.target.value })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Resource Type"
                value={editResourceForm.type}
                onChange={(e) =>
                  setEditResourceForm({
                    ...editResourceForm,
                    type: e.target.value as ContentResourceType,
                  })
                }
                options={[
                  { value: 'pdf', label: 'PDF Document' },
                  { value: 'notes', label: 'Revision Notes' },
                  { value: 'study_material', label: 'Study Material / Doc' },
                  { value: 'question_set', label: 'DPS / Question Bank' },
                  { value: 'external_link', label: 'External Resource Link' },
                ]}
              />
              <Input
                label="File Size"
                value={editResourceForm.fileSize}
                onChange={(e) =>
                  setEditResourceForm({ ...editResourceForm, fileSize: e.target.value })
                }
              />
            </div>

            <Input
              label="External Web / Cloud Link (Optional)"
              value={editResourceForm.url}
              onChange={(e) => setEditResourceForm({ ...editResourceForm, url: e.target.value })}
              placeholder="https://drive.google.com/..."
            />

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7FA] dark:bg-[#0B0F19] border border-[#E6E8EE] dark:border-[#334155]">
              <div>
                <span className="text-xs font-semibold text-[#12141C] dark:text-white">Student Download Access</span>
                <p className="text-[11px] text-[#686E7D] dark:text-slate-400">
                  Allow enrolled students to download this file offline.
                </p>
              </div>
              <input
                type="checkbox"
                checked={editResourceForm.downloadable}
                onChange={(e) =>
                  setEditResourceForm({ ...editResourceForm, downloadable: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Resource Preview Modal (Read & Download) */}
      <Modal
        isOpen={!!previewResource}
        onClose={() => setPreviewResource(null)}
        title={previewResource?.title || 'Resource Viewer'}
        maxWidth="lg"
        footer={
          <div className="flex justify-between w-full items-center">
            <span className="text-xs text-[#16A34A] dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Free Open Educational Resource
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => setPreviewResource(null)}>
                Close
              </Button>
              {previewResource && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleDownloadResource(previewResource)}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download File
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="p-5 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF0FE] border border-blue-200 text-[#2451D9] dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
            {previewResource && getContentTypeIcon(previewResource.type)}
          </div>
          <div>
            <h4 className="text-base font-bold text-[#12141C] dark:text-white">{previewResource?.title}</h4>
            <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-1">
              Format:{' '}
              <span className="uppercase text-[#2451D9] dark:text-blue-400 font-semibold">
                {previewResource?.type}
              </span>{' '}
              • Size: {previewResource?.fileSize || 'Standard'} • Free Student Access
            </p>
          </div>

          {/* Interactive Document Preview Box */}
          <div className="p-4 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] text-left space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#E6E8EE] dark:border-[#334155] pb-2">
              <span className="text-[11px] font-bold text-[#686E7D] dark:text-slate-400 uppercase tracking-wider">
                Document Details
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#E7F7ED] text-[#16A34A] dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold">
                Verified
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Attached File:</span>
                <span className="text-slate-700 dark:text-slate-200 font-mono text-[11px]">
                  {previewResource?.fileName || `${previewResource?.title}.pdf`}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Course:</span>
                <span className="text-slate-700 dark:text-slate-200 text-[11px] truncate block">
                  {course.title}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#EAF0FE] dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-500/20 text-xs flex items-center justify-between">
            <span className="text-[11px] text-[#686E7D] dark:text-slate-400">
              Students can view and download this resource directly inside the free course player.
            </span>
            {previewResource && (
              <button
                type="button"
                onClick={() => handleDownloadResource(previewResource)}
                className="text-xs text-[#2451D9] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold underline cursor-pointer shrink-0 ml-3"
              >
                Click to Download
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};