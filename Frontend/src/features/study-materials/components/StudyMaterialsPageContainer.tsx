import React, { useState, useEffect } from 'react';
import { Plus, RotateCcw, GraduationCap, type LucideIcon } from 'lucide-react';
import { useStudyMaterials } from '../hooks/useStudyMaterials';
import type { MaterialFormData, MaterialType, StudyMaterialItem } from '../types';
import { StudyMaterialsStatsCards } from './StudyMaterialsStatsCards';
import { StudyMaterialsFilterBar } from './StudyMaterialsFilterBar';
import { StudyMaterialsTable } from './StudyMaterialsTable';
import { StudyMaterialsGridView } from './StudyMaterialsGridView';
import { StudyMaterialFormPage } from './StudyMaterialFormPage';
import { StudentPreviewModal } from './StudentPreviewModal';
import { FilePreviewModal } from './FilePreviewModal';
import { FileUploadModal } from './FileUploadModal';
import { ReorderModal } from './ReorderModal';
import { ConfirmDialog } from './ConfirmDialog';
import { BulkActionsBar } from './BulkActionsBar';
import { DifficultyModal } from './DifficultyModal';

interface PageContainerProps {
  title: string;
  subtitle: string;
  materialType: MaterialType | 'all';
  icon: LucideIcon;
  badgeText?: string;
  addButtonLabel?: string;
}

const CATEGORY_LABELS: Partial<Record<MaterialType, string>> = {
  notes: 'Notes',
  'practice-questions': 'Practice Questions',
  'formula-sheets': 'Formula Sheets',
  mcq: 'MCQ',
  'important-questions': 'Important Questions',
  'sample-papers': 'Sample Papers',
  'test-series': 'Test Series',
  'question-bank': 'Question Bank',
};

