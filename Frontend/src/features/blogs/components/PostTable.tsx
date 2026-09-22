import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Star, Edit, Eye, MoreVertical, Trash2, Copy,
  Sparkles, Check, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import type { Post, PostStatus } from '../types/post.types';

interface PostTableProps {
  posts: Post[];
  selectedPostIds: string[];
  onToggleSelectPost: (id: string) => void;
  onToggleSelectAll: () => void;
  onToggleHomepage: (id: string) => void;
  onTogglePopular: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  onEditPost: (post: Post) => void;
  onViewPost: (post: Post) => void;
  onDeletePost: (id: string) => void;
  onDuplicatePost: (post: Post) => void;
  onChangeStatus: (id: string, status: PostStatus) => void;
  onBulkStatusChange: (status: PostStatus) => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

const CATEGORY_VARIANT: Record<string, 'accent' | 'brand' | 'success' | 'warning' | 'neutral' | 'teal' | 'danger'> = {
  Technology: 'brand',
  Strategies: 'warning',
  Development: 'accent',
  Psychology: 'teal',
  Education: 'success',
  Involvement: 'accent',
  Evaluation: 'neutral',
  Health: 'danger',
};

const STATUS_VARIANT: Record<PostStatus, 'success' | 'warning' | 'brand' | 'neutral'> = {
  Published: 'success',
  Draft: 'warning',
  Scheduled: 'brand',
  Archived: 'neutral',
};

const LANGUAGE_FLAG: Record<string, string> = { HI: '🇮🇳', EN: '🇺🇸', ES: '🇪🇸', FR: '🇫🇷' };

export const PostTable: React.FC<PostTableProps> = ({
  posts, selectedPostIds, onToggleSelectPost, onToggleSelectAll,
  onToggleHomepage, onTogglePopular, onToggleFeatured, onEditPost, onViewPost,
  onDeletePost, onDuplicatePost, onChangeStatus, onBulkStatusChange, onBulkDelete, onBulkExport,
  currentPage, totalPages, totalResults, perPage, onPageChange,
}) => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAllSelected = posts.length > 0 && selectedPostIds.length === posts.length;
  const isPartiallySelected = selectedPostIds.length > 0 && selectedPostIds.length < posts.length;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const startItem = totalResults === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalResults);

  const renderPageButtons = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return pages.map((page, index) =>
      page === '...' ? (
        <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-slate-400 dark:text-gray-500 select-none">…</span>
      ) : (
        <button
          key={page}
          onClick={() => onPageChange(page as number)}
          className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
            currentPage === page
              ? 'bg-blue-600 text-white shadow-xs'
              : 'border border-transparent text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-gray-100'
          }`}
        >
          {page}
        </button>
      )
    );
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-[#334155] shadow-xs overflow-hidden flex flex-col">
      {selectedPostIds.length > 0 && (
        <div className="bg-blue-50/90 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-300">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">{selectedPostIds.length}</span>
            <span>{selectedPostIds.length} posts selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onBulkStatusChange('Published')} className="px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 rounded-md font-medium hover:bg-blue-100/60 dark:hover:bg-blue-500/20 transition-colors">Publish Selected</button>
            <button onClick={() => onBulkStatusChange('Draft')} className="px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-blue-200 dark:border-blue-500/30 text-slate-700 dark:text-gray-300 rounded-md font-medium hover:bg-blue-100/60 dark:hover:bg-blue-500/20 transition-colors">Set to Draft</button>
            <button onClick={() => onBulkStatusChange('Archived')} className="px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-blue-200 dark:border-blue-500/30 text-slate-700 dark:text-gray-300 rounded-md font-medium hover:bg-blue-100/60 dark:hover:bg-blue-500/20 transition-colors">Archive Selected</button>
            <button onClick={onBulkExport} className="px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-blue-200 dark:border-blue-500/30 text-slate-700 dark:text-gray-300 rounded-md font-medium hover:bg-blue-100/60 dark:hover:bg-blue-500/20 transition-colors">Export Selected</button>
            <button onClick={onBulkDelete} className="px-2.5 py-1 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors flex items-center gap-1"><Trash2 className="w-3 h-3" /><span>Delete</span></button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#334155] text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/40">
              <th className="py-3.5 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => { if (input) input.indeterminate = isPartiallySelected; }}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
              </th>
              <th className="py-3.5 px-2 font-bold w-12">SN</th>
              <th className="py-3.5 px-4 font-bold min-w-[320px]">Title</th>
              <th className="py-3.5 px-4 font-bold">Author</th>
              <th className="py-3.5 px-4 font-bold">Category</th>
              <th className="py-3.5 px-4 font-bold">Language</th>
              <th className="py-3.5 px-4 font-bold text-center">Show Homepage</th>
              <th className="py-3.5 px-4 font-bold text-center">Popular</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold">Published Date</th>
              <th className="py-3.5 px-4 font-bold text-right pr-6">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-[#334155] text-sm">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400 dark:text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">🔍</span>
                    <span className="font-semibold text-slate-600 dark:text-gray-300 text-base">No posts found</span>
                    <span className="text-xs text-slate-400 dark:text-gray-500">Try adjusting your search criteria or resetting filters</span>
                  </div>
                </td>
              </tr>
            ) : posts.map((post, index) => {
              const isSelected = selectedPostIds.includes(post.id);
              const isMenuOpen = activeDropdownId === post.id;

              return (
                <tr key={post.id} className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group ${isSelected ? 'bg-blue-50/30 dark:bg-blue-500/5' : ''}`}>
                  <td className="py-3 px-4 text-center">
                    <input type="checkbox" checked={isSelected} onChange={() => onToggleSelectPost(post.id)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600" />
                  </td>
                  <td className="py-3 px-2 text-slate-400 dark:text-gray-500 font-medium text-xs">{post.sn || index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0 w-16 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#334155]">
                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80'; }} />
                      </div>
                      <div className="flex flex-col min-w-0 max-w-md">
                        <span onClick={() => onViewPost(post)} className="font-semibold text-slate-900 dark:text-gray-100 line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-[13px] leading-snug" title={post.title}>
                          {post.title}
                        </span>
                        {post.isFeatured && (
                          <div className="mt-1">
                            <Badge variant="success" size="xs">Featured</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img src={post.author.avatar} alt={post.author.name} className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-[#334155] shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'; }} />
                      <span className="font-medium text-slate-800 dark:text-gray-200 text-xs">{post.author.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4"><Badge variant={CATEGORY_VARIANT[post.category] ?? 'neutral'} size="xs">{post.category}</Badge></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-xs text-slate-700 dark:text-gray-300">
                      <span className="text-sm">{LANGUAGE_FLAG[post.language] ?? '🌐'}</span><span>{post.language}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onToggleHomepage(post.id)}
                      className={`p-1.5 rounded-full transition-transform hover:scale-110 cursor-pointer ${post.showHomepage ? 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10' : 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10'}`}
                      title={post.showHomepage ? 'Visible on Homepage' : 'Hidden from Homepage'}
                    >
                      {post.showHomepage ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onTogglePopular(post.id)}
                      className={`p-1.5 rounded-full transition-transform hover:scale-110 cursor-pointer ${post.isPopular ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100/80' : 'text-slate-300 dark:text-gray-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-400'}`}
                      title={post.isPopular ? 'Marked as Popular' : 'Click to make Popular'}
                    >
                      <Star className={`w-4 h-4 ${post.isPopular ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </td>
                  <td className="py-3 px-4"><Badge variant={STATUS_VARIANT[post.status]} size="xs">{post.status}</Badge></td>
                  <td className="py-3 px-4 text-slate-500 dark:text-gray-400 text-xs">
                    {post.publishedDate !== '—' ? (
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-gray-200">{post.publishedDate}</div>
                        <div className="text-[11px] text-slate-400 dark:text-gray-500">{post.publishedTime}</div>
                      </div>
                    ) : <span className="text-slate-300 dark:text-gray-600 font-bold">—</span>}
                  </td>
                  <td className="py-3 px-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => onEditPost(post)} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#334155] text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-300 flex items-center justify-center transition-colors shadow-2xs cursor-pointer" title="Edit Post">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onViewPost(post)} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-gray-100 flex items-center justify-center transition-colors shadow-2xs cursor-pointer" title="Preview Post">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <div className="relative">
                        <button onClick={() => setActiveDropdownId(isMenuOpen ? null : post.id)} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-gray-100 flex items-center justify-center transition-colors shadow-2xs cursor-pointer" title="More Actions">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {isMenuOpen && (
                          <div ref={dropdownRef} className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl shadow-xl py-1.5 z-30 text-xs animate-fade-in text-left">
                            <button onClick={() => { onToggleFeatured(post.id); setActiveDropdownId(null); }} className="w-full px-3 py-1.5 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 font-medium">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" /><span>{post.isFeatured ? 'Unmark Featured' : 'Mark Featured'}</span>
                            </button>
                            <button onClick={() => { onDuplicatePost(post); setActiveDropdownId(null); }} className="w-full px-3 py-1.5 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 font-medium">
                              <Copy className="w-3.5 h-3.5 text-blue-500" /><span>Duplicate Post</span>
                            </button>
                            <div className="border-t border-slate-100 dark:border-[#334155] my-1" />
                            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Set Status</div>
                            {(['Published', 'Draft', 'Scheduled', 'Archived'] as PostStatus[]).map((st) => (
                              <button key={st} onClick={() => { onChangeStatus(post.id, st); setActiveDropdownId(null); }}
                                className={`w-full px-3 py-1 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 ${post.status === st ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-500/10' : 'text-slate-600 dark:text-gray-400'}`}>
                                <span>{st}</span>{post.status === st && <Check className="w-3 h-3" />}
                              </button>
                            ))}
                            <div className="border-t border-slate-100 dark:border-[#334155] my-1" />
                            <button onClick={() => { onDeletePost(post.id); setActiveDropdownId(null); }} className="w-full px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 font-semibold">
                              <Trash2 className="w-3.5 h-3.5" /><span>Delete Post</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium">
          Showing <span className="font-semibold text-slate-900 dark:text-gray-100">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-900 dark:text-gray-100">{endItem}</span> of{' '}
          <span className="font-semibold text-slate-900 dark:text-gray-100">{totalResults}</span> results
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}
            className={`w-8 h-8 rounded-lg border border-slate-200 dark:border-[#334155] flex items-center justify-center transition-colors shadow-2xs ${currentPage <= 1 ? 'text-slate-300 dark:text-gray-600 bg-slate-50 dark:bg-slate-800/40 cursor-not-allowed' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-gray-100 cursor-pointer'}`}
            aria-label="Previous Page">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {renderPageButtons()}
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages || totalPages === 0}
            className={`w-8 h-8 rounded-lg border border-slate-200 dark:border-[#334155] flex items-center justify-center transition-colors shadow-2xs ${currentPage >= totalPages || totalPages === 0 ? 'text-slate-300 dark:text-gray-600 bg-slate-50 dark:bg-slate-800/40 cursor-not-allowed' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-gray-100 cursor-pointer'}`}
            aria-label="Next Page">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};