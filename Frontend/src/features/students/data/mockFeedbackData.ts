import type { StudentCourseFeedback, ImprovementLevel, CourseFeedbackSummary } from '../types';

export const MOCK_STUDENTS_FEEDBACK: Record<string, StudentCourseFeedback[]> = {
  '1': [
    {
      id: 'fb-101',
      studentId: '1',
      studentName: 'Rohit Jain',
      courseId: 'c1_2',
      courseName: 'Class 10th (Maths & Science)',
      subject: 'Mathematics',
      message: 'Need more practice questions and step-by-step solutions after each chapter.',
      rating: 4,
      submittedAt: '20 Sep 2026',
      status: 'Reviewed',
      category: 'Practice Material',
      needsImprovement: false,
      adminNotes: 'Content team notified to add 15 additional quadratic equation practice problems.',
    },
    {
      id: 'fb-102',
      studentId: '1',
      studentName: 'Rohit Jain',
      courseId: 'c1_2',
      courseName: 'Class 10th (Maths & Science)',
      subject: 'Science',
      message: 'Teacher explanation is good but recorded videos should be shorter and more focused on key formulas.',
      rating: 3,
      submittedAt: '18 Sep 2026',
      status: 'Action Taken',
      category: 'Lecture Quality',
      needsImprovement: true,
      adminNotes: 'Feedback shared with Physics faculty. Summary timestamps added to video player.',
    },
    {
      id: 'fb-103',
      studentId: '1',
      studentName: 'Rohit Jain',
      courseId: 'c1_2',
      courseName: 'Class 10th (Maths & Science)',
      subject: 'Mathematics',
      message: 'Recorded lectures are helpful for trigonometry and coordinate geometry revision. Weekly quizzes are good.',
      rating: 5,
      submittedAt: '15 Sep 2026',
      status: 'Reviewed',
      category: 'Curriculum',
      needsImprovement: false,
    },
    {
      id: 'fb-104',
      studentId: '1',
      studentName: 'Rohit Jain',
      courseId: 'c1_1',
      courseName: 'Class 10th (All Subjects)',
      subject: 'Social Science',
      message: 'Need more previous year question papers and map work practice worksheets before monthly test.',
      rating: 4,
      submittedAt: '10 Sep 2026',
      status: 'Pending',
      category: 'Practice Material',
      needsImprovement: false,
      adminNotes: 'Assigned to SST coordinator to upload 2025 board sample papers.',
    },
  ],
  '2': [
    {
      id: 'fb-201',
      studentId: '2',
      studentName: 'Pooja Sharma',
      courseId: 'c2_1',
      courseName: 'Class 12th (Science - PCM)',
      subject: 'Physics',
      message: 'Derivations in Electrostatics need more visual diagrams and animations.',
      rating: 3,
      submittedAt: '22 Sep 2026',
      status: 'Under Review',
      category: 'Lecture Quality',
      needsImprovement: true,
      adminNotes: 'Graphic animations request sent to media production team.',
    },
    {
      id: 'fb-202',
      studentId: '2',
      studentName: 'Pooja Sharma',
      courseId: 'c2_1',
      courseName: 'Class 12th (Science - PCM)',
      subject: 'Mathematics',
      message: 'Calculus problem sessions and live doubt clearing were extremely helpful.',
      rating: 5,
      submittedAt: '17 Sep 2026',
      status: 'Reviewed',
      category: 'Curriculum',
      needsImprovement: false,
    },
    {
      id: 'fb-203',
      studentId: '2',
      studentName: 'Pooja Sharma',
      courseId: 'c2_2',
      courseName: 'Class 12th (Science - PCB)',
      subject: 'Biology',
      message: 'NCERT line-by-line highlights and flashcards are great for memorizing genetics terms.',
      rating: 5,
      submittedAt: '12 Sep 2026',
      status: 'Reviewed',
      category: 'Practice Material',
      needsImprovement: false,
    },
  ],
  '3': [
    {
      id: 'fb-301',
      studentId: '3',
      studentName: 'Aman Kumar',
      courseId: 'c3_1',
      courseName: 'Class 9th (All Subjects)',
      subject: 'English',
      message: 'Grammar practice tests and essay writing templates are very effective.',
      rating: 5,
      submittedAt: '21 Sep 2026',
      status: 'Reviewed',
      category: 'Curriculum',
      needsImprovement: false,
    },
    {
      id: 'fb-302',
      studentId: '3',
      studentName: 'Aman Kumar',
      courseId: 'c3_2',
      courseName: 'Class 9th (Science & Maths)',
      subject: 'Science',
      message: 'Chemistry chemical equation balancing section is explained very clearly.',
      rating: 5,
      submittedAt: '14 Sep 2026',
      status: 'Reviewed',
      category: 'Lecture Quality',
      needsImprovement: false,
    },
  ],
  '4': [
    {
      id: 'fb-401',
      studentId: '4',
      studentName: 'Sneha Patel',
      courseId: 'c4_1',
      courseName: 'Class 11th (Science - PCB)',
      subject: 'Biology',
      message: 'Need PDF summaries of plant physiology chapters for quick revision before exams.',
      rating: 4,
      submittedAt: '19 Sep 2026',
      status: 'Action Taken',
      category: 'Practice Material',
      needsImprovement: false,
      adminNotes: 'Uploaded 1-page cheat sheet in course resources.',
    },
    {
      id: 'fb-402',
      studentId: '4',
      studentName: 'Sneha Patel',
      courseId: 'c4_2',
      courseName: 'Class 11th (Science - PCM)',
      subject: 'Chemistry',
      message: 'Organic chemistry reaction mechanisms audio was muffled in lecture 4.',
      rating: 2,
      submittedAt: '16 Sep 2026',
      status: 'Action Taken',
      category: 'Lecture Quality',
      needsImprovement: true,
      adminNotes: 'Audio remastered and re-uploaded on 18 Sep 2026.',
    },
    {
      id: 'fb-403',
      studentId: '4',
      studentName: 'Sneha Patel',
      courseId: 'c4_1',
      courseName: 'Class 11th (Science - PCB)',
      subject: 'Physics',
      message: 'Units and measurements assignment auto-grading had one incorrect question key.',
      rating: 3,
      submittedAt: '09 Sep 2026',
      status: 'Reviewed',
      category: 'Assessments',
      needsImprovement: true,
      adminNotes: 'Question 7 answer key corrected in question bank.',
    },
  ],
  '5': [
    {
      id: 'fb-501',
      studentId: '5',
      studentName: 'Vikash Singh',
      courseId: 'c5_1',
      courseName: 'Class 11th (Commerce)',
      subject: 'Accountancy',
      message: 'Financial statements ledger posting is challenging, please provide more solved examples.',
      rating: 3,
      submittedAt: '24 Sep 2026',
      status: 'Pending',
      category: 'Curriculum',
      needsImprovement: true,
      adminNotes: 'Requested faculty to schedule extra doubt resolution session.',
    },
    {
      id: 'fb-502',
      studentId: '5',
      studentName: 'Vikash Singh',
      courseId: 'c5_1',
      courseName: 'Class 11th (Commerce)',
      subject: 'Business Studies',
      message: 'Case studies analysis format is clear and easy to understand.',
      rating: 4,
      submittedAt: '18 Sep 2026',
      status: 'Reviewed',
      category: 'Curriculum',
      needsImprovement: false,
    },
  ],
  '8': [
    {
      id: 'fb-801',
      studentId: '8',
      studentName: 'Priya Kumari',
      courseId: 'c8_1',
      courseName: 'Class 12th (Commerce)',
      subject: 'Economics',
      message: 'Macroeconomics national income calculation lecture is difficult to grasp.',
      rating: 2,
      submittedAt: '23 Sep 2026',
      status: 'Under Review',
      category: 'Curriculum',
      needsImprovement: true,
      adminNotes: 'Follow-up call with mentor scheduled.',
    },
    {
      id: 'fb-802',
      studentId: '8',
      studentName: 'Priya Kumari',
      courseId: 'c8_2',
      courseName: 'Class 12th (Arts / Humanities)',
      subject: 'History',
      message: 'Timeline charts and chapter quizzes are very interactive and engaging.',
      rating: 4,
      submittedAt: '15 Sep 2026',
      status: 'Reviewed',
      category: 'Practice Material',
      needsImprovement: false,
    },
  ],
};

