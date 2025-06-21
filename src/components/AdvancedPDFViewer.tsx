import React, { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Maximize,
  Monitor,
  Smartphone,
  RotateCw
} from 'lucide-react';
import type { Magazine } from '../types/magazine';
import { getSeasonalTheme } from '../utils/theme';

// PDF.js worker 설정
if (typeof window !== 'undefined') {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  } catch (error) {
    console.warn('[Advanced PDF Viewer] Worker 설정 실패:', error);
  }
}

interface ViewerSettings {
  pageMode: 'single' | 'double';
  scale: number;
  rotation: number;
  fitMode: 'width' | 'height' | 'page';
}

interface AdvancedPDFViewerProps {
  magazine: Magazine;
  onClose: () => void;
  onBackToSimple?: () => void;
}

export const AdvancedPDFViewer: React.FC<AdvancedPDFViewerProps> = ({ 
  magazine, 
  onClose
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  const [settings, setSettings] = useState<ViewerSettings>(() => {
    // PC 환경에서는 기본 2페이지, 모바일에서는 1페이지
    const isDesktop = window.innerWidth >= 1200;
    return {
      pageMode: isDesktop ? 'double' : 'single',
      scale: 1.0,
      rotation: 0,
      fitMode: 'width'
    };
  });
  
  const theme = getSeasonalTheme(magazine.season);

  // PDF 로드 완료 핸들러
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('[Advanced PDF Viewer] PDF 로드 성공:', numPages, '페이지');
    console.log('[Advanced PDF Viewer] PDF URL:', magazine.pdfUrl);
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, [magazine.pdfUrl]);

  // PDF 로드 에러 핸들러
  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('[Advanced PDF Viewer] PDF 로드 에러:', error);
    console.error('[Advanced PDF Viewer] PDF URL:', magazine.pdfUrl);
    console.error('[Advanced PDF Viewer] 에러 상세:', error.message);
    setError(`PDF를 불러올 수 없습니다: ${error.message}`);
    setLoading(false);
  }, [magazine.pdfUrl]);

  // PDF 재시도 함수
  const retryLoadPdf = useCallback(() => {
    console.log('[Advanced PDF Viewer] PDF 로딩 재시도...');
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setNumPages(0);
  }, []);

  // 페이지 변경
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
    }
  }, [numPages]);

  // 확대/축소
  const handleZoom = useCallback((factor: number) => {
    setSettings(prev => ({
      ...prev,
      scale: Math.max(0.25, Math.min(3.0, prev.scale * factor))
    }));
  }, []);

  // 페이지 모드 변경 (직접 설정)
  const setPageMode = useCallback((mode: 'single' | 'double') => {
    setSettings(prev => ({ ...prev, pageMode: mode }));
  }, []);

  // 회전
  const rotate = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  }, []);

  // 전체화면 토글
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPage(currentPage - (settings.pageMode === 'double' ? 2 : 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToPage(currentPage + (settings.pageMode === 'double' ? 2 : 1));
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
          setSettings(prev => ({ ...prev, pageMode: 'single' }));
          break;
        case '2':
          e.preventDefault();
          setSettings(prev => ({ ...prev, pageMode: 'double' }));
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          rotate();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, settings.pageMode, goToPage, handleZoom, onClose, rotate]);

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1200;
      if (!isDesktop && settings.pageMode === 'double') {
        setSettings(prev => ({ ...prev, pageMode: 'single' }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [settings.pageMode]);

  // 스타일 계산
  const maxWidth = settings.pageMode === 'double' ? 'max-w-7xl' : 'max-w-4xl';
  const pageWidth = settings.pageMode === 'double' ? 400 : 800;

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
              {magazine.pageCount}페이지 • {magazine.fileSize}
            </p>
          </div>
        </div>

        {/* 중앙: 페이지 컨트롤 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => goToPage(currentPage - (settings.pageMode === 'double' ? 2 : 1))}
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
              max={numPages}
            />
            <span className="text-gray-500">/ {numPages}</span>
          </div>
          
          <button
            onClick={() => goToPage(currentPage + (settings.pageMode === 'double' ? 2 : 1))}
            disabled={currentPage >= numPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 우측: 뷰어 컨트롤 */}
        <div className="flex items-center space-x-1">
          {/* 페이지 모드 토글 */}
          <button
            onClick={() => setPageMode('single')}
            className={`p-2 rounded transition-colors ${
              settings.pageMode === 'single' 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-gray-100'
            }`}
            title="1페이지 보기 (단축키: 1)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setPageMode('double')}
            className={`p-2 rounded transition-colors ${
              settings.pageMode === 'double' 
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
            {Math.round(settings.scale * 100)}%
          </span>
          
          <button
            onClick={() => handleZoom(1.25)}
            className="p-2 rounded hover:bg-gray-100"
            title="확대 (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          {/* 회전 */}
          <button
            onClick={rotate}
            className="p-2 rounded hover:bg-gray-100"
            title="회전 (R)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* 전체화면 */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded hover:bg-gray-100"
            title="전체화면"
          >
            <Maximize className="w-4 h-4" />
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
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className={`mx-auto ${maxWidth}`}>
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  PDF를 불러오고 있습니다
                </h3>
                <p className="text-gray-600">잠시만 기다려주세요...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <div className="text-red-500 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF 로딩 실패</h3>
                <p className="text-red-600 mb-4 max-w-md">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <Document
              file={magazine.pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="loading-spinner mx-auto mb-4" />
                    <p className="text-gray-600">PDF 문서를 분석하고 있습니다...</p>
                    <p className="text-xs text-gray-500 mt-2">잠시만 기다려주세요</p>
                  </div>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <div className="text-red-500 text-4xl">⚠️</div>
                    <p className="text-red-600">PDF 문서를 불러올 수 없습니다</p>
                    <div className="space-y-2">
                      <button 
                        onClick={retryLoadPdf}
                        className="btn-primary"
                      >
                        다시 시도
                      </button>
                      <p className="text-xs text-gray-500">
                        문제가 지속되면 기본 뷰어를 사용해주세요
                      </p>
                    </div>
                  </div>
                </div>
              }
              options={{
                cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                cMapPacked: true,
                verbosity: 1,
                standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
              }}
              className="pdf-viewer"
            >
              <div className={`flex ${settings.pageMode === 'double' ? 'space-x-4' : ''} justify-center`}>
                <Page
                  pageNumber={currentPage}
                  scale={settings.scale}
                  rotation={settings.rotation}
                  className="pdf-page shadow-lg"
                  width={pageWidth}
                />
                
                {settings.pageMode === 'double' && currentPage < numPages && (
                  <Page
                    pageNumber={currentPage + 1}
                    scale={settings.scale}
                    rotation={settings.rotation}
                    className="pdf-page shadow-lg"
                    width={pageWidth}
                  />
                )}
              </div>
            </Document>
          )}
        </div>
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
            {settings.pageMode === 'double' ? '2페이지 뷰' : '1페이지 뷰'}
          </span>
        </div>
        
        <div className="flex items-center space-x-4 text-gray-400">
          <span>← → (페이지) | +/- (확대) | 1/2 (모드) | R (회전) | ESC (닫기)</span>
        </div>
      </div>
    </div>
  );
};
