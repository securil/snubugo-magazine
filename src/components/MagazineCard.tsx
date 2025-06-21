import React from 'react';
import { Calendar, Eye } from 'lucide-react';
import type { Magazine } from '../types/magazine';
import { getSeasonalTheme } from '../utils/theme';

interface MagazineCardProps {
  magazine: Magazine;
  onView: (magazine: Magazine) => void;
}

const MagazineCard: React.FC<MagazineCardProps> = ({ magazine, onView }) => {
  const theme = getSeasonalTheme(magazine.season);
  
  const handleCardClick = () => {
    onView(magazine);
  };
  
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    onView(magazine);
  };
  
  return (
    <div 
      className="card-seasonal group cursor-pointer"
      onClick={handleCardClick}
      style={{
        borderColor: theme.colors.primary,
        background: `linear-gradient(to bottom, ${theme.colors.background}, white)`
      }}
    >
      <div className="relative overflow-hidden">
        {/* 썸네일 이미지 */}
        <img
          src={magazine.thumbnailUrl}
          alt={magazine.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* 호버 오버레이 */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <Eye className="w-6 h-6 text-gray-800" />
          </div>
        </div>
        
        {/* 최신호 배지 */}
        {magazine.isLatest && (
          <div 
            className="absolute top-3 right-3 px-2 py-1 rounded-lg text-white text-xs font-semibold shadow-lg"
            style={{ backgroundColor: theme.colors.accent }}
          >
            최신호
          </div>
        )}
        
        {/* 계절 배지 */}
        <div 
          className="absolute top-3 left-3 px-2 py-1 rounded-lg text-white text-xs font-semibold"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <span className="mr-1">{theme.emoji}</span>
          {magazine.season}호
        </div>
        
        {/* 호수 번호 */}
        <div 
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: theme.colors.accent }}
        >
          {magazine.issue}
        </div>
      </div>
      
      <div className="p-4">
        {/* 제목 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
          {magazine.title}
        </h3>
        
        {/* 설명 */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {magazine.description}
        </p>
        
        {/* 메타 정보 */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{magazine.publishDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>{magazine.pageCount}p</span>
            <span>•</span>
            <span>{magazine.fileSize}</span>
          </div>
        </div>
        
        {/* 액션 버튼 */}
        <button
          onClick={handleButtonClick}
          className="w-full py-2 px-4 rounded-lg text-center text-sm font-medium text-white transition-all duration-200 group-hover:shadow-md"
          style={{ 
            backgroundColor: theme.colors.primary,
            boxShadow: `0 2px 4px ${theme.colors.primary}20`
          }}
        >
          <div className="flex items-center justify-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>읽어보기</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MagazineCard;