export function getStudentFeedback(studentId: string, studentName?: string, courseNames?: string[]): StudentCourseFeedback[] {
  if (MOCK_STUDENTS_FEEDBACK[studentId]) {
    return MOCK_STUDENTS_FEEDBACK[studentId];
  }

  const courses = courseNames && courseNames.length > 0 ? courseNames : ['Class 10th (All Subjects)'];
  const name = studentName || 'Student';

  const generated: StudentCourseFeedback[] = [
    {
      id: `fb-gen-${studentId}-1`,
      studentId,
      studentName: name,
      courseId: 'cg_1',
      courseName: courses[0] || 'Class 10th (All Subjects)',
      subject: 'Core Subject',
      message: 'The lecture explanations are structured well and follow NCERT syllabus closely.',
      rating: 4,
      submittedAt: '16 Sep 2026',
      status: 'Reviewed',
      category: 'Lecture Quality',
      needsImprovement: false,
    },
    {
      id: `fb-gen-${studentId}-2`,
      studentId,
      studentName: name,
      courseId: 'cg_2',
      courseName: courses[1] || courses[0] || 'Class 10th (All Subjects)',
      subject: 'Supplementary Subject',
      message: 'Need additional practice questions for weekend self-assessment.',
      rating: 4,
      submittedAt: '12 Sep 2026',
      status: 'Pending',
      category: 'Practice Material',
      needsImprovement: false,
    },
  ];

  return generated;
}

