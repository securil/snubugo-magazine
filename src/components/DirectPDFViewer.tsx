import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Monitor,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import type { Magazine } from '../types/magazine';
import { getSeasonalTheme } from '../utils/theme';

interface DirectPDFViewerProps {
  magazine: Magazine;
  onClose: () => void;
}

export const DirectPDFViewer: React.FC<DirectPDFViewerProps> = ({ 
  magazine, 
  onClose 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'double'>(() => {
    return window.innerWidth >= 1200 ? 'double' : 'single';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const theme = getSeasonalTheme(magazine.season);

  // PDF URL 생성 - 뷰 모드에 따라 다른 설정
  const getPDFUrl = () => {
    const baseUrl = magazine.pdfUrl;
    const viewParam = viewMode === 'double' ? 'TwoPageLeft' : 'FitH';
    const zoomParam = Math.round(scale * 100);
    
    return `${baseUrl}#toolbar=1&navpanes=1&scrollbar=1&page=${currentPage}&view=${viewParam}&zoom=${zoomParam}`;
  };

  // iframe 로드 완료 처리
  const handleIframeLoad = () => {
    setLoading(false);
    setError(false);
    
    // PDF 정보 가져오기 시도
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        // PDF 페이지 수 감지 (가능한 경우)
        setTimeout(() => {
          if (magazine.pageCount > 0) {
            setTotalPages(magazine.pageCount);
          }
        }, 1000);
      }
    } catch (err) {
      console.warn('[Direct PDF Viewer] PDF 정보 가져오기 실패:', err);
    }
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  // 페이지 네비게이션
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 확대/축소
  const handleZoom = (factor: number) => {
    setScale(prev => Math.max(0.5, Math.min(3.0, prev * factor)));
  };

  // 뷰 모드 직접 설정
  const setViewModeDirectly = (mode: 'single' | 'double') => {
    setViewMode(mode);
  };

  // 새로고침
  const refreshPDF = () => {
    setLoading(true);
    setError(false);
    if (iframeRef.current) {
      iframeRef.current.src = getPDFUrl();
    }
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPage(currentPage - (viewMode === 'double' ? 2 : 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToPage(currentPage + (viewMode === 'double' ? 2 : 1));
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoom(1.25);
          break;
        case '-':
          e.preventDefault();
          handleZoom(0.8);
          break;
        case '1':
          e.preventDefault();
          setViewMode('single');
          break;
        case '2':
          e.preventDefault();
          setViewMode('double');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, viewMode, totalPages, onClose]);

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1200;
      if (!isDesktop && viewMode === 'double') {
        setViewMode('single');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // URL이 변경될 때마다 iframe 업데이트
  useEffect(() => {
    if (iframeRef.current && !loading && !error) {
      iframeRef.current.src = getPDFUrl();
    }
  }, [currentPage, viewMode, scale]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* 상단 툴바 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        {/* 좌측: 문서 정보 */}
        <div className="flex items-center space-x-4">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.colors.primary }}
          />
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">
              {magazine.title}
            </h2>
            <p className="text-xs text-gray-500">
              고급 PDF 뷰어 • {magazine.pageCount}페이지 • {magazine.fileSize}
            </p>
          </div>
        </div>

        {/* 중앙: 페이지 컨트롤 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => goToPage(currentPage - (viewMode === 'double' ? 2 : 1))}
            disabled={currentPage <= 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-1 text-sm">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              className="w-12 px-1 py-1 text-center border border-gray-300 rounded text-xs"
              min={1}
              max={totalPages || magazine.pageCount}
            />
            <span className="text-gray-500">/ {totalPages || magazine.pageCount}</span>
          </div>
          
          <button
            onClick={() => goToPage(currentPage + (viewMode === 'double' ? 2 : 1))}
            disabled={currentPage >= (totalPages || magazine.pageCount)}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 우측: 뷰어 컨트롤 */}
        <div className="flex items-center space-x-1">
          {/* 페이지 모드 토글 */}
          <button
            onClick={() => setViewModeDirectly('single')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'single' 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-gray-100'
            }`}
            title="1페이지 보기 (단축키: 1)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setViewModeDirectly('double')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'double' 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-gray-100'
            }`}
            title="2페이지 보기 (단축키: 2)"
          >
            <Monitor className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          {/* 확대/축소 */}
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 rounded hover:bg-gray-100"
            title="축소 (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-xs text-gray-500 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={() => handleZoom(1.25)}
            className="p-2 rounded hover:bg-gray-100"
            title="확대 (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          {/* 새로고침 */}
          <button
            onClick={refreshPDF}
            className="p-2 rounded hover:bg-gray-100"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {/* 다운로드 */}
          <a
            href={magazine.pdfUrl}
            download={`${magazine.title}.pdf`}
            className="p-2 rounded hover:bg-gray-100"
            title="다운로드"
          >
            <Download className="w-4 h-4" />
          </a>
          
          {/* 닫기 */}
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 text-red-600"
            title="닫기 (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF 뷰어 영역 */}
      <div className="flex-1 overflow-hidden bg-gray-100 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                고급 PDF 뷰어 로딩 중
              </h3>
              <p className="text-gray-600">잠시만 기다려주세요...</p>
              <p className="text-xs text-gray-500 mt-2">
                {viewMode === 'double' ? '2페이지 뷰' : '1페이지 뷰'}로 설정됩니다
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center space-y-4 max-w-md">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                고급 뷰어 로딩 실패
              </h3>
              <p className="text-gray-600 mb-4">
                PDF를 고급 뷰어로 표시할 수 없습니다.
                기본 뷰어나 새 창 열기를 사용해주세요.
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={refreshPDF}
                  className="btn-primary inline-flex items-center space-x-2 w-full justify-center"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>다시 시도</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="btn-secondary inline-flex items-center space-x-2 w-full justify-center"
                >
                  <X className="w-4 h-4" />
                  <span>기본 뷰어로 돌아가기</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF iframe */}
        <iframe
          ref={iframeRef}
          src={getPDFUrl()}
          className="w-full h-full border-0"
          title={`${magazine.title} - 고급 뷰어`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="fullscreen"
        />
      </div>

      {/* 하단 정보 바 */}
      <div className="bg-gray-800 text-white px-4 py-2 text-xs flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span>{magazine.publishDate} 발행</span>
          <span>•</span>
          <span>{magazine.season}호 (제{magazine.issue}호)</span>
          <span>•</span>
          <span 
            className="px-2 py-1 rounded text-xs font-semibold"
            style={{ backgroundColor: theme.colors.primary }}
          >
            {viewMode === 'double' ? '2페이지 뷰' : '1페이지 뷰'} • {Math.round(scale * 100)}%
          </span>
        </div>
        
        <div className="flex items-center space-x-4 text-gray-400">
          <span>← → (페이지) | +/- (확대) | 1/2 (모드) | ESC (닫기)</span>
        </div>
      </div>
    </div>
  );
};
