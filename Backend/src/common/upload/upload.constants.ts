export const UPLOAD_DIRECTORIES = {
  CUSTOM_IMAGES: 'uploads/custom-images',
  STUDY_MATERIALS: 'uploads/study-materials',
  POPUPS: 'uploads/popups',
} as const;

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
export const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20 MB

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const ALLOWED_DOCUMENT_MIMES = [
  'application/pdf',
];