export function calculateImprovementNeeded(feedbacks: StudentCourseFeedback[]): {
  level: ImprovementLevel;
  badgeVariant: 'success' | 'warning' | 'danger';
  reason: string;
  issueCount: number;
  criticalCourses: string[];
} {
  if (!feedbacks || feedbacks.length === 0) {
    return {
      level: 'Low',
      badgeVariant: 'success',
      reason: 'No negative feedback submitted.',
      issueCount: 0,
      criticalCourses: [],
    };
  }

  const issueFeedbacks = feedbacks.filter((fb) => (fb.rating !== undefined && fb.rating <= 3) || fb.needsImprovement);
  const issueCount = issueFeedbacks.length;
  const criticalCourses = Array.from(new Set(issueFeedbacks.map((fb) => fb.courseName)));

  if (issueCount >= 2 || (issueCount / feedbacks.length >= 0.4 && issueCount > 0)) {
    return {
      level: 'High',
      badgeVariant: 'danger',
      reason: `${issueCount} feedback messages flagged issues in: ${criticalCourses.join(', ')}`,
      issueCount,
      criticalCourses,
    };
  }

  if (issueCount === 1) {
    return {
      level: 'Medium',
      badgeVariant: 'warning',
      reason: `1 feedback message indicates improvement needed in ${criticalCourses[0] || 'course'} (Rating: ${issueFeedbacks[0]?.rating || 3}/5)`,
      issueCount,
      criticalCourses,
    };
  }

  return {
    level: 'Low',
    badgeVariant: 'success',
    reason: `All ${feedbacks.length} feedback messages have positive ratings (≥ 4/5).`,
    issueCount: 0,
    criticalCourses: [],
  };
}

export function getCourseFeedbackSummaries(feedbacks: StudentCourseFeedback[]): CourseFeedbackSummary[] {
  const map: Record<string, { count: number; totalRating: number; ratedCount: number; improvementCount: number }> = {};

  feedbacks.forEach((fb) => {
    if (!map[fb.courseName]) {
      map[fb.courseName] = { count: 0, totalRating: 0, ratedCount: 0, improvementCount: 0 };
    }
    map[fb.courseName].count++;
    if (fb.rating) {
      map[fb.courseName].totalRating += fb.rating;
      map[fb.courseName].ratedCount++;
    }
    if ((fb.rating && fb.rating <= 3) || fb.needsImprovement) {
      map[fb.courseName].improvementCount++;
    }
  });

  return Object.keys(map).map((courseName) => {
    const item = map[courseName];
    return {
      courseName,
      count: item.count,
      averageRating: item.ratedCount > 0 ? parseFloat((item.totalRating / item.ratedCount).toFixed(1)) : 0,
      improvementCount: item.improvementCount,
    };
  });
}