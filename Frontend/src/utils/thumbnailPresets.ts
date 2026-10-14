export interface ThumbnailPreset {
  id: string;
  title: string;
  category: string;
  url: string;
  bgGradient: string;
  iconName: string;
}

export const PRESET_THUMBNAILS: ThumbnailPreset[] = [
  {
    id: 'physics-optics',
    title: 'Physics & Optics',
    category: 'Physics',
    url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-blue-600 to-indigo-700',
    iconName: 'Atom',
  },
  {
    id: 'chemistry-lab',
    title: 'Chemistry & Reactions',
    category: 'Chemistry',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-amber-500 to-orange-600',
    iconName: 'FlaskConical',
  },
  {
    id: 'maths-geometry',
    title: 'Mathematics & Calculus',
    category: 'Mathematics',
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-emerald-600 to-teal-700',
    iconName: 'Calculator',
  },
  {
    id: 'biology-genetics',
    title: 'Biology & Genetics',
    category: 'Biology',
    url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-teal-600 to-cyan-700',
    iconName: 'Dna',
  },
  {
    id: 'exam-blueprint',
    title: 'Model Papers & Tests',
    category: 'Assessments',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-purple-600 to-violet-800',
    iconName: 'FileCheck',
  },
  {
    id: 'computer-code',
    title: 'Computer Science & Python',
    category: 'Computer Science',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-sky-600 to-blue-800',
    iconName: 'Code',
  },
  {
    id: 'formula-handbook',
    title: 'Formula Cheat Sheet',
    category: 'Formulas',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-rose-500 to-pink-700',
    iconName: 'BookMarked',
  },
  {
    id: 'master-qbank',
    title: 'Question Repository',
    category: 'Question Bank',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-slate-700 to-slate-900',
    iconName: 'Database',
  },
];

export const getDefaultThumbnail = (subject: string, type: string): string => {
  const s = subject.toLowerCase();
  if (s.includes('physic')) return PRESET_THUMBNAILS[0].url;
  if (s.includes('chemist')) return PRESET_THUMBNAILS[1].url;
  if (s.includes('math')) return PRESET_THUMBNAILS[2].url;
  if (s.includes('bio')) return PRESET_THUMBNAILS[3].url;
  if (s.includes('comput') || s.includes('python')) return PRESET_THUMBNAILS[5].url;
  if (type.includes('formula')) return PRESET_THUMBNAILS[6].url;
  if (type.includes('paper') || type.includes('test')) return PRESET_THUMBNAILS[4].url;
  return PRESET_THUMBNAILS[7].url;
};
