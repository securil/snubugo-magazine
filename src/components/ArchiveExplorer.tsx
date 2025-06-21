import React, { useState } from 'react';
import { Book, Calendar } from 'lucide-react';
import type { Magazine } from '../types/magazine';
import type { Season } from '../utils/theme';
import { getSeasonalTheme } from '../utils/theme';

interface ArchiveExplorerProps {
  magazines: Magazine[];
  onRead: (magazine: Magazine) => void;
}

export const ArchiveExplorer: React.FC<ArchiveExplorerProps> = ({ 
  magazines, 
  onRead 
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  
  // 년도별 그룹화
  const groupedByYear = magazines.reduce((acc, magazine) => {
    if (!acc[magazine.year]) {
      acc[magazine.year] = [];
    }
    acc[magazine.year].push(magazine);
    return acc;
  }, {} as Record<number, Magazine[]>);
  
  const availableYears = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a); // 최신년도 우선
  
  const currentYearMagazines = groupedByYear[selectedYear] || [];
  
  // 계절별 그룹화
  const seasonOrder: Season[] = ['봄', '여름', '가을', '겨울'];
  const groupedBySeason = seasonOrder.map(season => {
    const magazine = currentYearMagazines.find(m => m.season === season);
    return { season, magazine };
  });
  
  return (
    <section className="section bg-white">
      <div className="container-main">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-responsive-lg font-bold text-gray-900 mb-4">
            동창회보 아카이브
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            년도와 계절을 선택하여 원하는 동창회보를 찾아보세요
          </p>
        </div>
        
        {/* Year Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedYear === year
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                {year}년
              </button>
            ))}
          </div>
        </div>
        
        {/* Season Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {groupedBySeason.map(({ season, magazine }) => {
            const theme = getSeasonalTheme(season);
            const isAvailable = !!magazine;
            
            return (
              <div
                key={season}
                className={`card-seasonal relative overflow-hidden transition-all duration-300 ${
                  isAvailable 
                    ? 'cursor-pointer hover:shadow-xl' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => isAvailable && onRead(magazine)}
                style={{
                  borderColor: theme.colors.primary,
                  background: isAvailable 
                    ? `linear-gradient(135deg, ${theme.colors.background} 0%, white 100%)`
                    : 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
                }}
              >
                {/* Background Pattern */}
                <div 
                  className="absolute inset-0 opacity-5"
                  style={{ 
                    background: `radial-gradient(circle at 30% 20%, ${theme.colors.primary} 0%, transparent 60%)`
                  }}
                />
                
                <div className="relative z-10 p-6 h-full flex flex-col">
                  {/* Season Header */}
                  <div className="text-center mb-4">
                    <div 
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-3"
                      style={{ backgroundColor: theme.colors.primary + '20' }}
                    >
                      {theme.emoji}
                    </div>
                    <h3 
                      className="text-xl font-bold"
                      style={{ color: theme.colors.accent }}
                    >
                      {selectedYear}년 {season}호
                    </h3>
                  </div>
                  
                  {/* Content */}
                  {isAvailable ? (
                    <div className="flex-1 space-y-3">
                      {/* Issue Number */}
                      <div className="text-center">
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white"
                          style={{ backgroundColor: theme.colors.primary }}
                        >
                          제{magazine.issue}호
                        </span>
                      </div>
                      
                      {/* Thumbnail */}
                      <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden" onClick={() => isAvailable && onRead(magazine)}>
                        <img
                          src={magazine.thumbnailUrl}
                          alt={magazine.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                          {magazine.publishDate}
                        </p>
                        <p className="text-xs text-gray-500">
                          {magazine.pageCount}페이지 • {magazine.fileSize}
                        </p>
                      </div>
                      
                      {/* Read Button */}
                      <div 
                        className="w-full py-2 px-4 rounded-lg text-center text-sm font-medium text-white transition-all duration-200 hover:shadow-md"
                        style={{ backgroundColor: theme.colors.accent }}
                      >
                        읽어보기
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <Book className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="text-gray-500 font-medium">준비 중</p>
                        <p className="text-sm text-gray-400">
                          {season}호는 아직 발행되지 않았습니다
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Stats */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-8 text-sm text-gray-500">
            <div>
              <span className="font-semibold text-gray-900">
                {magazines.length}개
              </span>
              <span className="ml-1">발행호</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">
                {availableYears.length}년간
              </span>
              <span className="ml-1">아카이브</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">
                {magazines.reduce((sum, mag) => sum + mag.pageCount, 0)}페이지
              </span>
              <span className="ml-1">총 분량</span>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};
