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
  Maximize2,
  RotateCcw,
  Minimize2,
  ArrowLeft
} from 'lucide-react';
import type { Magazine } from '../types/magazine';
import { getSeasonalTheme } from '../utils/theme';

// PDF.js를 전역으로 선언 (CDN에서 로드됨)
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface EBookViewerProps {
  magazine: Magazine;
  onClose: () => void;
}

export const EBookViewer: React.FC<EBookViewerProps> = ({ 
  magazine, 
  onClose 
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<'cover' | 'book'>('cover');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [pdfjsLoaded, setPdfjsLoaded] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  const coverCanvasRef = useRef<HTMLCanvasElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const theme = getSeasonalTheme(magazine.season);

  // 윈도우 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 전체화면 모드 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 최적 Canvas 크기 계산 (대형화 및 전체화면 지원)
  const getOptimalCanvasSize = () => {
    // const viewportWidth = windowSize.width;
    const viewportHeight = windowSize.height - (isFullscreen ? 0 : 140); // 전체화면시 UI 제외 안함
    
    let canvasWidth, canvasHeight;
    
    if (viewMode === 'cover') {
      // 표지는 A4 비율 (210:297)로 세로형 - 대형화
      const aspectRatio = 210 / 297;
      canvasHeight = Math.min(viewportHeight * (isFullscreen ? 0.95 : 0.9), isFullscreen ? 1200 : 1000);
      canvasWidth = canvasHeight * aspectRatio;
    } else {
      // 책 모드는 가로형 (각 페이지) - 대형화
      const aspectRatio = 297 / 210; // A4 가로
      canvasHeight = Math.min(viewportHeight * (isFullscreen ? 0.9 : 0.85), isFullscreen ? 1000 : 800);
      canvasWidth = canvasHeight * aspectRatio;
    }
    
    return {
      width: Math.floor(canvasWidth),
      height: Math.floor(canvasHeight)
    };
  };

  const optimalSize = getOptimalCanvasSize();

  // Firebase Storage URL with CORS bypass
  const getPdfUrl = () => {
    const originalUrl = magazine.pdfUrl;
    
    // 개발 환경에서는 프록시 사용
    if (import.meta.env.DEV && originalUrl.includes('firebasestorage.googleapis.com')) {
      // Firebase Storage URL을 프록시로 변환
      const proxyUrl = originalUrl.replace('https://firebasestorage.googleapis.com', '/api/pdf');
      console.log('[이북뷰어] 프록시 URL 사용:', proxyUrl);
      return proxyUrl;
    }
    
    console.log('[이북뷰어] 직접 Firebase PDF 사용:', originalUrl);
    return originalUrl;
  };

  // PDF.js CDN 로드
  const loadPDFJS = useCallback(async () => {
    if (window.pdfjsLib) {
      setPdfjsLoaded(true);
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        console.log('[이북뷰어] PDF.js CDN 로딩 완료');
        
        // PDF.js Worker 설정
        if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        
        setPdfjsLoaded(true);
        resolve();
      };
      script.onerror = () => {
        console.error('[이북뷰어] PDF.js CDN 로딩 실패');
        reject(new Error('PDF.js CDN 로딩 실패'));
      };
      document.head.appendChild(script);
    });
  }, []);

  // PDF 문서 로드
  const loadPDF = useCallback(async () => {
    if (!window.pdfjsLib) {
      setError('PDF.js 라이브러리가 로드되지 않았습니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const pdfUrl = getPdfUrl();
      console.log('[이북뷰어] PDF 로딩 시작:', pdfUrl);
      
      // Firebase Storage에서 PDF 로드
      const loadingTask = window.pdfjsLib.getDocument({
        url: pdfUrl,
        withCredentials: false,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
      });
      
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      
      console.log('[이북뷰어] PDF 로딩 완료. 총 페이지:', pdf.numPages);
      
      // 표지 렌더링
      await renderCoverPage(pdf);
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('[이북뷰어] PDF 로딩 에러:', err);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('CORS')) {
        setError(`Firebase Storage 접근 오류가 발생했습니다.\n\n가능한 해결 방법:\n1. 네트워크 연결을 확인해주세요\n2. 기본 PDF 뷰어를 사용해주세요\n3. 페이지를 새로고침 해보세요`);
      } else {
        setError(`PDF를 불러올 수 없습니다: ${err.message}`);
      }
      setIsLoading(false);
    }
  }, []);

  // 개선된 페이지 렌더링 함수 (대형화)
  const renderPage = async (pageNum: number, canvas: HTMLCanvasElement, customSize?: { width: number, height: number }) => {
    if (!pdfDoc || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (pageNum < 1 || pageNum > pdfDoc.numPages) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 빈 페이지 표시
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#6b7280';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('페이지 없음', canvas.width / 2, canvas.height / 2);
      return;
    }

    try {
      const page = await pdfDoc.getPage(pageNum);
      
      // 최적 크기 계산 (대형화)
      const size = customSize || optimalSize;
      const viewport = page.getViewport({ scale: 1.0 });
      
      // 화면에 맞는 스케일 계산 (더 크게)
      const scaleX = size.width / viewport.width;
      const scaleY = size.height / viewport.height;
      const optimalScale = Math.min(scaleX, scaleY) * scale * (isFullscreen ? 1.2 : 1.0); // 전체화면시 더 크게
      
      const scaledViewport = page.getViewport({ scale: optimalScale });
      
      // Canvas 크기 설정
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      
      // CSS 크기도 설정하여 선명도 확보
      canvas.style.width = `${scaledViewport.width}px`;
      canvas.style.height = `${scaledViewport.height}px`;
      
      // 고품질 렌더링을 위한 설정
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      const renderContext = {
        canvasContext: ctx,
        viewport: scaledViewport
      };
      
      await page.render(renderContext).promise;
      console.log(`[이북뷰어] 페이지 ${pageNum} 렌더링 완료 (크기: ${canvas.width}×${canvas.height})`);
    } catch (err) {
      console.error(`[이북뷰어] 페이지 ${pageNum} 렌더링 에러:`, err);
      
      // 에러 발생 시 에러 메시지 표시
      ctx.fillStyle = '#fef2f2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#dc2626';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`페이지 ${pageNum} 로딩 실패`, canvas.width / 2, canvas.height / 2);
    }
  };

  // 표지 페이지 렌더링 (대형화)
  const renderCoverPage = async (_pdf: any) => {
    if (!coverCanvasRef.current) return;
    await renderPage(1, coverCanvasRef.current, { 
      width: optimalSize.width, 
      height: optimalSize.height * (isFullscreen ? 1.3 : 1.4) // 표지는 더 크게
    });
  };

  // 책 모드 페이지 렌더링
  const renderBookPages = async (leftPageNum: number) => {
    if (!pdfDoc || !leftCanvasRef.current || !rightCanvasRef.current) return;
    
    try {
      setIsLoading(true);
      
      // 좌측 페이지 렌더링
      await renderPage(leftPageNum, leftCanvasRef.current);
      
      // 우측 페이지 렌더링
      const rightPageNum = leftPageNum + 1;
      await renderPage(rightPageNum, rightCanvasRef.current);
      
      console.log(`[이북뷰어] 책 페이지 렌더링 완료: ${leftPageNum}-${rightPageNum}`);
      setIsLoading(false);
    } catch (err) {
      console.error('[이북뷰어] 책 페이지 렌더링 에러:', err);
      setIsLoading(false);
    }
  };

  // 전체화면 토글
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('[이북뷰어] 전체화면 전환 에러:', err);
    }
  }, []);

  // 컴포넌트 마운트 시 PDF.js 로드 후 PDF 로드
  useEffect(() => {
    const initializeViewer = async () => {
      try {
        await loadPDFJS();
        await loadPDF();
      } catch (err) {
        console.error('[이북뷰어] 초기화 에러:', err);
        setError('이북 뷰어 초기화에 실패했습니다.');
        setIsLoading(false);
      }
    };

    initializeViewer();
  }, [loadPDFJS, loadPDF]);

  // 페이지 변경 시 렌더링 (화면 크기나 전체화면 변경시에도 재렌더링)
  useEffect(() => {
    if (pdfDoc && viewMode === 'book' && currentPage > 1) {
      renderBookPages(currentPage);
    } else if (pdfDoc && viewMode === 'cover') {
      renderCoverPage(pdfDoc);
    }
  }, [pdfDoc, currentPage, viewMode, scale, windowSize, isFullscreen]);

  // 페이지 변경 로직
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
      setViewMode(page === 1 ? 'cover' : 'book');
    }
  }, [numPages]);

  // 다음 페이지
  const nextPage = useCallback(() => {
    if (currentPage === 1) {
      // 표지에서 2-3페이지로
      goToPage(2);
    } else if (currentPage + 2 <= numPages) {
      // 책 모드에서는 2페이지씩 이동
      goToPage(currentPage + 2);
    }
  }, [currentPage, numPages, goToPage]);

  // 이전 페이지
  const prevPage = useCallback(() => {
    if (currentPage === 2) {
      // 2페이지에서 표지로
      goToPage(1);
    } else if (currentPage - 2 >= 1) {
      // 책 모드에서는 2페이지씩 이동
      goToPage(currentPage - 2);
    }
  }, [currentPage, goToPage]);

  // 확대/축소
  const handleZoom = useCallback((factor: number) => {
    const newScale = Math.max(0.5, Math.min(3.0, scale * factor));
    setScale(newScale);
  }, [scale]);

  // 스케일 리셋
  const resetZoom = useCallback(() => {
    setScale(1.0);
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
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            onClose();
          }
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
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage, handleZoom, resetZoom, onClose, goToPage, toggleFullscreen]);

  // 현재 표시할 페이지들 계산
  const getDisplayPages = () => {
    if (viewMode === 'cover' || currentPage === 1) {
      return [currentPage];
    } else {
      const rightPage = currentPage + 1;
      return rightPage <= numPages ? [currentPage, rightPage] : [currentPage];
    }
  };

  const displayPages = getDisplayPages();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* 상단 툴바 (전체화면시 숨김 가능) */}
      {!isFullscreen && (
        <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-lg">
          {/* 좌측: 홈으로 돌아가기 + 문서 정보 */}
          <div className="flex items-center space-x-4">
            {/* 큰 홈 버튼 */}
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg border-2 border-blue-500 hover:border-blue-400 font-medium"
              title="홈페이지로 돌아가기 (H 또는 ESC)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-semibold">홈으로</span>
            </button>

            <div className="w-px h-8 bg-gray-300" />
            
            <div 
              className="w-4 h-4 rounded-full animate-pulse shadow-lg"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <div>
              <h2 className="font-bold text-gray-900 text-lg">
                {magazine.title}
              </h2>
              <p className="text-sm text-gray-600">
                🎨 Canvas 고화질 이북 뷰어 • {numPages}페이지 • {magazine.fileSize}
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
                    <div className="text-xs text-gray-500">Cover Page</div>
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
                      / {numPages}페이지
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={nextPage}
              disabled={currentPage >= numPages || isLoading}
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
                  <span className="font-medium">표지모드</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">이중페이지</span>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {/* 전체화면 버튼 */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-gray-300"
              title="전체화면 (F)"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {/* 표지로 이동 버튼 */}
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
              {Math.round(scale * 100)}%
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
            
            {/* 작은 X 버튼 */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors border-2 border-transparent hover:border-red-300"
              title="닫기 (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 전체화면시 플로팅 컨트롤 - 홈 버튼 추가 */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 z-30 flex items-center space-x-2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
          {/* 홈 버튼 (전체화면용) */}
          <button
            onClick={onClose}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/20 text-white transition-all font-medium"
            title="홈으로 돌아가기"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">홈</span>
          </button>

          <div className="w-px h-4 bg-white/30 mx-2" />
          
          <button
            onClick={prevPage}
            disabled={currentPage <= 1 || isLoading}
            className="p-2 rounded-lg hover:bg-white/20 disabled:opacity-50 text-white transition-all"
            title="이전 페이지"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-white text-sm font-medium min-w-[60px] text-center">
            {viewMode === 'cover' ? '표지' : `${currentPage}/${numPages}`}
          </div>
          
          <button
            onClick={nextPage}
            disabled={currentPage >= numPages || isLoading}
            className="p-2 rounded-lg hover:bg-white/20 disabled:opacity-50 text-white transition-all"
            title="다음 페이지"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="w-px h-4 bg-white/30 mx-2" />
          
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-white/20 text-white transition-all"
            title="전체화면 종료"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* PDF 뷰어 영역 */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-black p-6">
        <div className="max-w-full mx-auto h-full">
          {/* 에러 상태 */}
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white max-w-3xl bg-gray-800 rounded-xl p-8 border border-gray-600">
                <div className="text-red-400 text-6xl mb-6">⚠️</div>
                <h3 className="text-xl font-bold mb-4 text-red-400">PDF 로딩 오류</h3>
                <div className="text-gray-300 mb-8 whitespace-pre-line text-left bg-gray-900 p-4 rounded-lg border text-sm">
                  {error}
                </div>
                <div className="space-x-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
                  >
                    🔄 페이지 새로고침
                  </button>
                  <button 
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors font-medium"
                  >
                    📖 홈으로 돌아가기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 로딩 상태 */}
          {(isLoading || !pdfjsLoaded) && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
              <div className="text-center text-white bg-gray-800 rounded-xl p-8 border border-gray-600">
                <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-blue-400" />
                <h3 className="text-xl font-bold mb-3">
                  🎨 Canvas 고화질 이북 뷰어 로딩
                </h3>
                <p className="text-gray-300 text-lg">
                  {!pdfjsLoaded ? 'PDF.js 라이브러리 로딩 중...' :
                   viewMode === 'cover' ? '표지 렌더링 중...' : 
                   '페이지 렌더링 중...'}
                </p>
                <div className="mt-4 text-sm text-gray-400">
                  대형 고화질로 렌더링하는 중입니다 (F키로 전체화면 지원)
                </div>
              </div>
            </div>
          )}

          {/* 이북 레이아웃 */}
          {!error && pdfjsLoaded && (
            <div className="h-full flex items-center justify-center">
              {viewMode === 'cover' ? (
                /* 표지 - 대형화 */
                <div className="relative group animate-fade-in">
                  <div 
                    className="bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] border-4 border-gray-200"
                    style={{ 
                      transform: `perspective(1200px) rotateY(2deg)`,
                      filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.3))'
                    }}
                  >
                    <canvas
                      ref={coverCanvasRef}
                      className="block"
                      style={{
                        maxWidth: '90vw',
                        maxHeight: isFullscreen ? '95vh' : '80vh',
                        borderRadius: 'inherit'
                      }}
                    />
                  </div>
                  {/* 표지 장식 효과 - 더 화려하게 */}
                  <div className="absolute -bottom-4 -right-4 w-full h-full bg-gray-600 rounded-xl -z-10 transform rotate-1 opacity-40"></div>
                  <div className="absolute -bottom-8 -right-8 w-full h-full bg-gray-500 rounded-xl -z-20 transform rotate-2 opacity-30"></div>
                  <div className="absolute -bottom-12 -right-12 w-full h-full bg-gray-400 rounded-xl -z-30 transform rotate-3 opacity-20"></div>
                  
                  {/* 표지 글로우 효과 */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-20 blur-xl -z-5"
                    style={{ backgroundColor: theme.colors.primary }}
                  ></div>
                </div>
              ) : (
                /* 책 모드 - 대형화 */
                <div className="relative animate-fade-in" style={{ perspective: '2000px' }}>
                  <div className="flex space-x-6 relative">
                    {/* 중앙 바인딩 라인 - 더 화려하게 */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-6 bg-gradient-to-b from-gray-700 via-gray-900 to-gray-700 transform -translate-x-1/2 z-10 rounded-full shadow-2xl border-2 border-gray-600">
                      <div className="w-full h-full bg-gradient-to-r from-transparent via-black/40 to-transparent rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-12 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full shadow-inner"></div>
                      {/* 바인딩 리벳 */}
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
                    </div>
                    
                    {/* 좌측 페이지 - 대형화 */}
                    <div
                      className="relative bg-white shadow-2xl overflow-hidden transition-all duration-500 rounded-l-xl border-4 border-gray-200"
                      style={{
                        transform: `perspective(1500px) rotateY(4deg) translateX(15px)`,
                        transformOrigin: 'right center',
                        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
                      }}
                    >
                      <canvas
                        ref={leftCanvasRef}
                        className="block bg-white"
                        style={{
                          borderRadius: 'inherit',
                          maxHeight: isFullscreen ? '90vh' : '80vh'
                        }}
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
                    
                    {/* 우측 페이지 - 대형화 */}
                    {displayPages.length === 2 && (
                      <div
                        className="relative bg-white shadow-2xl overflow-hidden transition-all duration-500 rounded-r-xl border-4 border-gray-200"
                        style={{
                          transform: `perspective(1500px) rotateY(-4deg) translateX(-15px)`,
                          transformOrigin: 'left center',
                          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
                        }}
                      >
                        <canvas
                          ref={rightCanvasRef}
                          className="block bg-white"
                          style={{
                            borderRadius: 'inherit',
                            maxHeight: isFullscreen ? '90vh' : '80vh'
                          }}
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
          )}
        </div>
      </div>

      {/* 하단 정보 바 (전체화면시 숨김) */}
      {!isFullscreen && (
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
              🎨 Canvas 대형 고화질 이북뷰어 • {Math.round(scale * 100)}% • {windowSize.width}×{windowSize.height}
            </span>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6 text-gray-400 text-sm">
            <span>← → (페이지)</span>
            <span>+/- (확대)</span>
            <span>0 (리셋)</span>
            <span>1 (표지)</span>
            <span>F (전체화면)</span>
            <span>H (홈)</span>
            <span>ESC (닫기)</span>
          </div>
        </div>
      )}

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
        
        canvas {
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