import type { CourseChapter, EnrolledCourse } from '../types';

export function getDefaultChaptersForCourse(courseName: string, progress: number): CourseChapter[] {
  if (courseName.includes('Class 12th') && courseName.includes('PCM')) {
    return [
      {
        id: 'pcm_ch1',
        name: 'Physics: Ray Optics & Optical Instruments',
        subject: 'Physics',
        totalLectures: 6,
        completedLectures: progress > 30 ? 6 : 4,
        status: progress > 30 ? 'Completed' : 'In Progress',
        topics: [
          { id: 't1', title: 'Reflection by Spherical Mirrors', duration: '45 mins', completed: true, score: 90 },
          { id: 't2', title: 'Refraction & Total Internal Reflection', duration: '50 mins', completed: true, score: 85 },
          { id: 't3', title: 'Lenses and Lens Formula', duration: '55 mins', completed: true, score: 88 },
          { id: 't4', title: 'Refraction through a Prism', duration: '40 mins', completed: true, score: 92 },
          { id: 't5', title: 'Optical Instruments (Microscope & Telescope)', duration: '60 mins', completed: progress > 30, score: 86 },
          { id: 't6', title: 'Numerical Problems & Board PYQs', duration: '65 mins', completed: progress > 30, score: 88 },
        ],
      },
      {
        id: 'pcm_ch2',
        name: 'Chemistry: Solutions & Electrochemistry',
        subject: 'Chemistry',
        totalLectures: 6,
        completedLectures: progress >= 40 ? 5 : 2,
        status: progress >= 60 ? 'Completed' : 'In Progress',
        topics: [
          { id: 't7', title: 'Types of Solutions & Raoult’s Law', duration: '45 mins', completed: true, score: 84 },
          { id: 't8', title: 'Colligative Properties & Van’t Hoff Factor', duration: '55 mins', completed: true, score: 80 },
          { id: 't9', title: 'Electrochemical Cells & Nernst Equation', duration: '60 mins', completed: progress >= 40, score: 82 },
          { id: 't10', title: 'Conductance of Electrolytic Solutions', duration: '50 mins', completed: progress >= 40, score: 78 },
          { id: 't11', title: 'Batteries, Fuel Cells and Corrosion', duration: '40 mins', completed: progress >= 50, score: 85 },
          { id: 't12', title: 'NCERT Exemplar Problems Discussion', duration: '60 mins', completed: progress >= 60, score: 80 },
        ],
      },
      {
        id: 'pcm_ch3',
        name: 'Mathematics: Matrices, Determinants & Relations',
        subject: 'Mathematics',
        totalLectures: 7,
        completedLectures: progress > 50 ? 5 : (progress > 20 ? 3 : 1),
        status: progress > 60 ? 'Completed' : 'In Progress',
        topics: [
          { id: 't13', title: 'Types of Relations & Equivalence Relations', duration: '50 mins', completed: true, score: 92 },
          { id: 't14', title: 'Operations on Matrices & Invertible Matrices', duration: '55 mins', completed: progress > 20, score: 88 },
          { id: 't15', title: 'Properties of Determinants & Adjoint', duration: '60 mins', completed: progress > 35, score: 84 },
          { id: 't16', title: 'System of Linear Equations (Matrix Method)', duration: '65 mins', completed: progress > 45, score: 86 },
          { id: 't17', title: 'Continuity at a Point and in an Interval', duration: '50 mins', completed: progress > 55, score: 79 },
          { id: 't18', title: 'Differentiability & Chain Rule Problems', duration: '60 mins', completed: progress > 70, score: 82 },
          { id: 't19', title: 'Unit Test-1 & Revision Questions', duration: '45 mins', completed: progress > 80, score: 90 },
        ],
      },
      {
        id: 'pcm_ch4',
        name: 'Mathematics: Integrals & Differential Equations',
        subject: 'Mathematics',
        totalLectures: 8,
        completedLectures: progress >= 75 ? 6 : (progress >= 50 ? 3 : 0),
        status: progress >= 75 ? 'In Progress' : 'Pending',
        topics: [
          { id: 't20', title: 'Indefinite Integrals by Substitution', duration: '55 mins', completed: progress >= 50 },
          { id: 't21', title: 'Integration by Partial Fractions', duration: '50 mins', completed: progress >= 60 },
          { id: 't22', title: 'Integration by Parts', duration: '60 mins', completed: progress >= 70 },
          { id: 't23', title: 'Definite Integrals & Properties', duration: '65 mins', completed: progress >= 80 },
          { id: 't24', title: 'Differential Equations: Order and Degree', duration: '45 mins', completed: progress >= 85 },
          { id: 't25', title: 'Separable Variable & Homogeneous Equations', duration: '60 mins', completed: progress >= 90 },
          { id: 't26', title: 'Linear Differential Equations', duration: '50 mins', completed: progress >= 95 },
          { id: 't27', title: 'Comprehensive Mock Exam on Calculus', duration: '90 mins', completed: progress >= 98 },
        ],
      },
      {
        id: 'pcm_ch5',
        name: 'Physics: Electrostatics & Current Electricity',
        subject: 'Physics',
        totalLectures: 6,
        completedLectures: progress >= 80 ? 6 : (progress >= 40 ? 3 : 0),
        status: progress >= 80 ? 'Completed' : (progress >= 40 ? 'In Progress' : 'Pending'),
        topics: [
          { id: 't28', title: 'Coulomb’s Law & Electric Field', duration: '50 mins', completed: progress >= 40 },
          { id: 't29', title: 'Electric Flux and Gauss’s Law', duration: '60 mins', completed: progress >= 40 },
          { id: 't30', title: 'Electrostatic Potential & Capacitance', duration: '55 mins', completed: progress >= 50 },
          { id: 't31', title: 'Ohm’s Law & Kirchhoff’s Rules', duration: '60 mins', completed: progress >= 70 },
          { id: 't32', title: 'Wheatstone Bridge & Potentiometer', duration: '55 mins', completed: progress >= 80 },
          { id: 't33', title: 'Chapter Assessment & Formula Sheet', duration: '40 mins', completed: progress >= 85 },
        ],
      },
    ];
  }

  if (courseName.includes('Class 10th')) {
    return [
      {
        id: 'c10_ch1',
        name: 'Mathematics: Real Numbers & Polynomials',
        subject: 'Mathematics',
        totalLectures: 6,
        completedLectures: progress > 20 ? 6 : 3,
        status: progress > 20 ? 'Completed' : 'In Progress',
        topics: [
          { id: 't1', title: 'Fundamental Theorem of Arithmetic', duration: '40 mins', completed: true, score: 95 },
          { id: 't2', title: 'Revisiting Irrational Numbers (Proof by Contradiction)', duration: '45 mins', completed: true, score: 90 },
          { id: 't3', title: 'Geometrical Meaning of Zeroes of a Polynomial', duration: '40 mins', completed: true, score: 88 },
          { id: 't4', title: 'Relationship between Zeroes and Coefficients', duration: '50 mins', completed: true, score: 92 },
          { id: 't5', title: 'Division Algorithm & Higher Degree Polynomials', duration: '45 mins', completed: progress > 20, score: 86 },
          { id: 't6', title: 'Board Exam Past 5-Year Questions Discussion', duration: '50 mins', completed: progress > 20, score: 94 },
        ],
      },
      {
        id: 'c10_ch2',
        name: 'Science: Chemical Reactions & Equations',
        subject: 'Science',
        totalLectures: 5,
        completedLectures: progress > 40 ? 5 : (progress > 15 ? 3 : 1),
        status: progress > 40 ? 'Completed' : 'In Progress',
        topics: [
          { id: 't7', title: 'Writing & Balancing Chemical Equations', duration: '45 mins', completed: true, score: 88 },
          { id: 't8', title: 'Combination and Decomposition Reactions', duration: '45 mins', completed: true, score: 85 },
          { id: 't9', title: 'Displacement and Double Displacement Reactions', duration: '50 mins', completed: progress > 15, score: 82 },
          { id: 't10', title: 'Oxidation, Reduction, Corrosion & Rancidity', duration: '40 mins', completed: progress > 30, score: 89 },
          { id: 't11', title: 'Laboratory Activity Video & MCQs Test', duration: '45 mins', completed: progress > 40, score: 91 },
        ],
      },
      {
        id: 'c10_ch3',
        name: 'Science: Life Processes & Control-Coordination',
        subject: 'Science',
        totalLectures: 7,
        completedLectures: progress >= 60 ? 7 : (progress >= 30 ? 4 : 2),
        status: progress >= 60 ? 'Completed' : 'In Progress',
        topics: [
          { id: 't12', title: 'Autotrophic & Heterotrophic Nutrition', duration: '50 mins', completed: true, score: 90 },
          { id: 't13', title: 'Human Digestive System with Diagram', duration: '55 mins', completed: true, score: 92 },
          { id: 't14', title: 'Respiration in Plants and Animals', duration: '45 mins', completed: progress >= 30, score: 85 },
          { id: 't15', title: 'Transportation in Human Beings (Heart & Blood)', duration: '60 mins', completed: progress >= 40, score: 88 },
          { id: 't16', title: 'Excretion in Human Beings and Nephron Structure', duration: '50 mins', completed: progress >= 50, score: 86 },
          { id: 't17', title: 'Nervous System & Reflex Arc', duration: '55 mins', completed: progress >= 60, score: 84 },
          { id: 't18', title: 'Hormones in Animals & Endocrine Glands', duration: '45 mins', completed: progress >= 65, score: 88 },
        ],
      },
      {
        id: 'c10_ch4',
        name: 'Mathematics: Quadratic Equations & Triangles',
        subject: 'Mathematics',
        totalLectures: 6,
        completedLectures: progress >= 75 ? 6 : (progress >= 50 ? 3 : 0),
        status: progress >= 75 ? 'Completed' : (progress >= 50 ? 'In Progress' : 'Pending'),
        topics: [
          { id: 't19', title: 'Standard Form & Factorisation Method', duration: '45 mins', completed: progress >= 50 },
          { id: 't20', title: 'Nature of Roots & Discriminant Formula', duration: '50 mins', completed: progress >= 55 },
          { id: 't21', title: 'Real-Life Word Problems on Quadratic Equations', duration: '55 mins', completed: progress >= 65 },
          { id: 't22', title: 'Similar Figures & Basic Proportionality Theorem (BPT)', duration: '60 mins', completed: progress >= 70 },
          { id: 't23', title: 'Criteria for Similarity of Triangles (AAA, SSS, SAS)', duration: '55 mins', completed: progress >= 75 },
          { id: 't24', title: 'Chapter Mastery Test & Assessment', duration: '50 mins', completed: progress >= 80 },
        ],
      },
      {
        id: 'c10_ch5',
        name: 'Science: Light - Reflection and Refraction',
        subject: 'Science',
        totalLectures: 6,
        completedLectures: progress >= 85 ? 6 : 0,
        status: progress >= 85 ? 'Completed' : 'Pending',
        topics: [
          { id: 't25', title: 'Spherical Mirrors & Ray Diagrams for Concave Mirror', duration: '50 mins', completed: progress >= 85 },
          { id: 't26', title: 'Mirror Formula and Magnification Numericals', duration: '55 mins', completed: progress >= 85 },
          { id: 't27', title: 'Refraction of Light & Laws of Refraction', duration: '45 mins', completed: progress >= 90 },
          { id: 't28', title: 'Refraction by Spherical Lenses & Ray Diagrams', duration: '50 mins', completed: progress >= 90 },
          { id: 't29', title: 'Lens Formula, Magnification & Power of a Lens', duration: '55 mins', completed: progress >= 95 },
          { id: 't30', title: 'Full Length Pre-Board Science Mock Test', duration: '90 mins', completed: progress >= 98 },
        ],
      },
    ];
  }

  const completedCh = Math.max(1, Math.round((progress / 100) * 5));
  return [
    {
      id: 'gen_ch1',
      name: 'Foundation Concepts & Core Principles',
      subject: 'Core Module',
      totalLectures: 5,
      completedLectures: progress > 15 ? 5 : 3,
      status: progress > 15 ? 'Completed' : 'In Progress',
      topics: [
        { id: 't1', title: 'Unit Introduction & Fundamental Definitions', duration: '45 mins', completed: true, score: 92 },
        { id: 't2', title: 'Conceptual Framework & Practical Illustrations', duration: '50 mins', completed: true, score: 86 },
        { id: 't3', title: 'Textbook Exercises & Standard Problems', duration: '55 mins', completed: progress > 10, score: 88 },
        { id: 't4', title: 'Doubt Clearing & Numerical Worksheets', duration: '40 mins', completed: progress > 15, score: 90 },
        { id: 't5', title: 'Foundation Milestone Quiz', duration: '35 mins', completed: progress > 15, score: 94 },
      ],
    },
    {
      id: 'gen_ch2',
      name: 'Intermediate Applications & Problem Solving',
      subject: 'Applied Module',
      totalLectures: 6,
      completedLectures: progress >= 40 ? 5 : (progress >= 20 ? 3 : 1),
      status: progress >= 50 ? 'Completed' : 'In Progress',
      topics: [
        { id: 't6', title: 'Detailed Analysis of Advanced Models', duration: '50 mins', completed: true, score: 85 },
        { id: 't7', title: 'Case Studies & Practical Applications', duration: '55 mins', completed: progress >= 20, score: 82 },
        { id: 't8', title: 'Formula Derivations & Step-by-Step Proofs', duration: '60 mins', completed: progress >= 30, score: 84 },
        { id: 't9', title: 'Previous Years Board Exam Papers', duration: '50 mins', completed: progress >= 40, score: 88 },
        { id: 't10', title: 'Assignment Submission & Assessment', duration: '45 mins', completed: progress >= 45, score: 89 },
        { id: 't11', title: 'Comprehensive Unit Test', duration: '60 mins', completed: progress >= 50, score: 87 },
      ],
    },
    {
      id: 'gen_ch3',
      name: 'Advanced Theories & Exam Preparations',
      subject: 'Exam Preparation',
      totalLectures: 6,
      completedLectures: progress >= 70 ? 6 : (progress >= 40 ? 3 : 0),
      status: progress >= 70 ? 'Completed' : (progress >= 40 ? 'In Progress' : 'Pending'),
      topics: [
        { id: 't12', title: 'High-Weightage Chapters Revision', duration: '55 mins', completed: progress >= 40 },
        { id: 't13', title: 'Critical Thinking & HOTS Questions', duration: '50 mins', completed: progress >= 50 },
        { id: 't14', title: 'Common Mistakes & Examiner Tips', duration: '45 mins', completed: progress >= 60 },
        { id: 't15', title: 'Sample Paper Section-wise Time Management', duration: '60 mins', completed: progress >= 70 },
        { id: 't16', title: 'Full Course Mid-Term Evaluation', duration: '90 mins', completed: progress >= 75 },
        { id: 't17', title: 'One-on-One Performance Review', duration: '30 mins', completed: progress >= 80 },
      ],
    },
    {
      id: 'gen_ch4',
      name: 'Board Mock Series & Final Review',
      subject: 'Mock Examinations',
      totalLectures: 5,
      completedLectures: progress >= 90 ? 5 : (progress >= 75 ? 2 : 0),
      status: progress >= 90 ? 'Completed' : (progress >= 75 ? 'In Progress' : 'Pending'),
      topics: [
        { id: 't18', title: 'All-India Board Pattern Mock Test 1', duration: '180 mins', completed: progress >= 75 },
        { id: 't19', title: 'Detailed Video Solutions & Answer Key', duration: '60 mins', completed: progress >= 80 },
        { id: 't20', title: 'All-India Board Pattern Mock Test 2', duration: '180 mins', completed: progress >= 85 },
        { id: 't21', title: 'Formula Masterclass & Quick Revision Notes', duration: '50 mins', completed: progress >= 90 },
        { id: 't22', title: 'Final Certification & Course Completion', duration: '30 mins', completed: progress >= 95 },
      ],
    },
  ];
}

export function buildEnrolledCourseWithStats(
  base: {
    id: string;
    name: string;
    status: 'Active' | 'Completed' | 'Expired';
    enrolledAt: string;
    endsAt: string;
    category?: string;
    progress?: number;
  }
): EnrolledCourse {
  const progress = base.progress ?? 0;
  const chapters = getDefaultChaptersForCourse(base.name, progress);

  const totalLectures = chapters.reduce((sum, ch) => sum + ch.totalLectures, 0);
  const completedLectures = chapters.reduce((sum, ch) => sum + ch.completedLectures, 0);
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter((ch) => ch.status === 'Completed').length;
  const totalAssignments = totalChapters;
  const completedAssignments = Math.min(totalAssignments, Math.round((progress / 100) * totalAssignments));

  return {
    ...base,
    progress,
    totalChapters,
    completedChapters,
    totalLectures,
    completedLectures,
    totalAssignments,
    completedAssignments,
    averageScore: progress > 0 ? Math.min(96, Math.max(68, 70 + Math.round((progress / 100) * 25))) : 0,
    chapters,
  };
}