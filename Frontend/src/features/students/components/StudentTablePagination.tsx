import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StudentTablePaginationProps {
  currentPage: number;
  totalStudents: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const StudentTablePagination: React.FC<StudentTablePaginationProps> = ({
  currentPage,
  totalStudents,
  pageSize,
  onPageChange,
}) => {
  const startItem = totalStudents === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalStudents);
  const totalPages = Math.max(1, Math.ceil(totalStudents / pageSize));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-xs text-slate-400">
      <div>
        Showing <span className="text-slate-200 font-medium">{startItem} – {endItem}</span> of{' '}
        <span className="text-slate-200 font-medium">{totalStudents}</span> students
      </div>

      <div className="flex items-center gap-1.5 select-none">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg bg-[#0b1429] border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
              currentPage === pageNum
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/40'
                : 'bg-[#0b1429] border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg bg-[#0b1429] border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default StudentTablePagination;