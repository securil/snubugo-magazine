// 동창회보 관련 타입 정의

export type Season = '봄' | '여름' | '가을' | '겨울';

export interface Magazine {
  id: string;                    // 고유 식별자 (YYYY-season-issue)
  year: number;                  // 발간 연도
  season: Season;                // 계절 (봄/여름/가을/겨울)
  issue: number;                 // 호수
  month: number;                 // 발간 월 (3,6,9,12)
  title: string;                 // 동창회보 제목
  description: string;           // 간단한 설명
  pdfUrl: string;               // Firebase Storage PDF URL
  thumbnailUrl: string;         // Firebase Storage 썸네일 URL
  pageCount: number;            // 페이지 수
  publishDate: string;          // 발간일 (YYYY-MM-DD)
  fileSize: string;             // 파일 크기
  isLatest: boolean;            // 최신호 여부
  featured: boolean;            // 추천호 여부
  tags: string[];              // 태그 배열
  category: string;            // 카테고리
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

// Firebase URL 데이터 타입
export interface FirebaseUrlData {
  fileName: string;
  pdfUrl: string;
  thumbnailUrl: string;
  success: boolean;
}

// 검색 및 필터링 타입
export interface SearchFilters {
  query: string;
  year?: number;
  season?: Season;
  sortBy: 'newest' | 'oldest' | 'title';
}

// 계절별 색상 맵핑
export const SEASON_COLORS = {
  '봄': 'green',
  '여름': 'amber', 
  '가을': 'orange',
  '겨울': 'blue'
} as const;

// 계절별 월 맵핑
export const SEASON_MONTHS = {
  '봄': 3,
  '여름': 6,
  '가을': 9,
  '겨울': 12
} as const;
