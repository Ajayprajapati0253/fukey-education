import React from 'react';
import { X, Calendar, Eye, Globe, Share2, Sparkles, Edit } from 'lucide-react';
import type { Post } from '../types/post.types';

interface PostPreviewModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (post: Post) => void;
}

export const PostPreviewModal: React.FC<PostPreviewModalProps> = ({ post, isOpen, onClose, onEdit }) => {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#334155] flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
              {post.category}
            </span>
            {post.isFeatured && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 uppercase tracking-wide border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { onClose(); onEdit(post); }} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <Edit className="w-3.5 h-3.5" />Edit
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-gray-100 leading-tight">{post.title}</h1>

          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-100 dark:border-[#334155] text-xs text-slate-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-[#334155]" />
              <div>
                <div className="font-bold text-slate-900 dark:text-gray-100 text-sm">{post.author.name}</div>
                <div className="text-slate-400 dark:text-gray-500">{post.author.role || 'Content Author'}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-slate-600 dark:text-gray-300"><Calendar className="w-3.5 h-3.5 text-slate-400" /><span>{post.publishedDate}</span></div>
              <div className="flex items-center gap-1 text-slate-600 dark:text-gray-300"><Eye className="w-3.5 h-3.5 text-slate-400" /><span>{post.views.toLocaleString()} views</span></div>
              <div className="flex items-center gap-1 text-slate-600 dark:text-gray-300"><Globe className="w-3.5 h-3.5 text-slate-400" /><span>{post.language}</span></div>
            </div>
          </div>

          <div className="w-full h-64 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#334155]">
            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {post.excerpt && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border-l-4 border-blue-500 text-slate-700 dark:text-gray-300 italic text-sm leading-relaxed">
              "{post.excerpt}"
            </div>
          )}

          <div className="text-slate-800 dark:text-gray-300 text-sm leading-relaxed space-y-4">
            <p>{post.content || 'In this comprehensive guide, our academic team breaks down effective methodologies for students.'}</p>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-[#334155]">
              <div className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-2">Tags & Topics</div>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 rounded-lg text-xs font-medium">#{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-100 dark:border-[#334155] bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
          <span>Slug: /blogs/{post.slug}</span>
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-200 hover:bg-slate-300 dark:hover:bg-slate-600 font-medium rounded-lg transition-colors">
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};