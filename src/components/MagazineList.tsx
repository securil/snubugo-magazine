import React, { useState, useEffect } from 'react';
import MagazineCard from './MagazineCard';

// 타입을 직접 정의
type Season = '봄' | '여름' | '가을' | '겨울';

interface Magazine {
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

interface MagazineListProps {
  magazines: Magazine[];
  onViewMagazine: (magazine: Magazine) => void;
}

const MagazineList: React.FC<MagazineListProps> = ({ magazines, onViewMagazine }) => {
  const [filteredMagazines, setFilteredMagazines] = useState<Magazine[]>(magazines);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  // 연도 목록 생성
  const years = Array.from(new Set(magazines.map(m => m.year))).sort((a, b) => b - a);
  const seasons = ['봄', '여름', '가을', '겨울'];

  // 필터링 로직
  useEffect(() => {
    let filtered = magazines;

    if (selectedYear !== 'all') {
      filtered = filtered.filter(m => m.year === parseInt(selectedYear));
    }

    if (selectedSeason !== 'all') {
      filtered = filtered.filter(m => m.season === selectedSeason);
    }

    setFilteredMagazines(filtered);
  }, [magazines, selectedYear, selectedSeason]);

  return (
    <div className="container-main py-8">
      {/* 필터 섹션 */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 items-center">
          {/* 연도 필터 */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">연도:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">전체</option>
              {years.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
          </div>

          {/* 계절 필터 */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">계절:</label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">전체</option>
              {seasons.map(season => (
                <option key={season} value={season}>{season}호</option>
              ))}
            </select>
          </div>

          {/* 결과 개수 */}
          <div className="text-sm text-gray-500 ml-auto">
            총 {filteredMagazines.length}개의 동창회보
          </div>
        </div>
      </div>

      {/* 매거진 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMagazines.map(magazine => (
          <MagazineCard
            key={magazine.id}
            magazine={magazine}
            onView={onViewMagazine}
          />
        ))}
      </div>

      {/* 빈 상태 */}
      {filteredMagazines.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            선택한 조건에 맞는 동창회보가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default MagazineList;
