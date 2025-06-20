// 모든 타입들을 직접 export
export type Season = '봄' | '여름' | '가을' | '겨울';

export interface Magazine {
  id: string;
  year: number;
  season: Season;
  issue: number;
  month: number;
  title: string;
  description: string;
  pdfUrl: string;
  thumbnailUrl: string;
  pageCount: number;
  publishDate: string;
  fileSize: string;
  isLatest: boolean;
  featured: boolean;
  tags: string[];
  category: string;
}

export interface MagazineMetadata {
  magazines: Magazine[];
  settings: ProjectSettings;
}

export interface ProjectSettings {
  title: string;
  description: string;
  version: string;
  lastUpdated: string;
}

export interface FirebaseUrlData {
  fileName: string;
  pdfUrl: string;
  thumbnailUrl: string;
  success: boolean;
}

export interface SearchFilters {
  query: string;
  year?: number;
  season?: Season;
  sortBy: 'newest' | 'oldest' | 'title';
}

export const SEASON_COLORS = {
  '봄': 'green',
  '여름': 'amber', 
  '가을': 'orange',
  '겨울': 'blue'
} as const;

export const SEASON_MONTHS = {
  '봄': 3,
  '여름': 6,
  '가을': 9,
  '겨울': 12
} as const;
