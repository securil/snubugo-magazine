import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, RefreshCw, BookOpen, Monitor, Home, ArrowLeft, ChevronRight } from 'lucide-react';
import type { Magazine } from '../types/magazine';
import { getSeasonalTheme } from '../utils/theme';
import { EBookViewer } from './EBookViewer';

interface SimplePDFViewerProps {
  magazine: Magazine;
  onClose: () => void;
}

export const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ 
  magazine, 
  onClose 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [useAdvancedViewer, setUseAdvancedViewer] = useState(false);
  
  const theme = getSeasonalTheme(magazine.season);

  // 키보드 단축키 이벤트 리스너
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'h' || event.key === 'H') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [onClose]);

  // Canvas 기반 이북 뷰어로 전환하는 함수
  const switchToAdvancedViewer = () => {
    console.log('[PDF Viewer] Canvas 기반 이북 뷰어로 전환:', magazine.title);
    setUseAdvancedViewer(true);
  };

  // Canvas 기반 고급 뷰어로 전환
  if (useAdvancedViewer) {
    return <EBookViewer magazine={magazine} onClose={onClose} />;
  }

  const handleIframeLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  // PC 환경에서 2페이지 뷰, 모바일에서 1페이지 뷰로 설정
  const isDesktop = window.innerWidth >= 1200;
  const viewMode = isDesktop ? 'TwoPageLeft' : 'FitH';
  const pageMode = isDesktop ? 'thumbs' : 'none';
  const pdfViewerUrl = `${magazine.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=${viewMode}&pagemode=${pageMode}&zoom=page-width`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* 상단 툴바 */}
      <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex flex-col space-y-3 flex-shrink-0 shadow-lg">
        {/* 첫 번째 행: 네비게이션 */}
        <div className="flex items-center justify-between">
          {/* 좌측: 홈/뒤로가기 네비게이션 */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md border-2 border-blue-500 hover:border-blue-400 font-medium"
              title="홈으로 돌아가기"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">홈으로</span>
            </button>
            
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
              title="뒤로가기"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">뒤로</span>
            </button>
          </div>

          {/* 우측: 뷰어 전환 */}
          <div className="flex items-center space-x-3">
            {/* Canvas 이북 뷰어 버튼 */}
            <button
              onClick={switchToAdvancedViewer}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md border-2 border-purple-500 hover:border-purple-400 font-medium"
              title="Canvas 기반 고급 이북 뷰어로 전환"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden lg:inline">🎨 Canvas 이북뷰어</span>
              <span className="lg:hidden">🎨 이북</span>
            </button>
            
            {/* 기본 뷰어 표시 */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg border">
              <Monitor className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">기본뷰어</span>
            </div>
          </div>
        </div>

        {/* 두 번째 행: 브레드크럼 & 문서 정보 */}
        <div className="flex items-center justify-between">
          {/* 좌측: 브레드크럼 네비게이션 */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="hover:text-blue-600 cursor-pointer font-medium">서울사대부고 동창회보</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-800 font-semibold">{magazine.year}년</span>
            <ChevronRight className="w-4 h-4" />
            <span 
              className="px-2 py-1 rounded text-white text-xs font-bold"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {magazine.season}호
            </span>
          </div>

          {/* 우측: PDF 액션 버튼들 */}
          <div className="flex items-center space-x-2">
            <a
              href={magazine.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 text-blue-600 transition-colors border border-transparent hover:border-blue-300"
              title="새 창에서 열기"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            
            <a
              href={magazine.pdfUrl}
              download={`${magazine.title}.pdf`}
              className="p-2 rounded-lg hover:bg-gray-100 text-green-600 transition-colors border border-transparent hover:border-green-300"
              title="다운로드"
            >
              <Download className="w-4 h-4" />
            </a>
            
            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-transparent hover:border-gray-300"
              title="새로고침"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors border border-transparent hover:border-red-300"
              title="닫기 (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 세 번째 행: 문서 제목 및 정보 */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full animate-pulse shadow-sm"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <div>
              <h2 className="font-bold text-gray-900 text-lg leading-tight">
                {magazine.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                📖 기본 PDF 뷰어 • {magazine.pageCount}페이지 • {magazine.fileSize} • {magazine.publishDate} 발행
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PDF 뷰어 영역 */}
      <div className="flex-1 overflow-hidden bg-gray-100 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="loading-spinner mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                📖 기본 PDF 뷰어 로딩 중
              </h3>
              <p className="text-gray-600 mb-4">브라우저 내장 PDF 뷰어를 불러오고 있습니다...</p>
              
              {/* Canvas 이북 뷰어 추천 */}
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800 mb-2">
                  🎨 <strong>고화질 Canvas 렌더링을 원하신다면?</strong>
                </p>
                <button
                  onClick={switchToAdvancedViewer}
                  className="text-sm text-purple-600 hover:text-purple-800 underline font-medium"
                >
                  → Canvas 이북 뷰어로 전환하기
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center space-y-6 max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                기본 PDF 뷰어 로딩 실패
              </h3>
              <p className="text-gray-600 mb-6">
                브라우저에서 PDF를 직접 표시할 수 없습니다.
                다른 방법으로 PDF를 열어보세요.
              </p>
              
              {/* Canvas 이북 뷰어 추천 (에러 시) */}
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-900 mb-2">
                  🎨 <strong>추천: Canvas 고급 이북 뷰어</strong>
                </p>
                <p className="text-sm text-purple-700 mb-3">
                  CORS 해결됨! 고화질 Canvas 렌더링으로 완벽한 이북 경험
                </p>
                <button
                  onClick={switchToAdvancedViewer}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Canvas 이북 뷰어로 전환</span>
                </button>
              </div>
              
              <div className="space-y-3">
                <a
                  href={magazine.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center space-x-2 w-full justify-center py-3"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>새 창에서 PDF 열기</span>
                </a>
                
                <a
                  href={magazine.pdfUrl}
                  download={`${magazine.title}.pdf`}
                  className="btn-secondary inline-flex items-center space-x-2 w-full justify-center py-3"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF 다운로드</span>
                </a>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                <p className="font-medium mb-1">💡 문제 해결 팁</p>
                <p>Chrome, Firefox, Safari 등 최신 브라우저를 사용하거나, 
                   PDF 플러그인을 활성화해주세요.</p>
              </div>
            </div>
          </div>
        )}

        {/* PDF iframe */}
        <iframe
          src={pdfViewerUrl}
          className="w-full h-full border-0"
          title={magazine.title}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="fullscreen"
        />
      </div>

      {/* 하단 정보 바 */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between flex-shrink-0 border-t border-gray-700">
        <div className="flex items-center space-x-6">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            title="홈으로 돌아가기"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">홈으로 돌아가기</span>
            <span className="sm:hidden">홈</span>
          </button>
          
          <span className="text-gray-400 hidden sm:inline">•</span>
          <span className="text-sm hidden sm:inline">📖 {magazine.publishDate} 발행</span>
          <span className="text-gray-400 hidden sm:inline">•</span>
          <span className="text-sm">{magazine.season}호 (제{magazine.issue}호)</span>
          <span 
            className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg hidden lg:inline"
            style={{ backgroundColor: theme.colors.primary }}
          >
            브라우저 기본 PDF 뷰어
          </span>
        </div>
        
        <div className="hidden lg:flex items-center space-x-6 text-gray-400 text-sm">
          <span>ESC (닫기)</span>
          <span>H (홈)</span>
          <span>🎨 Canvas 뷰어 추천</span>
        </div>
      </div>
    </div>
  );
};

// MagazineViewer로 export
export const MagazineViewer = SimplePDFViewer;
export default MagazineViewer;