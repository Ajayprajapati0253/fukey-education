import React from 'react';
import { useAttendance } from '../hooks/useAttendance';
import { AttendanceKPICards } from '../components/AttendanceKPICards';
import { AttendanceFilterBar } from '../components/AttendanceFilterBar';
import { AttendanceTable } from '../components/AttendanceTable';
import { AttendanceDetailDrawer } from '../components/AttendanceDetailDrawer';
import { AttendanceSettingsModal } from '../components/AttendanceSettingsModal';
import { AttendanceEditModal } from '../components/AttendanceEditModal';
import { AttendanceDeleteConfirmModal } from '../components/AttendanceDeleteConfirmModal';
import { ExportReportModal } from '../components/ExportReportModal';
import {
  Download,
  Settings as SettingsIcon,
  PanelRightOpen
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const {
    records,
    paginatedRecords,
    kpiStats,
    selectedTeacher,
    selectedTeacherId,
    setSelectedTeacherId,
    isDrawerOpen,
    setIsDrawerOpen,
    activeFrequency,
    setActiveFrequency,
    currentMonth,
    handlePrevMonth,
    handleNextMonth,

    // Frequency-aware date navigation (Daily / Weekly / Monthly)
    periodLabel,
    selectedDateIso,
    handlePrevPeriod,
    handleNextPeriod,
    handleDateInputChange,
    monthlyGrid,
    weeklyGrid,

    // Calendar-grid day selection
    selectedGridDate,
    handleSelectGridDate,

    filters,
    handleFilterChange,
    handleResetFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    isSettingsOpen,
    setIsSettingsOpen,
    isExportOpen,
    setIsExportOpen,
    settings,
    handleSaveSettings,
    handleExport,
    isRulesExpanded,
    setIsRulesExpanded,
    loadData,

    // Edit / Delete Attendance
    isEditModalOpen,
    editModalData,
    handleGridCellClick,
    handleOpenEditForDailyRecord,
    handleOpenEditForSelectedTeacher,
    handleOpenEditForSession,
    closeEditModal,
    handleSaveEdit,
    handleRequestDeleteFromEditModal,

    isDeleteModalOpen,
    deleteModalData,
    handleOpenDeleteForSession,
    handleOpenDeleteForDailyRecord,
    closeDeleteModal,
    handleConfirmDelete,
  } = useAttendance();

  return (
    <main
      id="teacher-attendance-page"
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F6F7FA] dark:bg-[#0B0F19]"
    >
      {/* Breadcrumb & Top Page Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#12141C] dark:text-white tracking-tight">Teacher Attendance</h1>
          <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-0.5">
            Track teacher attendance based on live class participation and duration.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            id="export-report-btn"
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#E6E8EE] dark:border-[#22355b] bg-white dark:bg-[#0d162a] text-xs font-medium text-[#686E7D] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#131e38] transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
          <button
            id="attendance-settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#2451D9] hover:bg-[#1e43b8] text-xs font-semibold text-white shadow-lg shadow-[#2451D9]/30 transition"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            Attendance Settings
          </button>
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
        {/* Drawer reopen button if drawer was closed */}
        {!isDrawerOpen && (
          <button
            id="reopen-drawer-btn"
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#0d162a] border border-[#E6E8EE] dark:border-[#1b2b4d] rounded-lg text-xs text-[#2451D9] dark:text-blue-400 hover:text-[#1e43b8] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#152445] transition"
          >
            <PanelRightOpen className="w-3.5 h-3.5" />
            <span>Show Details</span>
          </button>
        )}
      </div>


      {/* Filter Panel */}
      <AttendanceFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onApplyFilter={loadData}
      />

      {/* KPI Stat Cards Row */}
      <AttendanceKPICards stats={kpiStats} />

      {/* Two Column Main Data Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Teacher Attendance Table */}
        <div className={isDrawerOpen ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <AttendanceTable
            records={paginatedRecords}
            totalRecordsCount={totalItems}
            currentPage={currentPage}
            totalPages={totalPages}
            selectedTeacherId={selectedTeacherId}
            onSelectTeacher={(id) => {
              setSelectedTeacherId(id);
              if (!isDrawerOpen) setIsDrawerOpen(true);
            }}
            onPageChange={setCurrentPage}
            activeFrequency={activeFrequency}
            onFrequencyChange={setActiveFrequency}
            periodLabel={periodLabel}
            selectedDateIso={selectedDateIso}
            onPrevPeriod={handlePrevPeriod}
            onNextPeriod={handleNextPeriod}
            onDateChange={handleDateInputChange}
            monthlyGrid={monthlyGrid}
            weeklyGrid={weeklyGrid}
            selectedGridDate={selectedGridDate}
            onSelectGridDate={handleSelectGridDate}
            onGridCellClick={handleGridCellClick}
            onEditRecord={handleOpenEditForDailyRecord}
            onDeleteRecord={handleOpenDeleteForDailyRecord}
          />
        </div>

        {/* Right Column: Teacher Attendance Details Drawer Panel */}
        {isDrawerOpen && (
          <div className="lg:col-span-4">
            <AttendanceDetailDrawer
              teacher={selectedTeacher}
              currentMonth={currentMonth}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onClose={() => setIsDrawerOpen(false)}
              isRulesExpanded={isRulesExpanded}
              onToggleRules={() => setIsRulesExpanded(!isRulesExpanded)}
              onEditAttendance={handleOpenEditForSelectedTeacher}
              onEditSession={handleOpenEditForSession}
              onDeleteSession={handleOpenDeleteForSession}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <AttendanceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
        recordCount={records.length}
      />

      <AttendanceEditModal
        isOpen={isEditModalOpen}
        modalData={editModalData}
        onClose={closeEditModal}
        onSave={handleSaveEdit}
        onRequestDelete={handleRequestDeleteFromEditModal}
      />

      <AttendanceDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        modalData={deleteModalData}
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
};