export const StudyMaterialsPageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  materialType,
  icon: Icon,
  badgeText,
  addButtonLabel = 'Add New Material',
}) => {
  const {
    filteredItems,
    items,
    selectedIds,
    filters,
    setFilters,
    availableSubjects,
    availableGrades,
    stats,
    activeFiltersSummary,
    toastMessage,
    createItem,
    updateItem,
    deleteItem,
    bulkDelete,
    togglePublish,
    toggleArchive,
    bulkPublish,
    bulkUnpublish,
    bulkArchive,
    bulkRestore,
    replaceFile,
    reorderItems,
    resetAllData,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useStudyMaterials({ fixedType: materialType === 'all' ? undefined : materialType });

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [isFormViewOpen, setIsFormViewOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudyMaterialItem | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewingItem, setPreviewingItem] = useState<StudyMaterialItem | null>(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadingItem, setUploadingItem] = useState<StudyMaterialItem | null>(null);

  const [difficultyModalOpen, setDifficultyModalOpen] = useState(false);
  const [difficultyItem, setDifficultyItem] = useState<StudyMaterialItem | null>(null);
  const [targetDifficulty, setTargetDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  const [reorderModalOpen, setReorderModalOpen] = useState(false);
  const [studentPreviewOpen, setStudentPreviewOpen] = useState(false);

  // Listen for global header student preview trigger
  useEffect(() => {
    const handleOpen = () => setStudentPreviewOpen(true);
    window.addEventListener('open-student-preview', handleOpen);
    return () => window.removeEventListener('open-student-preview', handleOpen);
  }, []);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  });

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormViewOpen(true);
  };

  const handleEdit = (item: StudyMaterialItem) => {
    setEditingItem(item);
    setIsFormViewOpen(true);
  };

  const handlePreview = (item: StudyMaterialItem) => {
    setPreviewingItem(item);
    setPreviewModalOpen(true);
  };

  const handleReplaceFile = (item: StudyMaterialItem) => {
    setUploadingItem(item);
    setUploadModalOpen(true);
  };

  const handleRequestChangeDifficulty = (item: StudyMaterialItem, target: 'Easy' | 'Medium' | 'Hard') => {
    setDifficultyItem(item);
    setTargetDifficulty(target);
    setDifficultyModalOpen(true);
  };

  const handleUpdateDifficulty = (id: string, difficulty: 'Easy' | 'Medium' | 'Hard') => {
    updateItem(id, { difficulty });
  };

  const handleDeletePrompt = (item: StudyMaterialItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Study Material',
      message: `Are you sure you want to permanently delete "${item.title}"? Students will lose access immediately.`,
      isDestructive: true,
      action: () => deleteItem(item.id),
    });
  };

  const handleBulkDeletePrompt = () => {
    const count = selectedIds.size;
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${count} Selected Materials`,
      message: `Are you sure you want to permanently remove all ${count} selected items? This action cannot be reversed.`,
      isDestructive: true,
      action: () => bulkDelete(Array.from(selectedIds)),
    });
  };

  const handleFormSubmit = (data: MaterialFormData) => {
    if (editingItem) {
      updateItem(editingItem.id, data);
    } else {
      createItem(data);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      type: materialType === 'all' ? 'all' : materialType,
      subject: 'All',
      grade: 'All',
      status: 'all',
      difficulty: 'All',
      sortBy: 'order',
      sortOrder: 'asc',
      showArchived: false,
    });
  };

  // Toast is intentionally dark in both themes
  const toast = toastMessage && (
    <div className="fixed top-5 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
      <div
        className={`px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border ${
          toastMessage.type === 'success'
            ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700'
            : toastMessage.type === 'error'
            ? 'bg-rose-900/90 text-rose-100 border-rose-700'
            : 'bg-slate-900/90 text-slate-100 border-slate-700'
        }`}
      >
        <span>{toastMessage.text}</span>
      </div>
    </div>
  );

  if (isFormViewOpen) {
    return (
      <div className="space-y-6 pb-20">
        {toast}

        <StudyMaterialFormPage
          initialData={editingItem}
          defaultType={materialType === 'all' ? 'notes' : materialType}
          categoryTitle={title}
          onSave={(data, keepOpen) => {
            handleFormSubmit(data);
            if (!keepOpen) {
              setIsFormViewOpen(false);
              setEditingItem(null);
            }
          }}
          onCancel={() => {
            setIsFormViewOpen(false);
            setEditingItem(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {toast}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-2xl p-6 shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 dark:bg-[#2451D9]/20 dark:text-[#60A5FA] rounded-xl border border-blue-100 dark:border-[#2451D9]/40">
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-gray-100">{title}</h1>
              {badgeText && (
                <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-[#2451D9]/20 dark:text-[#60A5FA]">
                  {badgeText}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-2xl">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setStudentPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Preview student-facing catalog and interactive reader"
          >
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
            <span>Student Preview</span>
          </button>

          <button
            onClick={resetAllData}
            className="p-2.5 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-[#334155] transition-colors cursor-pointer"
            title="Reset data to default seeds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{addButtonLabel}</span>
          </button>
        </div>
      </div>

      <StudyMaterialsStatsCards stats={stats} categoryTitle={title} filterSummary={activeFiltersSummary} />

      <StudyMaterialsFilterBar
        filters={filters}
        onFilterChange={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
        onResetFilters={handleResetFilters}
        availableSubjects={availableSubjects}
        availableGrades={availableGrades}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenReorder={() => setReorderModalOpen(true)}
        totalFiltered={filteredItems.length}
        activeCategoryLabel={
          materialType !== 'all' ? CATEGORY_LABELS[materialType] ?? materialType : undefined
        }
      />

      {viewMode === 'table' ? (
        <StudyMaterialsTable
          items={filteredItems}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onRequestChangeDifficulty={handleRequestChangeDifficulty}
          onReplaceFile={handleReplaceFile}
          onTogglePublish={togglePublish}
          onToggleArchive={toggleArchive}
          onDelete={handleDeletePrompt}
          onAddNew={handleAddNew}
        />
      ) : (
        <StudyMaterialsGridView
          items={filteredItems}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onRequestChangeDifficulty={handleRequestChangeDifficulty}
          onReplaceFile={handleReplaceFile}
          onTogglePublish={togglePublish}
          onToggleArchive={toggleArchive}
          onDelete={handleDeletePrompt}
        />
      )}

      <BulkActionsBar
        selectedCount={selectedIds.size}
        onPublish={() => bulkPublish(Array.from(selectedIds))}
        onUnpublish={() => bulkUnpublish(Array.from(selectedIds))}
        onArchive={() => bulkArchive(Array.from(selectedIds))}
        onRestore={() => bulkRestore(Array.from(selectedIds))}
        onDelete={handleBulkDeletePrompt}
        onClear={clearSelection}
      />

      <DifficultyModal
        isOpen={difficultyModalOpen}
        onClose={() => setDifficultyModalOpen(false)}
        material={difficultyItem}
        targetDifficulty={targetDifficulty}
        onUpdateDifficulty={handleUpdateDifficulty}
      />

      <FilePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        material={previewingItem}
      />

      <FileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        material={uploadingItem}
        onReplaceFile={replaceFile}
      />

      <ReorderModal
        isOpen={reorderModalOpen}
        onClose={() => setReorderModalOpen(false)}
        items={materialType === 'all' ? items : items.filter((i) => i.type === materialType)}
        onSaveOrder={reorderItems}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.action}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      <StudentPreviewModal
        isOpen={studentPreviewOpen}
        onClose={() => setStudentPreviewOpen(false)}
        materials={items}
        defaultCategory={materialType}
      />
    </div>
  );
};