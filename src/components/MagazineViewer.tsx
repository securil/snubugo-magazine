import React from 'react';
import { X } from 'lucide-react';

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

interface MagazineViewerProps {
  magazine: Magazine;
  onClose: () => void;
}

const MagazineViewer: React.FC<MagazineViewerProps> = ({ magazine, onClose }) => {
  console.log('[PDF Viewer] 뷰어 열기:', magazine.title);
  console.log('[PDF Viewer] PDF URL:', magazine.pdfUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{magazine.title}</h2>
            <p className="text-sm text-gray-600">{magazine.description}</p>
          </div>
          
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* PDF 뷰어 - iframe 사용 */}
      <div className="flex-1 bg-gray-800">
        <iframe
          src={magazine.pdfUrl}
          className="w-full h-full border-0"
          title={magazine.title}
          onLoad={() => console.log('[PDF Viewer] PDF 로딩 성공!')}
          onError={() => console.error('[PDF Viewer] PDF 로딩 실패')}
        />
      </div>

      {/* 하단 정보 */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>📄 {magazine.title}</span>
          <span>🔗 Firebase Storage에서 직접 로드</span>
        </div>
      </div>
    </div>
  );
};

export default MagazineViewer;
