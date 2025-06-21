import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Smartphone,
  BookOpen,
  ExternalLink,
  Loader2,
  Home,
  // Maximize2,
  RotateCcw,
  SplitSquareHorizontal,
  Monitor
} from 'lucide-react';
import type { Magazine } from '../types/magazine';
import { getSeasonalTheme } from '../utils/theme';

interface IFrameEBookViewerProps {
  magazine: Magazine;
  onClose: () => void;
}

type ViewMode = 'cover' | 'single' | 'double';
// type PageMode = 'fit' | 'width' | 'actual';

export const IFrameEBookViewer: React.FC<IFrameEBookViewerProps> = ({ 
  magazine, 
  onClose 
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<ViewMode>('cover');
  // const [pageMode, setPageMode] = useState<PageMode>('fit');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [zoom, setZoom] = useState<number>(100);
  
  const leftIframeRef = useRef<HTMLIFrameElement>(null);
  const rightIframeRef = useRef<HTMLIFrameElement>(null);
  const coverIframeRef = useRef<HTMLIFrameElement>(null);
  
  const theme = getSeasonalTheme(magazine.season);

  // 윈도우 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // PDF URL with page parameters
  const getPdfUrl = (page?: number, view?: string, zoom?: number) => {
    const baseUrl = magazine.pdfUrl;
    const params = new URLSearchParams();
    
    if (page) {
      params.append('page', page.toString());
    }
    
    // PDF.js viewer parameters
    if (view) {
      params.append('view', view);
    }
    
    if (zoom) {
      params.append('zoom', zoom.toString());
    }
    
    return params.toString() ? `${baseUrl}#${params.toString()}` : baseUrl;
  };

  // 최적 iframe 크기 계산
  const getOptimalIframeSize = () => {
    // const viewportWidth = windowSize.width;
    const viewportHeight = windowSize.height - 140; // 상하단 UI 제외
    
    let width, height;
    
    if (viewMode === 'cover') {
      // 표지는 세로형 (A4 비율)
      height = Math.min(viewportHeight * 0.85, 800);
      width = height * (210 / 297); // A4 비율
    } else if (viewMode === 'single') {
      // 단일 페이지는 가로형
      height = Math.min(viewportHeight * 0.8, 600);
      width = height * (297 / 210); // A4 가로
    } else {
      // 이중 페이지는 각각 가로형
      height = Math.min(viewportHeight * 0.8, 600);
      width = height * (297 / 210); // A4 가로
    }
    
    return {
      width: Math.floor(width),
      height: Math.floor(height)
    };
  };

  const optimalSize = getOptimalIframeSize();

  // iframe 로드 완료 처리
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // 페이지 변경 로직
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= magazine.pageCount) {
      setCurrentPage(page);
      
      if (page === 1) {
        setViewMode('cover');
      } else {
        setViewMode('double');
      }
      
      setIsLoading(true);
    }
  }, [magazine.pageCount]);

  // 다음 페이지
  const nextPage = useCallback(() => {
    if (currentPage === 1) {
      // 표지에서 2-3페이지로
      goToPage(2);
    } else if (viewMode === 'double') {
      // 이중 페이지에서는 2페이지씩 이동
      if (currentPage + 2 <= magazine.pageCount) {
        goToPage(currentPage + 2);
      }
    } else {
      // 단일 페이지에서는 1페이지씩 이동
      if (currentPage + 1 <= magazine.pageCount) {
        goToPage(currentPage + 1);
      }
    }
  }, [currentPage, viewMode, magazine.pageCount, goToPage]);

  // 이전 페이지
  const prevPage = useCallback(() => {
    if (currentPage === 2 && viewMode === 'double') {
      // 2페이지에서 표지로
      goToPage(1);
    } else if (viewMode === 'double') {
      // 이중 페이지에서는 2페이지씩 이동
      if (currentPage - 2 >= 1) {
        goToPage(currentPage - 2);
      }
    } else {
      // 단일 페이지에서는 1페이지씩 이동
      if (currentPage - 1 >= 1) {
        goToPage(currentPage - 1);
      }
    }
  }, [currentPage, viewMode, goToPage]);

  // 뷰 모드 변경
  const toggleViewMode = useCallback(() => {
    if (currentPage === 1) return; // 표지는 고정
    
    if (viewMode === 'double') {
      setViewMode('single');
    } else {
      setViewMode('double');
    }
    setIsLoading(true);
  }, [currentPage, viewMode]);

  // 확대/축소
  const handleZoom = useCallback((factor: number) => {
    const newZoom = Math.max(50, Math.min(300, zoom * factor));
    setZoom(newZoom);
    setIsLoading(true);
  }, [zoom]);

  // 확대/축소 리셋
  const resetZoom = useCallback(() => {
    setZoom(100);
    setIsLoading(true);
  }, []);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextPage();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoom(1.2);
          break;
        case '-':
          e.preventDefault();
          handleZoom(0.8);
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case '1':
          e.preventDefault();
          goToPage(1);
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          if (currentPage > 1) toggleViewMode();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage, handleZoom, resetZoom, onClose, goToPage, toggleViewMode, currentPage]);

  // 현재 표시할 페이지들 계산
  const getDisplayPages = () => {
    if (viewMode === 'cover' || currentPage === 1) {
      return [currentPage];
    } else if (viewMode === 'single') {
      return [currentPage];
    } else {
      // double mode
      const rightPage = currentPage + 1;
      return rightPage <= magazine.pageCount ? [currentPage, rightPage] : [currentPage];
    }
  };

  const displayPages = getDisplayPages();

  // iframe이 로드되면 로딩 완료
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2초 후 자동 로딩 완료

    return () => clearTimeout(timer);
  }, [currentPage, viewMode, zoom]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* 상단 툴바 */}
      <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-lg">
        {/* 좌측: 문서 정보 */}
        <div className="flex items-center space-x-4">
          <div 
            className="w-4 h-4 rounded-full animate-pulse shadow-lg"
            style={{ backgroundColor: theme.colors.primary }}
          />
          <div>
            <h2 className="font-bold text-gray-900 text-lg">
              {magazine.title}
            </h2>
            <p className="text-sm text-gray-600">
              📖 iframe 고급 이북뷰어 • {magazine.pageCount}페이지 • {magazine.fileSize}
            </p>
          </div>
        </div>

        {/* 중앙: 페이지 컨트롤 */}
        <div className="flex items-center space-x-4">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1 || isLoading}
            className="p-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border-2 border-transparent hover:border-gray-300"
            title="이전 페이지 (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border-2">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <div className="text-center min-w-[100px]">
              {viewMode === 'cover' ? (
                <div>
                  <div className="font-bold text-lg text-gray-900">표지</div>
                  <div className="text-xs text-gray-500">Cover</div>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-lg text-gray-900">
                    {displayPages.length === 2 
                      ? `${displayPages[0]}-${displayPages[1]}`
                      : displayPages[0]
                    }
                  </div>
                  <div className="text-xs text-gray-500">
                    / {magazine.pageCount}페이지
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={nextPage}
            disabled={
              (viewMode === 'double' && currentPage >= magazine.pageCount - 1) ||
              (viewMode === 'single' && currentPage >= magazine.pageCount) ||
              isLoading
            }
            className="p-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border-2 border-transparent hover:border-gray-300"
            title="다음 페이지 (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 우측: 뷰어 컨트롤 */}
        <div className="flex items-center space-x-2">
          {/* 뷰 모드 표시 */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg border">
            {viewMode === 'cover' ? (
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Smartphone className="w-4 h-4" />
                <span className="font-medium">표지</span>
              </div>
            ) : viewMode === 'single' ? (
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Monitor className="w-4 h-4" />
                <span className="font-medium">단일</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <SplitSquareHorizontal className="w-4 h-4" />
                <span className="font-medium">이중</span>
              </div>
            )}
          </div>

          {/* 뷰 모드 전환 버튼 */}
          {currentPage > 1 && (
            <button
              onClick={toggleViewMode}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 border-2 border-transparent hover:border-gray-300"
              title="뷰 모드 전환 (D)"
            >
              {viewMode === 'double' ? (
                <Monitor className="w-5 h-5" />
              ) : (
                <SplitSquareHorizontal className="w-5 h-5" />
              )}
            </button>
          )}

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* 홈(표지) 버튼 */}
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1 || isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 border-2 border-transparent hover:border-gray-300"
            title="표지로 이동 (1)"
          >
            <Home className="w-5 h-5" />
          </button>

          {/* 확대/축소 */}
          <button
            onClick={() => handleZoom(0.8)}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 border-2 border-transparent hover:border-gray-300"
            title="축소 (-)"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          
          <div className="bg-gray-100 px-3 py-1 rounded border text-sm font-mono min-w-[4rem] text-center">
            {zoom}%
          </div>
          
          <button
            onClick={() => handleZoom(1.2)}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 border-2 border-transparent hover:border-gray-300"
            title="확대 (+)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <button
            onClick={resetZoom}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 border-2 border-transparent hover:border-gray-300"
            title="원래 크기 (0)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* 새 창에서 열기 */}
          <button
            onClick={() => window.open(magazine.pdfUrl, '_blank')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-gray-300"
            title="새 창에서 열기"
          >
            <ExternalLink className="w-5 h-5" />
          </button>

          {/* 다운로드 */}
          <a
            href={magazine.pdfUrl}
            download={`${magazine.title}.pdf`}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-gray-300"
            title="다운로드"
          >
            <Download className="w-5 h-5" />
          </a>
          
          {/* 닫기 */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors border-2 border-transparent hover:border-red-300"
            title="닫기 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF 뷰어 영역 */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-black p-6">
        <div className="max-w-full mx-auto h-full">
          {/* 로딩 상태 */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
              <div className="text-center text-white bg-gray-800 rounded-xl p-8 border border-gray-600">
                <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-blue-400" />
                <h3 className="text-xl font-bold mb-3">
                  📖 iframe 고급 이북뷰어 로딩
                </h3>
                <p className="text-gray-300 text-lg">
                  {viewMode === 'cover' ? '표지 로딩 중...' : 
                   viewMode === 'single' ? '단일 페이지 로딩 중...' : 
                   '이중 페이지 로딩 중...'}
                </p>
                <div className="mt-4 text-sm text-gray-400">
                  CORS 우회 iframe 방식으로 안정적 렌더링
                </div>
              </div>
            </div>
          )}

          {/* 이북 레이아웃 */}
          <div className="h-full flex items-center justify-center">
            {viewMode === 'cover' ? (
              /* 표지 모드 */
              <div className="relative group animate-fade-in">
                <div 
                  className="bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] border-4 border-gray-200"
                  style={{ 
                    transform: `perspective(1200px) rotateY(2deg)`,
                    filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.3))',
                    width: `${optimalSize.width}px`,
                    height: `${optimalSize.height}px`
                  }}
                >
                  <iframe
                    ref={coverIframeRef}
                    src={getPdfUrl(1, 'FitH', zoom)}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', borderRadius: 'inherit' }}
                    onLoad={handleIframeLoad}
                    title={`${magazine.title} - 표지`}
                  />
                </div>
                
                {/* 표지 장식 효과 */}
                <div className="absolute -bottom-4 -right-4 w-full h-full bg-gray-600 rounded-xl -z-10 transform rotate-1 opacity-40"></div>
                <div className="absolute -bottom-8 -right-8 w-full h-full bg-gray-500 rounded-xl -z-20 transform rotate-2 opacity-30"></div>
                <div className="absolute -bottom-12 -right-12 w-full h-full bg-gray-400 rounded-xl -z-30 transform rotate-3 opacity-20"></div>
                
                {/* 표지 글로우 효과 */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-20 blur-xl -z-5"
                  style={{ backgroundColor: theme.colors.primary }}
                ></div>
              </div>
            ) : viewMode === 'single' ? (
              /* 단일 페이지 모드 */
              <div className="relative animate-fade-in">
                <div 
                  className="bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-gray-200"
                  style={{ 
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                    width: `${optimalSize.width}px`,
                    height: `${optimalSize.height}px`
                  }}
                >
                  <iframe
                    src={getPdfUrl(currentPage, 'FitH', zoom)}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', borderRadius: 'inherit' }}
                    onLoad={handleIframeLoad}
                    title={`${magazine.title} - 페이지 ${currentPage}`}
                  />
                  
                  {/* 페이지 번호 */}
                  <div 
                    className="absolute bottom-6 right-6 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl backdrop-blur-sm border border-white/20"
                    style={{ backgroundColor: `${theme.colors.primary}ee` }}
                  >
                    {currentPage}
                  </div>
                </div>
              </div>
            ) : (
              /* 이중 페이지 모드 */
              <div className="relative animate-fade-in" style={{ perspective: '2000px' }}>
                <div className="flex space-x-6 relative">
                  {/* 중앙 바인딩 라인 */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-6 bg-gradient-to-b from-gray-700 via-gray-900 to-gray-700 transform -translate-x-1/2 z-10 rounded-full shadow-2xl border-2 border-gray-600">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-black/40 to-transparent rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-12 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full shadow-inner"></div>
                    {/* 바인딩 리벳 */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                  
                  {/* 좌측 페이지 */}
                  <div
                    className="relative bg-white shadow-2xl overflow-hidden transition-all duration-500 rounded-l-xl border-4 border-gray-200"
                    style={{
                      transform: `perspective(1500px) rotateY(4deg) translateX(15px)`,
                      transformOrigin: 'right center',
                      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                      width: `${optimalSize.width}px`,
                      height: `${optimalSize.height}px`
                    }}
                  >
                    <iframe
                      ref={leftIframeRef}
                      src={getPdfUrl(currentPage, 'FitH', zoom)}
                      width="100%"
                      height="100%"
                      style={{ border: 'none', borderRadius: 'inherit' }}
                      onLoad={handleIframeLoad}
                      title={`${magazine.title} - 페이지 ${currentPage}`}
                    />
                    
                    {/* 좌측 페이지 번호 */}
                    <div 
                      className="absolute bottom-6 left-6 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl backdrop-blur-sm border border-white/20"
                      style={{ backgroundColor: `${theme.colors.primary}ee` }}
                    >
                      {currentPage}
                    </div>
                    
                    {/* 좌측 페이지 가장자리 효과 */}
                    <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-black/20 via-black/10 to-transparent" />
                    <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-white/40 via-white/20 to-white/40" />
                  </div>
                  
                  {/* 우측 페이지 */}
                  {displayPages.length === 2 && (
                    <div
                      className="relative bg-white shadow-2xl overflow-hidden transition-all duration-500 rounded-r-xl border-4 border-gray-200"
                      style={{
                        transform: `perspective(1500px) rotateY(-4deg) translateX(-15px)`,
                        transformOrigin: 'left center',
                        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                        width: `${optimalSize.width}px`,
                        height: `${optimalSize.height}px`
                      }}
                    >
                      <iframe
                        ref={rightIframeRef}
                        src={getPdfUrl(currentPage + 1, 'FitH', zoom)}
                        width="100%"
                        height="100%"
                        style={{ border: 'none', borderRadius: 'inherit' }}
                        onLoad={handleIframeLoad}
                        title={`${magazine.title} - 페이지 ${currentPage + 1}`}
                      />
                      
                      {/* 우측 페이지 번호 */}
                      <div 
                        className="absolute bottom-6 right-6 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl backdrop-blur-sm border border-white/20"
                        style={{ backgroundColor: `${theme.colors.primary}ee` }}
                      >
                        {currentPage + 1}
                      </div>
                      
                      {/* 우측 페이지 가장자리 효과 */}
                      <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-black/20 via-black/10 to-transparent" />
                      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-white/40 via-white/20 to-white/40" />
                    </div>
                  )}
                </div>
                
                {/* 책상 표면 그림자 */}
                <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-4/5 h-12 bg-gradient-to-r from-transparent via-black/50 to-transparent rounded-full blur-2xl"></div>
                
                {/* 주변 글로우 효과 */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-10 blur-3xl -z-5"
                  style={{ backgroundColor: theme.colors.primary }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 정보 바 */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between flex-shrink-0 border-t border-gray-700">
        <div className="flex items-center space-x-6">
          <span className="text-sm">📖 {magazine.publishDate} 발행</span>
          <span className="text-gray-400">•</span>
          <span className="text-sm">{magazine.season}호 (제{magazine.issue}호)</span>
          <span className="text-gray-400">•</span>
          <span 
            className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
            style={{ backgroundColor: theme.colors.primary }}
          >
            iframe 안정화 이북뷰어 • {zoom}% • {windowSize.width}×{windowSize.height}
          </span>
        </div>
        
        <div className="hidden lg:flex items-center space-x-6 text-gray-400 text-sm">
          <span>← → (페이지)</span>
          <span>D (뷰모드)</span>
          <span>+/- (확대)</span>
          <span>0 (리셋)</span>
          <span>1 (표지)</span>
          <span>ESC (닫기)</span>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        iframe {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
        
        /* 스크롤바 숨기기 */
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};