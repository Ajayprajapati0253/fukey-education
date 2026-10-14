import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Search,
  Send,
  Radio,
  CheckCircle2,
  Sparkles,
  Clock,
  Filter,
  CornerDownRight,
  TrendingUp,
  Award,
  AlertCircle,
  PlusCircle,
  X,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Zap,
} from 'lucide-react';
import type { Instructor, StudentReview, ReviewReply } from '../types/instructor';
import { INITIAL_REVIEWS, SIMULATED_INCOMING_REVIEWS } from '../data/mockReviews';

interface InstructorFeedbackSectionProps {
  instructor: Instructor;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const STORAGE_KEY_PREFIX = 'fukey_instructor_reviews_';

export function InstructorFeedbackSection({
  instructor,
  onShowToast,
}: InstructorFeedbackSectionProps) {
  const storageKey = `${STORAGE_KEY_PREFIX}${instructor.id}`;

  // Reviews state with localStorage persistence
  const [reviews, setReviews] = useState<StudentReview[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading reviews from localStorage:', e);
    }
    return INITIAL_REVIEWS;
  });

  // Save reviews to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(reviews));
    } catch (e) {
      console.error('Error saving reviews to localStorage:', e);
    }
  }, [reviews, storageKey]);

  // Real-time Live Stream Simulation State
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newReviewAlert, setNewReviewAlert] = useState<string | null>(null);
  const simIndexRef = useRef(0);

  // Pagination state: Default top 5 reviews
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSizeOptions = [5, 10, 20, 30, 40, 50];

  // Box Expand / Collapse & Maximize state (Like Assigned Courses box)
  const [isFeedbackBoxExpanded, setIsFeedbackBoxExpanded] = useState<boolean>(true);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [expandedReviewIds, setExpandedReviewIds] = useState<Record<string, boolean>>({});

  const toggleReviewExpand = (reviewId: string) => {
    setExpandedReviewIds((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');

  // Reply Input State per review: { [reviewId]: replyText }
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);

  // Modal to Add Custom Review (for testing / manual entry)
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('Class 10th');
  const [newCourseName, setNewCourseName] = useState(
    instructor.assignedCourses?.[0]?.name || `Class 10th ${instructor.subject}`
  );
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newTags, setNewTags] = useState('Vyakaran, Doubt Session');

  // Audio beep generator using Web Audio API (optional feedback ping)
  const playPingSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext may be restricted by browser policy
    }
  };

  // Function to inject an incoming review
  const injectIncomingReview = (customReview?: Partial<StudentReview>) => {
    const pool = SIMULATED_INCOMING_REVIEWS;
    const template = customReview || pool[simIndexRef.current % pool.length];
    simIndexRef.current += 1;

    const newRev: StudentReview = {
      id: `rev-${Date.now()}`,
      instructorId: instructor.id,
      studentName: template.studentName || 'Student Learner',
      studentAvatar:
        template.studentAvatar ||
        `https://images.unsplash.com/photo-${1535713875000 + (simIndexRef.current % 50)}?w=100&auto=format&fit=crop&q=80`,
      studentClass: template.studentClass || 'Class 10th',
      courseName: template.courseName || `Class 10th ${instructor.subject}`,
      rating: template.rating || 5,
      title: template.title || 'New Student Feedback',
      comment: template.comment || 'Wonderful class and very clear concepts!',
      createdAt: 'Just now',
      timestamp: Date.now(),
      helpfulCount: 0,
      sentiment: template.sentiment || 'positive',
      tags: template.tags || ['Live Session'],
      verifiedLearner: true,
      replies: [],
      isNew: true,
    };

    setReviews((prev) => [newRev, ...prev]);
    setCurrentPage(1);
    setNewReviewAlert(
      `Latest student comment from ${newRev.studentName} (${newRev.courseName}) — ${newRev.rating}★: "${newRev.comment.slice(0, 80)}..."`
    );
    playPingSound();
    onShowToast(`New student feedback received from ${newRev.studentName}`, 'success');

    // Clear the "isNew" animation flag after 8 seconds
    setTimeout(() => {
      setReviews((prev) =>
        prev.map((r) => (r.id === newRev.id ? { ...r, isNew: false } : r))
      );
      setNewReviewAlert(null);
    }, 8000);
  };

  // Optional background timer for simulating real-time live review activity
  useEffect(() => {
    if (!isLiveActive) return;

    // Trigger an incoming student review periodically (every 45 seconds)
    const interval = setInterval(() => {
      injectIncomingReview();
    }, 45000);

    return () => clearInterval(interval);
  }, [isLiveActive, instructor]);

  // Handle Helpful Upvote
  const handleUpvoteHelpful = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
      )
    );
    onShowToast('Marked review as helpful', 'info');
  };

  // Handle Post Reply (Admin / Instructor)
  const handlePostReply = (reviewId: string) => {
    const text = replyTexts[reviewId]?.trim();
    if (!text) {
      onShowToast('Please write a reply message first', 'error');
      return;
    }

    const newReply: ReviewReply = {
      id: `rep-${Date.now()}`,
      authorName: instructor.name,
      authorRole: 'Instructor',
      authorAvatar: instructor.avatar,
      content: text,
      createdAt: 'Just now',
    };

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, replies: [...(r.replies || []), newReply] }
          : r
      )
    );

    setReplyTexts((prev) => ({ ...prev, [reviewId]: '' }));
    setActiveReplyBoxId(null);
    onShowToast('Reply posted to student feedback', 'success');
  };

  // Handle Custom Review Submission from modal
  const handleAddCustomReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newComment.trim()) {
      onShowToast('Please fill student name and feedback comment', 'error');
      return;
    }

    const tagList = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    injectIncomingReview({
      studentName: newStudentName,
      studentClass: newStudentClass,
      courseName: newCourseName,
      rating: newRating,
      title: `${newRating}★ Feedback from ${newStudentName}`,
      comment: newComment,
      sentiment: newRating >= 4 ? 'positive' : newRating === 3 ? 'neutral' : 'constructive',
      tags: tagList.length > 0 ? tagList : ['General Feedback'],
      studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    });

    setIsAddReviewModalOpen(false);
    setNewStudentName('');
    setNewComment('');
  };

  // Calculate dynamic rating breakdown
  const stats = useMemo(() => {
    const total = reviews.length || 1;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / total).toFixed(2);

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rounded = Math.round(r.rating);
      if (counts[rounded] !== undefined) counts[rounded]++;
    });

    const percentages: Record<number, number> = {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round((counts[3] / total) * 100),
      2: Math.round((counts[2] / total) * 100),
      1: Math.round((counts[1] / total) * 100),
    };

    const positiveCount = reviews.filter((r) => r.rating >= 4).length;
    const positivePercent = Math.round((positiveCount / total) * 100);

    return {
      avg,
      total: reviews.length,
      counts,
      percentages,
      positivePercent,
    };
  }, [reviews]);

  // Unique course list for filtering
  const availableCourses = useMemo(() => {
    const set = new Set<string>();
    reviews.forEach((r) => {
      if (r.courseName) set.add(r.courseName);
    });
    return Array.from(set);
  }, [reviews]);

  // Filtered and sorted reviews
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Rating filter
    if (selectedRating !== 'all') {
      list = list.filter((r) => Math.round(r.rating) === selectedRating);
    }

    // Course filter
    if (selectedCourse !== 'all') {
      list = list.filter((r) => r.courseName === selectedCourse);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'newest') return b.timestamp - a.timestamp;
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
      return 0;
    });

    return list;
  }, [reviews, searchQuery, selectedRating, selectedCourse, sortBy]);

  // Reset pagination to page 1 on filter or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRating, selectedCourse, sortBy, pageSize]);

  // Derived pagination variables (Default top 5)
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredReviews.length);
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  // Latest incoming student review for real-time spotlight
  const latestStudentReview = reviews[0] || null;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Header & Live Indicator Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-2xl p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>Student Performance & Realtime Feedback</span>
            </h3>

            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Feedback Stream</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Realtime student comments, ratings, and course satisfaction feed for {instructor.name}
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              onShowToast(soundEnabled ? 'Feedback audio muted' : 'Feedback audio alert enabled', 'info');
            }}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1e2c4c] text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute feedback ping sound' : 'Enable feedback sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Trigger Immediate Simulation */}
          <button
            type="button"
            onClick={() => injectIncomingReview()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer shadow-2xs"
            title="Simulate a new student review arriving right now"
          >
            <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>Simulate New Review</span>
          </button>

          {/* Add Manual Review */}
          <button
            type="button"
            onClick={() => setIsAddReviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Test Review Form</span>
          </button>
        </div>
      </div>

      {/* Realtime Alert Banner if new review just arrived */}
      {newReviewAlert && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-emerald-600/15 border border-blue-400/40 dark:border-blue-500/40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            <span>{newReviewAlert}</span>
          </div>
          <button
            onClick={() => setNewReviewAlert(null)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Udemy-Style Rating Breakdown & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 cols): Overall Score & Star Bars */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-[#0b1329] border border-slate-200/60 dark:border-[#1e2c4c]">
              <div className="text-4xl font-extrabold text-blue-500 tracking-tight">
                {stats.avg}
              </div>
              <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Course Rating
              </div>
            </div>

            <div className="min-w-0 space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {stats.total} Student Reviews
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculated from verified enrollments across Classes 9th-12th
              </p>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{stats.positivePercent}% Positive Satisfaction</span>
              </div>
            </div>
          </div>

          {/* 5-Star Distribution Bars (Clickable to Filter) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#1e2c4c]">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.counts[stars] || 0;
              const percent = stats.percentages[stars] || 0;
              const isSelected = selectedRating === stars;

              return (
                <div
                  key={stars}
                  onClick={() => setSelectedRating(isSelected ? 'all' : stars)}
                  className={`flex items-center gap-2.5 text-xs p-1.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-[#14203a]'
                  }`}
                  title={`Filter by ${stars} Stars`}
                >
                  <div className="flex items-center gap-1 w-14 shrink-0 text-slate-600 dark:text-slate-300 font-semibold">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>

                  <div className="flex-1 bg-slate-100 dark:bg-[#0b1329] h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stars >= 4
                          ? 'bg-amber-400'
                          : stars === 3
                          ? 'bg-blue-400'
                          : 'bg-rose-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="w-16 text-right text-[11px] text-slate-400 font-medium shrink-0">
                    {percent}% ({count})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Admin Insights & Performance Metrics */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-[#1e2c4c] pb-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Performance Benchmarks
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c] text-center">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Overall Rating</div>
              <div className="text-2xl font-extrabold text-blue-500 mt-0.5">4.92</div>
              <span className="text-[10px] text-slate-400">Out of 5.0 (210 reviews)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c] text-center">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Completion Rate</div>
              <div className="text-2xl font-extrabold text-emerald-500 mt-0.5">96.4%</div>
              <span className="text-[10px] text-emerald-500 font-medium">Top 5% among faculty</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c] text-center">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Quiz Pass Ratio</div>
              <div className="text-2xl font-extrabold text-purple-500 mt-0.5">91%</div>
              <span className="text-[10px] text-slate-400">Higher than batch avg</span>
            </div>
          </div>

          {/* Admin Qualitative Insights (Common student messages breakdown) */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <span>What Students Are Saying (Key Feedback Topics)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 text-xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                  👍 Top Praise Themes:
                </span>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Bilingual clarity in Vyakaran, fast doubt resolution in live sessions, board question format tips.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 text-xs">
                <span className="font-bold text-blue-700 dark:text-blue-400 block mb-0.5">
                  💡 Suggestions from Students:
                </span>
                <p className="text-[11px] text-blue-800 dark:text-blue-300">
                  Request for extra 30-min live practice classes on weekends and additional Alankar question sheets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Student Reviews & Realtime Feedback Container Box (Expandable like Assigned Courses) */}
      <div
        className={`bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-2xl shadow-xs transition-all duration-200 ${
          isMaximized
            ? 'fixed inset-4 z-50 overflow-y-auto p-5 sm:p-7 max-w-6xl mx-auto shadow-2xl ring-2 ring-blue-500/50 bg-white dark:bg-[#0c1427]'
            : 'p-4 sm:p-5 space-y-4'
        }`}
      >
        {/* Box Header (Expandable like Assigned Courses box) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-[#1e2c4c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Student Feedback & Reviews Feed
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                  {filteredReviews.length} Reviews
                </span>
                {isLiveActive && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Real-time Stream</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Udemy-style realtime student comments · Top 5 view with instant pagination (5, 10, 20, 30, 40, 50)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Focus / Maximize Full View */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#162238] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title={isMaximized ? 'Exit fullscreen view' : 'Expand feedback box to full screen'}
            >
              {isMaximized ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Exit Focus</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Expand View</span>
                </>
              )}
            </button>

            {/* Expand / Collapse Box Button */}
            <button
              type="button"
              onClick={() => setIsFeedbackBoxExpanded(!isFeedbackBoxExpanded)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 transition-colors cursor-pointer shadow-2xs"
              title={isFeedbackBoxExpanded ? 'Collapse feedback box' : 'Expand feedback box'}
            >
              {isFeedbackBoxExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
                  <span>Collapse Box</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                  <span>Expand Box</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* When Collapsed: Minimal Summary Bar */}
        {!isFeedbackBoxExpanded ? (
          <div
            onClick={() => setIsFeedbackBoxExpanded(true)}
            className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#0b1329] border border-dashed border-slate-300 dark:border-[#1e2c4c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {stats.avg}
                </span>
                <span className="text-[10px] text-slate-400">({reviews.length})</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-700 dark:text-slate-300 truncate">
                  <strong className="text-slate-900 dark:text-white">Latest comment: </strong>
                  {latestStudentReview ? (
                    <span>
                      "{latestStudentReview.comment.slice(0, 85)}..." — <span className="font-semibold text-blue-600 dark:text-blue-400">{latestStudentReview.studentName}</span>
                    </span>
                  ) : (
                    <span>No student comments yet</span>
                  )}
                </p>
                <span className="text-[11px] text-slate-400">
                  Showing top 5 reviews by default with pagination (5, 10, 20, 30, 40, 50) · Click to expand box
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
              <span>Expand Feedback Box</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        ) : (
          /* When Expanded: Full Controls, Spotlight Card, Top 5 Reviews & Pagination */
          <div className="space-y-4">
            {/* Real-time Latest Student Feedback Spotlight Card (Udemy Style) */}
            {latestStudentReview && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-sky-900/10 dark:from-blue-950/40 dark:via-[#131d36] dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/60 shadow-xs space-y-3 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 dark:border-[#1e2c4c] pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Real-time Latest Student Feedback</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-600 text-white animate-pulse">
                          LATEST COMMENT
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Instant insight into what learners are saying right now about {instructor.name}'s classes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>{latestStudentReview.createdAt}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => injectIncomingReview()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-[#162238] border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/40 cursor-pointer shadow-2xs"
                      title="Simulate receiving another live review right now"
                    >
                      <Radio className="w-3 h-3 text-blue-500 animate-ping" />
                      <span>Simulate Incoming Comment</span>
                    </button>
                  </div>
                </div>

                {/* Latest Review Content preview */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-1">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <img
                      src={latestStudentReview.studentAvatar}
                      alt={latestStudentReview.studentName}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-blue-500/40"
                    />
                    <div className="min-w-0 space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {latestStudentReview.studentName}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Verified Learner</span>
                        </span>
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                          {latestStudentReview.courseName} · {latestStudentReview.studentClass}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= latestStudentReview.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">
                          {latestStudentReview.rating}.0
                        </span>
                      </div>

                      <p className="text-xs text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed bg-white/70 dark:bg-[#0b1329]/70 p-2.5 rounded-xl border border-blue-100 dark:border-[#1e2c4c]">
                        "{latestStudentReview.comment}"
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {latestStudentReview.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-[#162238] border border-slate-200/80 dark:border-[#203158] text-slate-600 dark:text-slate-300"
                          >
                            #{tag}
                          </span>
                        ))}
                        {latestStudentReview.sentiment === 'positive' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            Positive Feedback
                          </span>
                        )}
                        {latestStudentReview.sentiment === 'constructive' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                            Constructive Feedback
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search, Course Filter & Sort Bar */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c] space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search student feedback by keywords (e.g. 'vyakaran', 'doubt', 'notes', student name)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-[#111c34] border border-slate-200 dark:border-[#203158] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter by Course */}
                <div className="w-full md:w-56">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-[#111c34] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                  >
                    <option value="all">All Courses & Classes</option>
                    {availableCourses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div className="w-full md:w-44">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="w-full text-xs bg-white dark:bg-[#111c34] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                  >
                    <option value="newest">Most Recent First</option>
                    <option value="highest">Highest Rating (5★)</option>
                    <option value="lowest">Lowest Rating</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                </div>
              </div>

              {/* Filter Badges Pill row */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3" />
                  <span>Rating:</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedRating('all')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedRating === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-[#162238] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  All Ratings ({reviews.length})
                </button>

                {[5, 4, 3, 2, 1].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setSelectedRating(stars)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedRating === stars
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-[#162238] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>({stats.counts[stars] || 0})</span>
                  </button>
                ))}

                {(searchQuery || selectedRating !== 'all' || selectedCourse !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRating('all');
                      setSelectedCourse('all');
                    }}
                    className="text-[11px] text-blue-500 hover:underline font-bold ml-2 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Feed Header with Items Per Page Selector (5, 10, 20, 30, 40, 50) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 px-1 py-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  Showing <strong className="text-slate-900 dark:text-white">{filteredReviews.length === 0 ? 0 : startIndex + 1} - {endIndex}</strong> of{' '}
                  <strong className="text-slate-900 dark:text-white">{filteredReviews.length}</strong> reviews
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-[11px] text-slate-400">
                  Page <strong className="text-slate-700 dark:text-slate-300">{activePage}</strong> of{' '}
                  <strong className="text-slate-700 dark:text-slate-300">{totalPages}</strong>
                </span>
                {isLiveActive && (
                  <span className="flex items-center gap-1.5 text-emerald-500 text-[11px] font-semibold ml-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Live Feed Active</span>
                  </span>
                )}
              </div>

              {/* Quick Page Size Selector Chips [5, 10, 20, 30, 40, 50] */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400">Show per page:</span>
                {pageSizeOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setPageSize(opt);
                      setCurrentPage(1);
                      onShowToast(`Showing top ${opt} feedback reviews per page`, 'info');
                    }}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      pageSize === opt
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1e2c4c]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews Cards List (Sliced to pageSize - default 5) */}
            {filteredReviews.length === 0 ? (
              <div className="bg-slate-50/60 dark:bg-[#0b1329] border border-slate-200/80 dark:border-[#1e2c4c] rounded-2xl p-12 text-center space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No matching student reviews found
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your rating or search keyword filters to view all incoming student feedback.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRating('all');
                    setSelectedCourse('all');
                  }}
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedReviews.map((rev) => {
                  const isReplying = activeReplyBoxId === rev.id;
                  const isExpandedReview = expandedReviewIds[rev.id] ?? false;

                  return (
                    <div
                      key={rev.id}
                      className={`p-4 sm:p-5 rounded-xl bg-slate-50/60 dark:bg-[#0b1329] border transition-all space-y-3 shadow-2xs ${
                        rev.isNew
                          ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/30 dark:bg-blue-950/30 animate-in fade-in duration-300'
                          : 'border-slate-200/70 dark:border-[#1e2c4c] hover:border-blue-400/50'
                      }`}
                    >
                      {/* Header: Student Info + Course + Star Rating + Timestamp */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <img
                            src={rev.studentAvatar}
                            alt={rev.studentName}
                            className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-slate-100 dark:ring-slate-700"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {rev.studentName}
                              </span>
                              {rev.verifiedLearner && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Verified Learner</span>
                                </span>
                              )}
                              {rev.isNew && (
                                <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-600 text-white animate-pulse">
                                  NEW
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {rev.courseName}
                              </span>
                              <span>·</span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-[#162238] text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                {rev.studentClass}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Rating + Time */}
                        <div className="flex items-center sm:items-end flex-col shrink-0 gap-1">
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {rev.rating}.0
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{rev.createdAt}</span>
                          </span>
                        </div>
                      </div>

                      {/* Review Body (Expandable if long) */}
                      <div className="space-y-1.5">
                        {rev.title && (
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            "{rev.title}"
                          </h5>
                        )}
                        <p className={`text-xs text-slate-700 dark:text-slate-300 leading-relaxed ${!isExpandedReview && rev.comment.length > 180 ? 'line-clamp-2' : ''}`}>
                          {rev.comment}
                        </p>
                        {rev.comment.length > 180 && (
                          <button
                            type="button"
                            onClick={() => toggleReviewExpand(rev.id)}
                            className="text-[11px] text-blue-500 hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>{isExpandedReview ? 'Show Less' : 'Read Full Comment'}</span>
                            {isExpandedReview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      {/* Tags & Feedback sentiment */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {rev.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#203158] text-slate-600 dark:text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                        {rev.sentiment === 'positive' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            Positive Sentiment
                          </span>
                        )}
                        {rev.sentiment === 'constructive' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100/70 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                            Constructive Suggestion
                          </span>
                        )}
                      </div>

                      {/* Footer: Helpful upvote + Reply action */}
                      <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-200/60 dark:border-[#1e2c4c]">
                        <div className="flex items-center gap-4">
                          <span className="text-[11px] text-slate-400">Was this review helpful?</span>
                          <button
                            type="button"
                            onClick={() => handleUpvoteHelpful(rev.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 cursor-pointer"
                          >
                            <ThumbsUp className="w-3 h-3 text-slate-400" />
                            <span>Yes ({rev.helpfulCount})</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveReplyBoxId(isReplying ? null : rev.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-400 cursor-pointer"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>{isReplying ? 'Close Reply' : 'Reply to Student'}</span>
                        </button>
                      </div>

                      {/* Existing Replies Thread */}
                      {rev.replies && rev.replies.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-[#1e2c4c]">
                          {rev.replies.map((rep) => (
                            <div
                              key={rep.id}
                              className="p-3 rounded-xl bg-white dark:bg-[#111c34] border border-slate-200/70 dark:border-[#1e2c4c] flex items-start gap-2.5 ml-4 sm:ml-8"
                            >
                              <img
                                src={rep.authorAvatar || instructor.avatar}
                                alt={rep.authorName}
                                className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-blue-500/30"
                              />
                              <div className="min-w-0 space-y-0.5 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    {rep.authorName}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                                    Instructor
                                  </span>
                                  <span className="text-[10px] text-slate-400">{rep.createdAt}</span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {rep.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input Box (Expandable) */}
                      {isReplying && (
                        <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-[#0e172c] border border-blue-200 dark:border-blue-900/60 space-y-2.5 ml-4 sm:ml-8 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                            <span>Post response as {instructor.name} (Faculty):</span>
                            <button
                              onClick={() => setActiveReplyBoxId(null)}
                              className="text-slate-400 hover:text-slate-200"
                            >
                              ✕
                            </button>
                          </div>

                          <textarea
                            rows={2}
                            value={replyTexts[rev.id] || ''}
                            onChange={(e) =>
                              setReplyTexts((prev) => ({ ...prev, [rev.id]: e.target.value }))
                            }
                            placeholder={`Write a thoughtful response to ${rev.studentName}...`}
                            className="w-full text-xs bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />

                          {/* Quick Canned Responses */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-semibold">Quick replies:</span>
                            {[
                              'Thank you! Glad the formula sheet helped.',
                              'Noted! Will review this in Sunday live session.',
                              'Great effort! Keep practicing the questions.',
                            ].map((canned, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() =>
                                  setReplyTexts((prev) => ({
                                    ...prev,
                                    [rev.id]: canned,
                                  }))
                                }
                                className="px-2 py-0.5 rounded text-[10px] bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#203158] text-slate-600 dark:text-slate-300 hover:border-blue-400 cursor-pointer"
                              >
                                "{canned.slice(0, 24)}..."
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setActiveReplyBoxId(null)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePostReply(rev.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer shadow-xs"
                            >
                              <Send className="w-3 h-3" />
                              <span>Post Reply</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Pagination Controls Bar inside the Box */}
            {filteredReviews.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-slate-50/80 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c] rounded-xl shadow-2xs mt-2">
                {/* Left: Showing entries */}
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Showing <strong className="text-slate-800 dark:text-slate-200">{startIndex + 1}</strong> to{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{endIndex}</strong> of{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{filteredReviews.length}</strong> student reviews
                </div>

                {/* Center: Pagination Buttons */}
                <div className="flex items-center gap-1">
                  {/* First Page */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={activePage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1e2c4c] text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors bg-white dark:bg-[#111c34]"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Prev Page */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={activePage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1e2c4c] text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors bg-white dark:bg-[#111c34]"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (totalPages <= 7) return true;
                        if (p === 1 || p === totalPages) return true;
                        return Math.abs(p - activePage) <= 1;
                      })
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showEllipsis = prev && p - prev > 1;

                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && (
                              <span className="px-1 text-xs text-slate-400">...</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(p)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                activePage === p
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#162238] bg-white dark:bg-[#111c34]'
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  {/* Next Page */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={activePage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1e2c4c] text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors bg-white dark:bg-[#111c34]"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={activePage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1e2c4c] text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors bg-white dark:bg-[#111c34]"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Right: Items per page dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Page size:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPageSize(val);
                      setCurrentPage(1);
                      onShowToast(`Displaying top ${val} reviews per page`, 'info');
                    }}
                    className="text-xs font-semibold bg-white dark:bg-[#111c34] border border-slate-200 dark:border-[#203158] rounded-lg px-2.5 py-1 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {pageSizeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt} per page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backdrop for Maximized Focus mode */}
      {isMaximized && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsMaximized(false)}
        />
      )}

      {/* 5. Modal: Add Custom Student Feedback (Testing) */}
      {isAddReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#10192d] border border-slate-200 dark:border-[#1e2c4c] rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e2c4c] pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Test Student Feedback
                </h3>
                <p className="text-xs text-slate-500">
                  Simulate custom student reviews to test real-time feedback ingestion
                </p>
              </div>
              <button
                onClick={() => setIsAddReviewModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomReview} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pooja Agarwal"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Class Level
                  </label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Class 9th">Class 9th</option>
                    <option value="Class 10th">Class 10th</option>
                    <option value="Class 11th">Class 11th</option>
                    <option value="Class 12th">Class 12th</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Star Rating (1 - 5)
                  </label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value={5}>5 Stars (★★★★★)</option>
                    <option value={4}>4 Stars (★★★★☆)</option>
                    <option value={3}>3 Stars (★★★☆☆)</option>
                    <option value={2}>2 Stars (★★☆☆☆)</option>
                    <option value={1}>1 Star (★☆☆☆☆)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Enrolled Course
                </label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Comment / Review *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What is the student saying about the teacher's lectures, notes, or doubt sessions?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vyakaran, Board Exam, Doubt Solving"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#1e2c4c] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddReviewModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer shadow-xs"
                >
                  Submit Realtime Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
