import React from 'react';
import {
  BookOpen,
  FileText,
  HelpCircle,
  Calculator,
  CheckSquare,
  Flame,
  FileSpreadsheet,
  Layers,
  Database,
} from 'lucide-react';
import { StudyMaterialsPageContainer } from '../components/StudyMaterialsPageContainer';

export const StudyMaterialsOverviewPage: React.FC = () => (
  <StudyMaterialsPageContainer
    title="Study Materials Hub"
    subtitle="Central curriculum and academic repository. Manage all published lecture notes, question banks, formula sheets, mock series, and resources."
    materialType="all"
    icon={BookOpen}
    badgeText="Master Hub"
    addButtonLabel="Create Study Material"
  />
);

export const NotesManagementPage: React.FC = () => (
  <StudyMaterialsPageContainer
    title="Class Notes & Lecture Guides"
    subtitle="Manage teacher lecture notes, handwritten summaries, revision handouts, and topic-wise explanatory documents for all batches."
    materialType="notes"
    icon={FileText}
    badgeText="Lecture Notes"
    addButtonLabel="Add New Notes"
  />
);

export const PracticeQuestionsManagementPage: React.FC = () => (
  <StudyMaterialsPageContainer
    title="Practice Questions & Graded Exercises"
    subtitle="Configure chapter-wise drill questions, subjective assignment sheets, homework problems, and answer keys."
    materialType="practice-questions"
    icon={HelpCircle}
    badgeText="Assignments"
    addButtonLabel="Add Practice Sheet"
  />
);

export const FormulaSheetsManagementPage: React.FC = () => (
  <StudyMaterialsPageContainer
    title="Formula Sheets & Quick Reference Guides"
    subtitle="Organize essential mathematical derivations, physics constants, chemical reactions, shortcut tricks, and revision cheat sheets."
    materialType="formula-sheets"
    icon={Calculator}
    badgeText="Cheat Sheets"
    addButtonLabel="Add Formula Sheet"
  />
);

export const MCQManagementPage: React.FC = () => (
  <StudyMaterialsPageContainer
    title="MCQ & Objective Question Sets"
    subtitle="Manage single-choice, multiple-choice, assertion-reason, and matrix-match objective drill question banks with answer rationale."
    materialType="mcq"
    icon={CheckSquare}
    badgeText="Objective Drill"
    addButtonLabel="Add MCQ Set"
  />
);

export const ImportantQuestionsManagementPage: React.FC = () => (
  <StudyMaterialsPageContainer
    title="Important Questions & Exam Hotspots"
    subtitle="Curate high-yield, repeated previous 10-year exam questions, probable terminal test problems, and scoring strategy guides."
    materialType="important-questions"
    icon={Flame}
    badgeText="High Priority"
    addButtonLabel="Add Important Questions"
  />
);

export const SamplePapersManagementPage: React.FC = () => (
  <StudyMaterialsPageContainer
    title="Sample Papers & Mock Exams"
    subtitle="Publish official blueprint-aligned full model sample papers, past board question papers, and step-by-step marking schemes."
    materialType="sample-papers"
    icon={FileSpreadsheet}
    badgeText="Exam Simulation"
    addButtonLabel="Add Sample Paper"
  />
);

export const TestSeriesManagementPage: React.FC = () => (
  <StudyMaterialsPageContainer
    title="Test Series & Scheduled Assessments"
    subtitle="Administer full test series schedules, nationwide ranking mocks, sectional timed tests, and detailed solution video indexes."
    materialType="test-series"
    icon={Layers}
    badgeText="Test Series"
    addButtonLabel="Add Test Series Pack"
  />
);

export const QuestionBankManagementPage: React.FC = () => (
  <StudyMaterialsPageContainer
    title="Complete Question Bank Master Archive"
    subtitle="Access and manage the central master question repository with thousands of categorized, difficulty-tagged problems and solutions."
    materialType="question-bank"
    icon={Database}
    badgeText="Master Bank"
    addButtonLabel="Add Master Question Bank"
  />
);