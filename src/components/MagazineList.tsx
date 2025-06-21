import React, { useState, useEffect } from 'react';
import MagazineCard from './MagazineCard';
import { Search, Filter, Grid, List } from 'lucide-react';
import type { Magazine } from '../types/magazine';

interface MagazineListProps {
  magazines: Magazine[];
  onViewMagazine: (magazine: Magazine) => void;
}

const MagazineList: React.FC<MagazineListProps> = ({ magazines, onViewMagazine }) => {
  const [filteredMagazines, setFilteredMagazines] = useState<Magazine[]>(magazines);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 연도 목록 생성 (최신순)
  const years = Array.from(new Set(magazines.map(m => m.year))).sort((a, b) => b - a);
  const seasons = ['봄', '여름', '가을', '겨울'];

  // 필터링 로직
  useEffect(() => {
    let filtered = magazines;

    // 연도 필터
    if (selectedYear !== 'all') {
      filtered = filtered.filter(m => m.year === parseInt(selectedYear));
    }

    // 계절 필터
    if (selectedSeason !== 'all') {
      filtered = filtered.filter(m => m.season === selectedSeason);
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 날짜순 정렬 (최신순)
    filtered.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

    setFilteredMagazines(filtered);
  }, [magazines, selectedYear, selectedSeason, searchQuery]);

  const handleReset = () => {
    setSelectedYear('all');
    setSelectedSeason('all');
    setSearchQuery('');
  };

  return (
    <section className="section bg-gray-50">
      <div className="container-main">
        
        {/* 섹션 헤더 */}
        <div className="text-center mb-8">
          <h2 className="text-responsive-lg font-bold text-gray-900 mb-4">
            전체 동창회보
          </h2>
          <p className="text-lg text-gray-600">
            {magazines.length}개의 동창회보를 찾아보세요
          </p>
        </div>

        {/* 필터 및 검색 영역 */}
        <div className="mb-8 space-y-4">
          
          {/* 상단 컨트롤 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* 검색 바 */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목, 내용, 태그 검색..."
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 뷰 모드 토글 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="그리드 보기"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="리스트 보기"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 필터 옵션 */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* 연도 필터 */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">모든 연도</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>
            </div>

            {/* 계절 필터 */}
            <div className="flex items-center space-x-1">
              {seasons.map(season => (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(selectedSeason === season ? 'all' : season)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedSeason === season
                      ? 'bg-blue-100 text-blue-600 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {season}
                </button>
              ))}
            </div>

            {/* 리셋 버튼 */}
            {(selectedYear !== 'all' || selectedSeason !== 'all' || searchQuery) && (
              <button
                onClick={handleReset}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                필터 초기화
              </button>
            )}
          </div>

          {/* 결과 요약 */}
          <div className="text-sm text-gray-600">
            {filteredMagazines.length}개의 동창회보
            {searchQuery && (
              <span className="ml-1">
                ('{searchQuery}' 검색 결과)
              </span>
            )}
          </div>
        </div>

        {/* 매거진 그리드/리스트 */}
        {filteredMagazines.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid-magazine'
              : 'space-y-4'
          }>
            {filteredMagazines.map((magazine) => (
              <MagazineCard
                key={magazine.id}
                magazine={magazine}
                onView={onViewMagazine}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              다른 검색어나 필터를 시도해보세요
            </p>
            <button
              onClick={handleReset}
              className="btn-primary"
            >
              모든 동창회보 보기
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default MagazineList;
