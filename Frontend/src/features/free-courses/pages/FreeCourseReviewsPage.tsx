import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  ChevronRight,
  Home,
  MessageSquare,
  Search,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  Send,
  Reply,
  Mail,
} from 'lucide-react';
import type { FreeCourseReview, ReviewFiltersState, TargetClass } from '../types/free-course-review.types';
import { freeCourseReviewsApi } from '../api/freeCourseReviews.api';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useFreeToast as useToast } from '../hooks/useFreeToast';

const FIELD_CLASS =
  'w-full bg-white dark:bg-[#0B0F19] border border-[#e2e8f0] dark:border-[#374151] text-[#0f172a] dark:text-gray-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#3b82f6]';

export const FreeCourseReviewsPage: React.FC = () => {
  const { success, error, info } = useToast();
  const [reviews, setReviews] = useState<FreeCourseReview[]>([]);
  const [, setIsLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState<ReviewFiltersState>({
    search: '',
    targetClass: 'All',
    subject: 'All',
    rating: 'All',
    status: 'All',
    sortBy: 'newest',
  });

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalReview, setEditModalReview] = useState<FreeCourseReview | null>(null);
  const [replyModalReview, setReplyModalReview] = useState<FreeCourseReview | null>(null);
  const [deleteModalReview, setDeleteModalReview] = useState<FreeCourseReview | null>(null);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAvatar, setFormAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  );
  const [formCourseTitle, setFormCourseTitle] = useState('Class 9 Science Foundation (Hindi Medium)');
  const [formTargetClass, setFormTargetClass] = useState<TargetClass>('Class 9');
  const [formSubject, setFormSubject] = useState('Science');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formStatus, setFormStatus] = useState<'Approved' | 'Pending' | 'Hidden'>('Approved');

  // Reply Form State
  const [replyMessage, setReplyMessage] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('Fukey Education Admin');

  // Load reviews
  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await freeCourseReviewsApi.getReviews();
      setReviews(data);
    } catch (err: any) {
      error('Failed to load reviews', err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Filter & Sort Logic
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Search
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const nameMatch = r.studentName.toLowerCase().includes(query);
        const emailMatch = r.studentEmail.toLowerCase().includes(query);
        const courseMatch = r.courseTitle.toLowerCase().includes(query);
        const commentMatch = r.comment.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch && !courseMatch && !commentMatch) return false;
      }

      // Class
      if (filters.targetClass !== 'All' && r.targetClass !== filters.targetClass) {
        return false;
      }

      // Subject
      if (filters.subject !== 'All' && r.subject !== filters.subject) {
        return false;
      }

      // Rating
      if (filters.rating !== 'All' && r.rating !== Number(filters.rating)) {
        return false;
      }

      // Status
      if (filters.status !== 'All' && r.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [reviews, filters]);

  const sortedReviews = useMemo(() => {
    const list = [...filteredReviews];
    switch (filters.sortBy) {
      case 'newest':
        return list; // default natural order
      case 'oldest':
        return list.reverse();
      case 'highest_rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'lowest_rating':
        return list.sort((a, b) => a.rating - b.rating);
      default:
        return list;
    }
  }, [filteredReviews, filters.sortBy]);

  // KPIs dynamically calculated from the currently filtered review scope!
  const totalReviews = filteredReviews.length;
  const avgRating = totalReviews
    ? (filteredReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';
  const fiveStarsCount = filteredReviews.filter((r) => r.rating === 5).length;
  const pendingCount = filteredReviews.filter((r) => r.status === 'Pending').length;
  const repliedCount = filteredReviews.filter((r) => !!r.adminReply).length;

  // Active Scope Label for display (matching reference image)
  const activeScopeLabel = useMemo(() => {
    const parts: string[] = [];
    if (filters.targetClass !== 'All') parts.push(filters.targetClass);
    if (filters.subject !== 'All') parts.push(filters.subject);
    if (filters.rating !== 'All') parts.push(`${filters.rating} Stars`);
    if (filters.status !== 'All') parts.push(filters.status);
    if (filters.search.trim()) parts.push(`"${filters.search.trim()}"`);

    if (parts.length === 0) {
      return 'All Free Course Reviews (Classes 9–12)';
    }
    return parts.join(' • ');
  }, [filters]);

  const isScopeFiltered = useMemo(() => {
    return (
      filters.targetClass !== 'All' ||
      filters.subject !== 'All' ||
      filters.rating !== 'All' ||
      filters.status !== 'All' ||
      filters.search.trim().length > 0
    );
  }, [filters]);

  // Handle Add Review
  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80');
    setFormCourseTitle('Class 9 Science Foundation (Hindi Medium)');
    setFormTargetClass('Class 9');
    setFormSubject('Science');
    setFormRating(5);
    setFormComment('');
    setFormStatus('Approved');
    setAddModalOpen(true);
  };

  const handleSaveNewReview = async () => {
    if (!formName.trim() || !formComment.trim()) {
      error('Name and Review content are required');
      return;
    }
    try {
      const created = await freeCourseReviewsApi.createReview({
        courseId: 'fc-101',
        courseTitle: formCourseTitle,
        targetClass: formTargetClass,
        subject: formSubject,
        studentName: formName.trim(),
        studentEmail: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        studentAvatar: formAvatar,
        rating: formRating,
        comment: formComment.trim(),
        status: formStatus,
      });
      setReviews((prev) => [created, ...prev]);
      setAddModalOpen(false);
      success('Review Added', `New review from ${created.studentName} added.`);
    } catch (err: any) {
      error('Failed to create review', err?.message);
    }
  };

  // Handle Edit Review
  const handleOpenEdit = (r: FreeCourseReview) => {
    setEditModalReview(r);
    setFormName(r.studentName);
    setFormEmail(r.studentEmail);
    setFormAvatar(r.studentAvatar);
    setFormCourseTitle(r.courseTitle);
    setFormTargetClass(r.targetClass);
    setFormSubject(r.subject);
    setFormRating(r.rating);
    setFormComment(r.comment);
    setFormStatus(r.status);
  };

  const handleSaveEditReview = async () => {
    if (!editModalReview) return;
    try {
      const updated = await freeCourseReviewsApi.updateReview(editModalReview.id, {
        studentName: formName.trim(),
        studentEmail: formEmail.trim(),
        studentAvatar: formAvatar,
        courseTitle: formCourseTitle,
        targetClass: formTargetClass,
        subject: formSubject,
        rating: formRating,
        comment: formComment.trim(),
        status: formStatus,
      });
      setReviews((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditModalReview(null);
      success('Review Updated', 'Student review changes saved successfully.');
    } catch (err: any) {
      error('Failed to update review', err?.message);
    }
  };

  // Handle Delete Review
  const handleConfirmDelete = async () => {
    if (!deleteModalReview) return;
    try {
      await freeCourseReviewsApi.deleteReview(deleteModalReview.id);
      setReviews((prev) => prev.filter((r) => r.id !== deleteModalReview.id));
      setDeleteModalReview(null);
      success('Review Deleted', 'Review has been removed.');
    } catch (err: any) {
      error('Failed to delete review', err?.message);
    }
  };

  // Handle Reply
  const handleOpenReply = (r: FreeCourseReview) => {
    setReplyModalReview(r);
    setReplyMessage(r.adminReply?.message || '');
    setReplyAuthor(r.adminReply?.repliedBy || 'Fukey Education Admin');
  };

  const handleSaveReply = async () => {
    if (!replyModalReview || !replyMessage.trim()) return;
    try {
      const updated = await freeCourseReviewsApi.replyToReview(
        replyModalReview.id,
        replyMessage.trim(),
        replyAuthor.trim()
      );
      setReviews((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setReplyModalReview(null);
      success('Reply Sent', `Replied to ${replyModalReview.studentName}'s review.`);
    } catch (err: any) {
      error('Failed to reply', err?.message);
    }
  };

  const handleDeleteReply = async (id: string) => {
    try {
      const updated = await freeCourseReviewsApi.deleteReply(id);
      setReviews((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      info('Reply Removed');
    } catch (err: any) {
      error('Failed to remove reply', err?.message);
    }
  };

  // Quick Toggle Status (Approved <-> Hidden)
  const handleToggleStatus = async (r: FreeCourseReview) => {
    const nextStatus = r.status === 'Approved' ? 'Hidden' : 'Approved';
    try {
      const updated = await freeCourseReviewsApi.toggleStatus(r.id, nextStatus);
      setReviews((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      info(`Status Changed to ${nextStatus}`);
    } catch (err: any) {
      error('Status update failed', err?.message);
    }
  };

  const resetAllFilters = () => {
    setFilters({
      search: '',
      targetClass: 'All',
      subject: 'All',
      rating: 'All',
      status: 'All',
      sortBy: 'newest',
    });
    info('Filters reset');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      {/* <nav className="flex items-center gap-2 text-xs text-[#686E7D] dark:text-slate-400">
        <Link
          to="/admin/dashboard"
          className="hover:text-[#12141C] dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
        <Link to="/admin/free-courses" className="hover:text-[#12141C] dark:hover:text-white transition-colors">
          Manage Free Courses
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
        <span className="text-[#12141C] dark:text-white font-semibold">Student Course Reviews</span>
      </nav> */}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-[#12141C] dark:text-white tracking-tight">
              Free Course Reviews & Ratings
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#E7F7ED] text-[#16A34A] border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
              Classes 9th to 12th
            </span>
          </div>
          <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-1">
            Sort by classes and subjects, respond to student reviews, and manage platform testimonials.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Student Review
        </Button>
      </div>

      {/* Active Scope Banner (matching reference images) */}
      <div className="flex items-center justify-between gap-3 p-3 px-4 rounded-xl bg-gradient-to-r from-[#EAF0FE] to-[#F6F7FA] dark:from-blue-950/40 dark:via-[#0e1c3a] dark:to-[#0c1834] border border-blue-200 dark:border-blue-500/30 text-xs shadow-md">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold uppercase tracking-wide text-[#2451D9] dark:text-blue-400">
            ACTIVE SCOPE:
          </span>
          <span className="font-bold text-[#12141C] dark:text-white text-sm">
            {activeScopeLabel}
          </span>
          <span className="text-blue-600 dark:text-blue-300 font-medium text-[11px]">
            (Metrics updated live)
          </span>
        </div>
        {isScopeFiltered && (
          <button
            onClick={resetAllFilters}
            className="text-xs text-[#2451D9] dark:text-blue-400 hover:text-[#12141C] dark:hover:text-white underline cursor-pointer shrink-0"
          >
            Reset Scope
          </button>
        )}
      </div>

      {/* KPI Cards (ABOVE the filters, updating live with active filtered scope!) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] shadow-md">
          <span className="text-[11px] font-semibold text-[#686E7D] dark:text-slate-400 uppercase tracking-wider block">
            Total Reviews
          </span>
          <div className="text-2xl font-extrabold text-[#12141C] dark:text-white mt-1">{totalReviews}</div>
          <span className="text-[11px] font-medium text-[#2451D9] dark:text-blue-400">In Active Scope</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] shadow-md">
          <span className="text-[11px] font-semibold text-[#686E7D] dark:text-slate-400 uppercase tracking-wider block">
            Average Rating
          </span>
          <div className="text-2xl font-extrabold text-amber-500 dark:text-amber-400 mt-1 flex items-center gap-1">
            <span>{avgRating}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
          </div>
          <span className="text-[11px] font-medium text-[#16A34A] dark:text-emerald-400">Scope satisfaction</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] shadow-md">
          <span className="text-[11px] font-semibold text-[#686E7D] dark:text-slate-400 uppercase tracking-wider block">
            5-Star Reviews
          </span>
          <div className="text-2xl font-extrabold text-[#16A34A] dark:text-emerald-400 mt-1">{fiveStarsCount}</div>
          <span className="text-[11px] font-medium text-[#686E7D] dark:text-slate-400">
            {totalReviews ? Math.round((fiveStarsCount / totalReviews) * 100) : 0}% of scope
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] shadow-md">
          <span className="text-[11px] font-semibold text-[#686E7D] dark:text-slate-400 uppercase tracking-wider block">
            Pending Moderation
          </span>
          <div className="text-2xl font-extrabold text-amber-500 dark:text-amber-400 mt-1">{pendingCount}</div>
          <span className="text-[11px] font-medium text-[#D97706] dark:text-amber-400">Needs review</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] shadow-md">
          <span className="text-[11px] font-semibold text-[#686E7D] dark:text-slate-400 uppercase tracking-wider block">
            Admin Replied
          </span>
          <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">{repliedCount}</div>
          <span className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400">Replied in scope</span>
        </div>
      </div>

      {/* Class & Subject Filter Section (BELOW KPI cards) */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl p-4 lg:p-5 shadow-lg space-y-3.5">
        {/* Row 1: Search + Target Class + Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-[#686E7D] dark:text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search student name, email, course title, review content..."
              className="w-full bg-white dark:bg-[#0B0F19] border border-[#e2e8f0] dark:border-[#374151] text-[#0f172a] dark:text-gray-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:outline-none focus:border-[#3b82f6]"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={filters.targetClass}
              onChange={(e) => setFilters({ ...filters, targetClass: e.target.value })}
              className={`${FIELD_CLASS} appearance-none cursor-pointer`}
            >
              <option value="All">All Classes (9th - 12th)</option>
              <option value="Class 9">Class 9th</option>
              <option value="Class 10">Class 10th</option>
              <option value="Class 11">Class 11th</option>
              <option value="Class 12">Class 12th</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              className={`${FIELD_CLASS} appearance-none cursor-pointer`}
            >
              <option value="All">All Subjects</option>
              <option value="Science">Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Computer Science">Computer Science</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Social Science">Social Science</option>
            </select>
          </div>
        </div>

        {/* Row 2: Ratings + Status + Sort By + Reset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          <div>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              className={`${FIELD_CLASS} appearance-none cursor-pointer`}
            >
              <option value="All">All Ratings (1 - 5 Stars)</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className={`${FIELD_CLASS} appearance-none cursor-pointer`}
            >
              <option value="All">All Moderation Status</option>
              <option value="Approved">Approved / Visible</option>
              <option value="Pending">Pending Moderation</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>

          <div>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className={`${FIELD_CLASS} appearance-none cursor-pointer`}
            >
              <option value="newest">Sort By: Newest First</option>
              <option value="oldest">Sort By: Oldest First</option>
              <option value="highest_rating">Highest Rating First</option>
              <option value="lowest_rating">Lowest Rating First</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={resetAllFilters}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer w-full sm:w-auto justify-center ${
                isScopeFiltered
                  ? 'bg-[#FCEAE4] border border-rose-300 text-[#DC5B3E] hover:bg-rose-100 font-bold shadow-md dark:bg-rose-600/20 dark:border-rose-500/60 dark:text-rose-300 dark:hover:bg-rose-600/30 dark:hover:border-rose-400 dark:shadow-rose-950/40'
                  : 'border border-[#E6E8EE] dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#12141C] dark:hover:text-white'
              }`}
            >
              <RotateCcw
                className={`w-3.5 h-3.5 ${
                  isScopeFiltered ? 'text-[#DC5B3E] dark:text-rose-400' : 'text-[#686E7D] dark:text-slate-400'
                }`}
              />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E6E8EE] dark:border-[#334155]">
            <MessageSquare className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#12141C] dark:text-white">No reviews found</h3>
            <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-0.5">
              Try adjusting your class or subject filter criteria.
            </p>
          </div>
        ) : (
          sortedReviews.map((r) => {
            const hasReply = !!r.adminReply;

            return (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-md space-y-3.5"
              >
                {/* Review Top Header: Student Info + Class/Subject Badges + Stars */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Student Avatar, Name & Email */}
                  <div className="flex items-center gap-3">
                    <img
                      src={r.studentAvatar}
                      alt={r.studentName}
                      className="w-11 h-11 rounded-full object-cover border border-[#E6E8EE] dark:border-slate-700 shadow-sm shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-[#12141C] dark:text-white text-sm">{r.studentName}</h4>
                        <span className="flex items-center gap-1 text-[11px] text-[#2451D9] bg-[#EAF0FE] border border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20 px-2 py-0.5 rounded-full font-mono">
                          <Mail className="w-3 h-3" />
                          <span>{r.studentEmail}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E7F7ED] text-[#16A34A] border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30">
                          Free Enrolled Student
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#686E7D] dark:text-slate-400 mt-1">
                        <span>on</span>
                        <span className="text-[#12141C] dark:text-white font-medium">"{r.courseTitle}"</span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-500">{r.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars & Badges */}
                  <div className="flex items-center gap-2.5 sm:self-start">
                    <span className="px-2 py-0.5 rounded bg-[#EAF0FE] text-[#2451D9] border border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30 text-xs font-bold">
                      {r.targetClass}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#F1EAFE] text-[#7C3AED] border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30 text-xs font-bold">
                      {r.subject}
                    </span>
                    <div className="flex items-center gap-0.5 bg-[#FDF3E0] dark:bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-500/20">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <div className="pl-14">
                  <p className="text-xs text-slate-600 dark:text-slate-200 leading-relaxed bg-[#F6F7FA] dark:bg-[#0B0F19]/60 p-3 rounded-xl border border-[#E6E8EE] dark:border-[#334155]">
                    "{r.comment}"
                  </p>
                </div>

                {/* Admin Reply Block (if exists) */}
                {hasReply && r.adminReply && (
                  <div className="ml-14 p-3.5 rounded-xl bg-gradient-to-r from-[#EAF0FE] to-[#F6F7FA] dark:from-[#0c1836] dark:to-[#0a1226] border border-blue-200 dark:border-blue-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                          FE
                        </span>
                        <span className="text-xs font-bold text-[#2451D9] dark:text-blue-300">
                          {r.adminReply.repliedBy}
                        </span>
                        <span className="text-[10px] text-[#686E7D] dark:text-slate-400">
                          • {r.adminReply.repliedAt}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenReply(r)}
                          className="text-[11px] text-[#2451D9] dark:text-blue-400 hover:text-[#12141C] dark:hover:text-white underline cursor-pointer"
                        >
                          Edit Reply
                        </button>
                        <button
                          onClick={() => handleDeleteReply(r.id)}
                          className="text-[11px] text-[#DC5B3E] dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 underline cursor-pointer"
                        >
                          Delete Reply
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-200 pl-7">{r.adminReply.message}</p>
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="pl-14 pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6E8EE] dark:border-[#334155]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.status === 'Approved'
                          ? 'bg-[#E7F7ED] text-[#16A34A] dark:bg-emerald-500/15 dark:text-emerald-400'
                          : r.status === 'Pending'
                          ? 'bg-[#FDF3E0] text-[#D97706] dark:bg-amber-500/15 dark:text-amber-400'
                          : 'bg-[#FCEAE4] text-[#DC5B3E] dark:bg-rose-500/15 dark:text-rose-400'
                      }`}
                    >
                      {r.status}
                    </span>

                    <button
                      onClick={() => handleToggleStatus(r)}
                      className="text-xs text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {r.status === 'Approved' ? 'Hide from public' : 'Approve & Publish'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Reply button */}
                    <Button
                      size="xs"
                      variant={hasReply ? 'outline' : 'primary'}
                      onClick={() => handleOpenReply(r)}
                      icon={<Reply className="w-3.5 h-3.5" />}
                    >
                      {hasReply ? 'Update Reply' : 'Reply to Student'}
                    </Button>

                    {/* Edit button */}
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => handleOpenEdit(r)}
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeleteModalReview(r)}
                      className="p-1.5 rounded-lg text-[#686E7D] dark:text-slate-400 hover:text-[#DC5B3E] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 1. Reply to Student Modal */}
      <Modal
        isOpen={!!replyModalReview}
        onClose={() => setReplyModalReview(null)}
        title={
          <div className="flex items-center gap-2">
            <Reply className="w-5 h-5 text-[#2451D9] dark:text-blue-400" />
            <span className="text-base font-bold text-[#12141C] dark:text-white">
              Reply to {replyModalReview?.studentName}
            </span>
          </div>
        }
        subtitle={`Student Email: ${replyModalReview?.studentEmail} • Course: "${replyModalReview?.courseTitle}"`}
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReplyModalReview(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveReply}
              icon={<Send className="w-4 h-4" />}
            >
              Post Admin Reply
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-[#686E7D] dark:text-slate-400 block mb-1">Student Review:</span>
            "{replyModalReview?.comment}"
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Reply as
            </label>
            <Input
              value={replyAuthor}
              onChange={(e) => setReplyAuthor(e.target.value)}
              placeholder="e.g. Fukey Education Admin, Pawan Gupta (Instructor)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Your Response Message *
            </label>
            <textarea
              rows={4}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Write a helpful, encouraging reply to the student..."
              className={FIELD_CLASS}
            />
          </div>

          {/* Quick response templates */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#686E7D] dark:text-slate-400">Quick templates:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Thank you for the wonderful feedback! Keep practicing with DPP sheets.',
                'We have noted your request and are uploading additional problem-solving videos soon.',
                'Glad this course helped your exam preparation! All the best for your boards.',
              ].map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReplyMessage(tmpl)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors text-left"
                >
                  "{tmpl.slice(0, 45)}..."
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* 2. Add Student Review Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Student Course Review"
        maxWidth="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveNewReview}>
              Create Review
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Student Name"
              requiredBadge
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Aryan Sharma"
            />
            <Input
              label="Student Email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="e.g. aryan.sharma@gmail.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Target Class"
              value={formTargetClass}
              onChange={(e) => setFormTargetClass(e.target.value as TargetClass)}
              options={[
                { value: 'Class 9', label: 'Class 9' },
                { value: 'Class 10', label: 'Class 10' },
                { value: 'Class 11', label: 'Class 11' },
                { value: 'Class 12', label: 'Class 12' },
              ]}
            />
            <Select
              label="Subject"
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              options={[
                { value: 'Science', label: 'Science' },
                { value: 'Mathematics', label: 'Mathematics' },
                { value: 'Physics', label: 'Physics' },
                { value: 'Chemistry', label: 'Chemistry' },
                { value: 'Biology', label: 'Biology' },
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'English', label: 'English' },
                { value: 'Hindi', label: 'Hindi' },
                { value: 'Social Science', label: 'Social Science' },
              ]}
            />
            <Select
              label="Rating"
              value={formRating.toString()}
              onChange={(e) => setFormRating(Number(e.target.value))}
              options={[
                { value: '5', label: '5 Stars ★★★★★' },
                { value: '4', label: '4 Stars ★★★★☆' },
                { value: '3', label: '3 Stars ★★★☆☆' },
                { value: '2', label: '2 Stars ★★☆☆☆' },
                { value: '1', label: '1 Star ★☆☆☆☆' },
              ]}
            />
          </div>

          <Input
            label="Course Title"
            value={formCourseTitle}
            onChange={(e) => setFormCourseTitle(e.target.value)}
          />

          <Input
            label="Student Avatar Image URL"
            value={formAvatar}
            onChange={(e) => setFormAvatar(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Review Content *
            </label>
            <textarea
              rows={3}
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder="What did the student say about this free course?"
              className={FIELD_CLASS}
            />
          </div>
        </div>
      </Modal>

      {/* 3. Edit Review Modal */}
      <Modal
        isOpen={!!editModalReview}
        onClose={() => setEditModalReview(null)}
        title="Edit Student Review"
        maxWidth="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModalReview(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEditReview}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Student Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <Input
              label="Student Email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Target Class"
              value={formTargetClass}
              onChange={(e) => setFormTargetClass(e.target.value as TargetClass)}
              options={[
                { value: 'Class 9', label: 'Class 9' },
                { value: 'Class 10', label: 'Class 10' },
                { value: 'Class 11', label: 'Class 11' },
                { value: 'Class 12', label: 'Class 12' },
              ]}
            />
            <Select
              label="Subject"
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              options={[
                { value: 'Science', label: 'Science' },
                { value: 'Mathematics', label: 'Mathematics' },
                { value: 'Physics', label: 'Physics' },
                { value: 'Chemistry', label: 'Chemistry' },
                { value: 'Biology', label: 'Biology' },
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'English', label: 'English' },
                { value: 'Hindi', label: 'Hindi' },
                { value: 'Social Science', label: 'Social Science' },
              ]}
            />
            <Select
              label="Rating"
              value={formRating.toString()}
              onChange={(e) => setFormRating(Number(e.target.value))}
              options={[
                { value: '5', label: '5 Stars ★★★★★' },
                { value: '4', label: '4 Stars ★★★★☆' },
                { value: '3', label: '3 Stars ★★★☆☆' },
                { value: '2', label: '2 Stars ★★☆☆☆' },
                { value: '1', label: '1 Star ★☆☆☆☆' },
              ]}
            />
          </div>

          <Input
            label="Avatar URL"
            value={formAvatar}
            onChange={(e) => setFormAvatar(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Review Content
            </label>
            <textarea
              rows={3}
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              className={FIELD_CLASS}
            />
          </div>

          <Select
            label="Moderation Status"
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value as any)}
            options={[
              { value: 'Approved', label: 'Approved (Visible to Students)' },
              { value: 'Pending', label: 'Pending Moderation' },
              { value: 'Hidden', label: 'Hidden / Flagged' },
            ]}
          />
        </div>
      </Modal>

      {/* 4. Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalReview}
        onClose={() => setDeleteModalReview(null)}
        title="Delete Review?"
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalReview(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete Review
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Are you sure you want to permanently delete the review by{' '}
          <strong className="text-[#12141C] dark:text-white">{deleteModalReview?.studentName}</strong>?
        </p>
      </Modal>
    </div>
  );
};