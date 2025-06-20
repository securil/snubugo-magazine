// Firebase URLs JSON 데이터를 Magazine 타입으로 변환하는 유틸리티

import type { Magazine, Season, FirebaseUrlData } from '../types/magazine';
import { SEASON_MONTHS } from '../types/magazine';

/**
 * 파일명에서 연도, 호수, 계절 정보를 추출
 * 예: "2021년 116호-서울사대부고 봄호.pdf" -> { year: 2021, issue: 116, season: '봄' }
 */
export function parseFileName(fileName: string): { year: number; issue: number; season: Season } {
  const yearMatch = fileName.match(/(\d{4})년/);
  const issueMatch = fileName.match(/(\d+)호/);
  const seasonMatch = fileName.match(/(봄|여름|가을|겨울)호/);

  if (!yearMatch || !issueMatch || !seasonMatch) {
    throw new Error(`파일명 파싱 실패: ${fileName}`);
  }

  const year = parseInt(yearMatch[1]);
  const issue = parseInt(issueMatch[1]);
  const season = seasonMatch[1] as Season;

  return { year, issue, season };
}

/**
 * Firebase URL 데이터를 Magazine 객체로 변환
 */
export function convertToMagazine(firebaseData: FirebaseUrlData): Magazine {
  const { year, issue, season } = parseFileName(firebaseData.fileName);
  const month = SEASON_MONTHS[season];
  
  return {
    id: `${year}-${season}-${issue}`,
    year,
    season,
    issue,
    month,
    title: `${year}년 ${issue}호 서울사대부고 ${season}호`,
    description: `서울대학교 사범대학 부설고등학교 동창회보 ${year}년 ${season}호`,
    pdfUrl: firebaseData.pdfUrl,
    thumbnailUrl: firebaseData.thumbnailUrl,
    pageCount: 0, // 실제 로딩 시 계산
    publishDate: `${year}-${month.toString().padStart(2, '0')}-01`,
    fileSize: '계산 중...',
    isLatest: false, // 나중에 설정
    featured: false,
    tags: [season, year.toString(), `${issue}호`],
    category: '동창회보'
  };
}

/**
 * 최신호 표시 설정
 */
export function markLatestIssue(magazines: Magazine[]): Magazine[] {
  const sorted = [...magazines].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.issue - a.issue;
  });

  return sorted.map((magazine, index) => ({
    ...magazine,
    isLatest: index === 0
  }));
}
