import React from 'react';
import { Calendar, ExternalLink } from 'lucide-react';

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

// 계절별 색상 (현재 미사용)
// const SEASON_COLORS = {
//   '봄': 'green',
//   '여름': 'amber', 
//   '가을': 'orange',
//   '겨울': 'blue'
// } as const;

interface MagazineCardProps {
  magazine: Magazine;
  onView: (magazine: Magazine) => void;
}

const MagazineCard: React.FC<MagazineCardProps> = ({ magazine, onView }) => {
  // const seasonColor = SEASON_COLORS[magazine.season]; // 현재 미사용
  
  return (
    <div className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      <div className="relative">
        {/* 썸네일 이미지 */}
        <img
          src={magazine.thumbnailUrl}
          alt={magazine.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        
        {/* 최신호 배지 */}
        {magazine.isLatest && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            최신호
          </div>
        )}
        
        {/* 계절 배지 */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium theme-${magazine.season} bg-white bg-opacity-90`}>
          {magazine.season}
        </div>
      </div>
      
      <div className="p-4">
        {/* 제목 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {magazine.title}
        </h3>
        
        {/* 설명 */}
        <p className="text-sm text-gray-600 mb-3 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {magazine.description}
        </p>
        
        {/* 메타 정보 */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{magazine.publishDate}</span>
          </div>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {magazine.issue}호
          </span>
        </div>
        
        {/* 액션 버튼 */}
        <button
          onClick={() => onView(magazine)}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span>읽기</span>
        </button>
      </div>
    </div>
  );
};

export default MagazineCard;
