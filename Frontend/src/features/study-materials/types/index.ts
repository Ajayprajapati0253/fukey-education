export type MaterialType =
  | 'overview'
  | 'notes'
  | 'practice-questions'
  | 'formula-sheets'
  | 'mcq'
  | 'important-questions'
  | 'sample-papers'
  | 'test-series'
  | 'question-bank';

export type MaterialStatus = 'published' | 'draft' | 'archived';

export type DifficultyLevel = 'All' | 'Easy' | 'Medium' | 'Hard';

export interface StudyMaterialItem {
  id: string;
  title: string;
  type: MaterialType;
  subject: string;
  grade: string; // e.g. "Class 10", "Class 11", "Class 12", "Competitive - JEE/NEET"
  chapter: string;
  topic?: string;
  description: string;
  fileName: string;
  fileSize: string; // e.g. "4.2 MB"
  fileFormat: 'pdf' | 'docx' | 'zip' | 'quiz' | 'json';
  fileUrl?: string;
  thumbnailUrl?: string; // Cover / preview thumbnail image
  downloadCount: number;
  viewCount: number;
  status: MaterialStatus;
  isImportant?: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  
  // Specific fields for different material types
  questionsCount?: number;
  durationMinutes?: number;
  totalMarks?: number;
  passingMarks?: number;
  difficulty?: DifficultyLevel;
  hasSolution: boolean;
  solutionFileName?: string;
  academicYear?: string;
}

export interface MaterialFilterState {
  searchQuery: string;
  type?: MaterialType | 'all';
  subject: string;
  grade: string;
  status: MaterialStatus | 'all';
  difficulty: DifficultyLevel;
  sortBy: 'order' | 'title' | 'updatedAt' | 'createdAt' | 'downloads' | 'views';
  sortOrder: 'asc' | 'desc';
  showArchived: boolean;
}

export type MaterialFormData = Omit<
  StudyMaterialItem,
  'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'viewCount' | 'order'
> & {
  id?: string;
  order?: number;
};
