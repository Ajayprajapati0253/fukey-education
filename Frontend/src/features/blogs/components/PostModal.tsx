import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Calendar, Clock, Tag as TagIcon, Save, Plus } from 'lucide-react';
import type { Post, PostCategory, PostLanguage, PostStatus } from '../types/post.types.ts';
import { AUTHORS, CATEGORIES } from '../data/InitialPosts';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Partial<Post>) => void;
  initialPost?: Post | null;
}

export const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, onSave, initialPost }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<PostCategory>('Education');
  const [authorName, setAuthorName] = useState(AUTHORS[0].name);
  const [language, setLanguage] = useState<PostLanguage>('EN');
  const [status, setStatus] = useState<PostStatus>('Published');
  const [showHomepage, setShowHomepage] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80');
  const [publishedDate, setPublishedDate] = useState('21 Aug, 2026');
  const [publishedTime, setPublishedTime] = useState('11:00 AM');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>(['Education']);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title);
      setSlug(initialPost.slug);
      setCategory(initialPost.category);
      setAuthorName(initialPost.author.name);
      setLanguage(initialPost.language);
      setStatus(initialPost.status);
      setShowHomepage(initialPost.showHomepage);
      setIsPopular(initialPost.isPopular);
      setIsFeatured(initialPost.isFeatured);
      setThumbnail(initialPost.thumbnail);
      setPublishedDate(initialPost.publishedDate !== '—' ? initialPost.publishedDate : '21 Aug, 2026');
      setPublishedTime(initialPost.publishedTime !== '—' ? initialPost.publishedTime : '11:00 AM');
      setExcerpt(initialPost.excerpt || '');
      setContent(initialPost.content || '');
      setTags(initialPost.tags || ['Education']);
    } else {
      setTitle(''); setSlug(''); setCategory('Education'); setAuthorName(AUTHORS[0].name);
      setLanguage('EN'); setStatus('Published'); setShowHomepage(true); setIsPopular(false); setIsFeatured(false);
      setThumbnail('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&auto=format&fit=crop&q=80');
      setPublishedDate('21 Aug, 2026'); setPublishedTime('11:00 AM'); setExcerpt(''); setContent('');
      setTags(['Education']);
    }
  }, [initialPost, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialPost) {
      setSlug(val.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 50));
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim() && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => setTags(tags.filter((t) => t !== tagToRemove));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedAuthor = AUTHORS.find((a) => a.name === authorName) || {
      name: authorName,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'Staff Writer', email: 'staff@fukey.edu',
    };

    onSave({
      title, slug: slug || 'post-' + Date.now(), category, author: selectedAuthor, language, status,
      showHomepage, isPopular, isFeatured, thumbnail,
      publishedDate: status === 'Draft' ? '—' : publishedDate,
      publishedTime: status === 'Draft' ? '—' : publishedTime,
      excerpt, content, tags,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100">{initialPost ? 'Edit Post' : 'Add New Post'}</h2>
            <p className="text-xs text-slate-500 dark:text-gray-400">{initialPost ? 'Update publication details and content.' : 'Create and configure a new educational article.'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Post Title <span className="text-red-500">*</span></label>
            <input type="text" required value={title} onChange={handleTitleChange} placeholder="e.g. How to Prepare for Board Exams in 2026..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">URL Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="board-exam-prep"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-slate-700 dark:text-gray-200 focus:bg-white dark:focus:bg-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-xs font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-slate-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none">
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Author</label>
              <select value={authorName} onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-slate-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none">
                {AUTHORS.map((auth) => <option key={auth.name} value={auth.name}>{auth.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value as PostLanguage)}
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-slate-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none">
                <option value="EN">English (EN)</option>
                <option value="HI">Hindi (HI)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-slate-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-semibold">
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {status !== 'Draft' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-[#334155]">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" />Publication Date</label>
                <input type="text" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} placeholder="21 Aug, 2026"
                  className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-xs text-slate-800 dark:text-gray-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />Publication Time</label>
                <input type="text" value={publishedTime} onChange={(e) => setPublishedTime(e.target.value)} placeholder="11:00 AM"
                  className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-xs text-slate-800 dark:text-gray-200" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-slate-400" />Thumbnail Image URL</label>
            <div className="flex gap-3">
              <input type="url" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-xs text-slate-800 dark:text-gray-200" />
              <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-[#334155] bg-slate-100 dark:bg-slate-800 shrink-0">
                <img src={thumbnail} alt="Preview" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80'; }} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Summary / Excerpt</label>
            <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Brief summary displayed in post listings and social cards..."
              className="w-full px-3.5 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-xs text-slate-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Article Content</label>
            <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write or paste the full educational post content here..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-xs font-sans text-slate-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><TagIcon className="w-3.5 h-3.5 text-slate-400" />Tags (Press Enter to add)</label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-[#334155] rounded-lg">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-gray-300 rounded-md text-xs font-medium">
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-red-500">×</button>
                </span>
              ))}
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Add tag..."
                className="px-2 py-0.5 bg-transparent text-xs text-slate-700 dark:text-gray-200 focus:outline-none flex-1 min-w-[80px]" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-[#334155] space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">Display & Highlights</div>
            <div className="flex flex-wrap gap-6 text-xs font-medium text-slate-700 dark:text-gray-300">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={showHomepage} onChange={(e) => setShowHomepage(e.target.checked)} className="w-4 h-4 rounded text-blue-600 cursor-pointer accent-blue-600" />
                <span>Show on Homepage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="w-4 h-4 rounded text-amber-500 cursor-pointer accent-amber-500" />
                <span>Mark as Popular (Star)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 cursor-pointer accent-emerald-600" />
                <span>Featured Article Badge</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-gray-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5">
              {initialPost ? <><Save className="w-4 h-4" /><span>Save Changes</span></> : <><Plus className="w-4 h-4" /><span>Create Post</span></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};