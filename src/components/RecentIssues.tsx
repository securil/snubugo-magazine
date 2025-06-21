import React from 'react';
import { ChevronRight, Calendar, FileText } from 'lucide-react';
import type { Magazine } from '../types/magazine';
import { getSeasonalTheme } from '../utils/theme';

interface RecentIssuesProps {
  magazines: Magazine[];
  onRead: (magazine: Magazine) => void;
}

export const RecentIssues: React.FC<RecentIssuesProps> = ({ 
  magazines, 
  onRead 
}) => {
  // 최신호를 제외한 최근 2-3호
  const recentIssues = magazines.slice(1, 4);
  
  if (recentIssues.length === 0) {
    return null;
  }
  
  return (
    <section className="section-sm bg-gray-50">
      <div className="container-main">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              최근 발행호
            </h2>
            <p className="text-gray-600">
              지난호들을 둘러보세요
            </p>
          </div>
          
          <button className="btn-secondary inline-flex items-center space-x-1">
            <span>전체보기</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Issues Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentIssues.map((magazine) => {
            const theme = getSeasonalTheme(magazine.season);
            
            return (
              <div
                key={magazine.id}
                className="card-seasonal group cursor-pointer"
                onClick={() => onRead(magazine)}
                style={{
                  borderColor: theme.colors.primary,
                  background: `linear-gradient(to bottom, ${theme.colors.background}, white)`
                }}
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden" onClick={() => onRead(magazine)}>
                  <img
                    src={magazine.thumbnailUrl}
                    alt={magazine.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                    loading="lazy"
                  />
                  
                  {/* Season Badge */}
                  <div 
                    className="absolute top-3 left-3 px-2 py-1 rounded-lg text-white text-xs font-semibold"
                    style={{ backgroundColor: theme.colors.accent }}
                  >
                    <span className="mr-1">{theme.emoji}</span>
                    {magazine.season}호
                  </div>
                  
                  {/* Issue Number */}
                  <div 
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    {magazine.issue}
                  </div>
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-200 line-clamp-2">
                    {magazine.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {magazine.description}
                  </p>
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{magazine.publishDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{magazine.pageCount}p</span>
                    </div>
                  </div>
                  
                  {/* Read Button */}
                  <div className="pt-2">
                    <div 
                      className="w-full py-2 px-3 rounded-lg text-center text-sm font-medium text-white transition-all duration-200 group-hover:shadow-md"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      읽어보기
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
};
