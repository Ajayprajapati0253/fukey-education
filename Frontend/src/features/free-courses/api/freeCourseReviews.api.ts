import type { FreeCourseReview } from '../types/free-course-review.types';

const REVIEWS_STORAGE_KEY = 'fukey_free_course_reviews_v1';

const INITIAL_REVIEWS: FreeCourseReview[] = [
  {
    id: 'rev-1',
    courseId: 'fc-101',
    courseTitle: 'Class 9 Science Foundation (Hindi Medium)',
    targetClass: 'Class 9',
    subject: 'Science',
    studentName: 'Aditya Raj',
    studentEmail: 'aditya.raj9@gmail.com',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'The physics animated lectures and Hindi notes are pure gold! Helped me score 94% in my term exams.',
    date: '01 Oct, 2026 10:15 AM',
    status: 'Approved',
    adminReply: {
      message: 'Thank you so much Aditya! Keep practicing with the Chapter 2 DPP sheets as well. Proud of your 94% score!',
      repliedAt: '01 Oct, 2026 11:30 AM',
      repliedBy: 'Fukey Education Admin',
    },
  },
  {
    id: 'rev-2',
    courseId: 'fc-102',
    courseTitle: 'Class 10 Mathematics Board Booster Series',
    targetClass: 'Class 10',
    subject: 'Mathematics',
    studentName: 'Pooja Kashyap',
    studentEmail: 'pooja.kashyap@yahoo.com',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Sir explains trigonometry so clearly. Best free course for CBSE board exams.',
    date: '30 Sep, 2026 04:20 PM',
    status: 'Approved',
    adminReply: {
      message: 'Glad to hear that Pooja! Next week we are streaming a live doubt session on Heights and Distances.',
      repliedAt: '30 Sep, 2026 06:00 PM',
      repliedBy: 'Pawan Gupta (Instructor)',
    },
  },
  {
    id: 'rev-3',
    courseId: 'fc-106',
    courseTitle: 'Class 11 Computer Science: Python Fundamentals',
    targetClass: 'Class 11',
    subject: 'Computer Science',
    studentName: 'Mohammed Faizan',
    studentEmail: 'faizan.dev@outlook.com',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    rating: 4,
    comment: 'Very good coding examples. Would love more practice question sets on nested loops and tuples.',
    date: '28 Sep, 2026 08:45 PM',
    status: 'Approved',
  },
  {
    id: 'rev-4',
    courseId: 'fc-104',
    courseTitle: 'Class 12 Organic Chemistry Mechanisms Mastery',
    targetClass: 'Class 12',
    subject: 'Chemistry',
    studentName: 'Riya Sen',
    studentEmail: 'riya.sen2008@gmail.com',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Electrophilic addition reactions were very difficult for me, but the mind maps cleared everything in one hour!',
    date: '27 Sep, 2026 02:10 PM',
    status: 'Approved',
    adminReply: {
      message: 'Great job Riya! Make sure to also check the Biomolecules quick revision sheet uploaded in Module 3.',
      repliedAt: '27 Sep, 2026 05:15 PM',
      repliedBy: 'Dr. Priya Sharma',
    },
  },
  {
    id: 'rev-5',
    courseId: 'fc-103',
    courseTitle: 'Class 11 Physics: Mechanics & Laws of Motion',
    targetClass: 'Class 11',
    subject: 'Physics',
    studentName: 'Kunal Sharma',
    studentEmail: 'kunal.sharma@gmail.com',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    rating: 4,
    comment: 'Newton Laws of Motion video demonstrations are super interactive. Can you please add audio in pure Hindi as well?',
    date: '25 Sep, 2026 11:00 AM',
    status: 'Pending',
  },
  {
    id: 'rev-6',
    courseId: 'fc-107',
    courseTitle: 'Class 10 Social Science: Rapid Map & History Crash Course',
    targetClass: 'Class 10',
    subject: 'Social Science',
    studentName: 'Divya Prakash',
    studentEmail: 'divya.p@gmail.com',
    studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Map pointing tricks are brilliant! Guaranteed 5 marks saved in board exams.',
    date: '22 Sep, 2026 09:30 AM',
    status: 'Approved',
  },
  {
    id: 'rev-7',
    courseId: 'fc-105',
    courseTitle: 'Class 9 English Grammar, Writing & Reading Skills',
    targetClass: 'Class 9',
    subject: 'English',
    studentName: 'Harsh Vardhan',
    studentEmail: 'harsh.v@gmail.com',
    studentAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Letter writing templates and formal notice rules are very clear and easy to memorize.',
    date: '20 Sep, 2026 03:15 PM',
    status: 'Approved',
  },
  {
    id: 'rev-8',
    courseId: 'fc-108',
    courseTitle: 'Class 12 Biology: Genetics & Molecular Basis of Inheritance',
    targetClass: 'Class 12',
    subject: 'Biology',
    studentName: 'Simran Kaur',
    studentEmail: 'simran.kaur@yahoo.com',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    rating: 3,
    comment: 'DNA replication diagrams are nice, but video was buffering on 3G connection.',
    date: '18 Sep, 2026 01:40 PM',
    status: 'Pending',
  },
];

const getStoredReviews = (): FreeCourseReview[] => {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_REVIEWS;
  }
};

const saveStoredReviews = (reviews: FreeCourseReview[]) => {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed to save reviews to localStorage', e);
  }
};

export const freeCourseReviewsApi = {
  async getReviews(): Promise<FreeCourseReview[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return getStoredReviews();
  },

  async createReview(
    reviewData: Omit<FreeCourseReview, 'id' | 'date'>
  ): Promise<FreeCourseReview> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const reviews = getStoredReviews();
    const newRev: FreeCourseReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: 'Just now',
    };
    reviews.unshift(newRev);
    saveStoredReviews(reviews);
    return newRev;
  },

  async updateReview(
    id: string,
    updates: Partial<FreeCourseReview>
  ): Promise<FreeCourseReview> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const reviews = getStoredReviews();
    const idx = reviews.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Review not found');

    reviews[idx] = { ...reviews[idx], ...updates };
    saveStoredReviews(reviews);
    return reviews[idx];
  },

  async deleteReview(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const reviews = getStoredReviews();
    const filtered = reviews.filter((r) => r.id !== id);
    saveStoredReviews(filtered);
    return true;
  },

  async replyToReview(
    id: string,
    replyMessage: string,
    repliedBy = 'Fukey Education Admin'
  ): Promise<FreeCourseReview> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const reviews = getStoredReviews();
    const review = reviews.find((r) => r.id === id);
    if (!review) throw new Error('Review not found');

    review.adminReply = {
      message: replyMessage,
      repliedAt: 'Just now',
      repliedBy,
    };
    saveStoredReviews(reviews);
    return review;
  },

  async deleteReply(id: string): Promise<FreeCourseReview> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const reviews = getStoredReviews();
    const review = reviews.find((r) => r.id === id);
    if (!review) throw new Error('Review not found');

    delete review.adminReply;
    saveStoredReviews(reviews);
    return review;
  },

  async toggleStatus(
    id: string,
    status: 'Approved' | 'Pending' | 'Hidden'
  ): Promise<FreeCourseReview> {
    return this.updateReview(id, { status });
  },
};
