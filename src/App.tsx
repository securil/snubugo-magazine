import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { RecentIssues } from './components/RecentIssues';
import { ArchiveExplorer } from './components/ArchiveExplorer';
import { MagazineViewer } from './components/MagazineViewer';
import type { Magazine } from './types/magazine';
import { getCurrentSeason, applyThemeToRoot, getSeasonalTheme } from './utils/theme';

function App() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [selectedMagazine, setSelectedMagazine] = useState<Magazine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 매거진 데이터 로드
  useEffect(() => {
    const loadMagazines = async () => {
      try {
        console.log('[App] 매거진 데이터 로딩 시작...');
        const url = `${import.meta.env.BASE_URL}magazines.json`;
        console.log('[App] 요청 URL:', url);
        
        const response = await fetch(url);
        console.log('[App] 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`매거진 데이터를 불러올 수 없습니다. 상태: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[App] 로드된 데이터:', data);
        console.log('[App] 매거진 개수:', data.magazines?.length);
        
        // 날짜 순으로 정렬 (최신순)
        const sortedMagazines = data.magazines.sort((a: Magazine, b: Magazine) => {
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
        });
        
        setMagazines(sortedMagazines);
        console.log('[App] 매거진 데이터 로딩 완료!');
      } catch (err) {
        console.error('[App] 매거진 로딩 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadMagazines();
  }, []);

  // 현재 계절에 따른 테마 적용
  useEffect(() => {
    if (magazines.length > 0) {
      // 최신호의 계절로 테마 설정
      const latestMagazine = magazines[0];
      const theme = getSeasonalTheme(latestMagazine.season);
      applyThemeToRoot(theme);
      
      // 페이지 제목 업데이트
      document.title = `서울사대부고 동창회보 - ${latestMagazine.title}`;
    } else {
      // 기본 테마 (현재 계절)
      const currentSeason = getCurrentSeason();
      const theme = getSeasonalTheme(currentSeason);
      applyThemeToRoot(theme);
    }
  }, [magazines]);

  const handleViewMagazine = (magazine: Magazine) => {
    console.log('[App] 매거진 뷰어 열기:', magazine.title);
    console.log('[App] PDF URL:', magazine.pdfUrl);
    console.log('[App] 썸네일 URL:', magazine.thumbnailUrl);
    setSelectedMagazine(magazine);
    
    // 선택된 매거진의 계절로 테마 변경
    const theme = getSeasonalTheme(magazine.season);
    applyThemeToRoot(theme);
  };

  const handleCloseViewer = () => {
    console.log('[App] 매거진 뷰어 닫기');
    setSelectedMagazine(null);
    
    // 최신호 테마로 복귀
    if (magazines.length > 0) {
      const latestMagazine = magazines[0];
      const theme = getSeasonalTheme(latestMagazine.season);
      applyThemeToRoot(theme);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            서울사대부고 동창회보
          </h2>
          <p className="text-gray-600">매거진을 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            오류가 발생했습니다
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 매거진이 없는 경우
  if (magazines.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            동창회보를 준비 중입니다
          </h2>
          <p className="text-gray-600">곧 멋진 매거진들을 만나보실 수 있습니다.</p>
        </div>
      </div>
    );
  }

  const latestMagazine = magazines[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />
      
      <main className="animate-fade-in">
        {/* Hero Section - 최신호 대형 카드 */}
        <HeroSection 
          latestMagazine={latestMagazine}
          onRead={handleViewMagazine}
        />
        
        {/* Recent Issues - 최근 2-3호 */}
        <RecentIssues 
          magazines={magazines}
          onRead={handleViewMagazine}
        />
        
        {/* Archive Explorer - 년도/계절 탐색 */}
        <ArchiveExplorer 
          magazines={magazines}
          onRead={handleViewMagazine}
        />
        
        {/* 푸터 */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container-main">
            <div className="grid md:grid-cols-3 gap-8">
              {/* 브랜드 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">서울사대부고 동창회보</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  서울대학교 사범대학 부설고등학교 동창회보의 디지털 아카이브입니다. 
                  동문들의 소중한 이야기와 추억을 함께 나누어요.
                </p>
              </div>
              
              {/* 발행 정보 */}
              <div>
                <h4 className="font-medium mb-4">발행 정보</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• 발행 주기: 분기별 (봄/여름/가을/겨울)</li>
                  <li>• 발행 월: 3월, 6월, 9월, 12월</li>
                  <li>• 총 아카이브: {magazines.length}개 호수</li>
                  <li>• 기간: 2021년 ~ 현재</li>
                </ul>
              </div>
              
              {/* 기술 정보 */}
              <div>
                <h4 className="font-medium mb-4">사이트 정보</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• 디지털 아카이브 플랫폼</li>
                  <li>• 모든 기기에서 접근 가능</li>
                  <li>• PDF 다운로드 지원</li>
                  <li>• 무료 열람 서비스</li>
                </ul>
              </div>
            </div>
            
            {/* 하단 정보 */}
            <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
              <p>© 2025 서울대학교 사범대학 부설고등학교 동창회. All rights reserved.</p>
              <p className="mt-1">Made with ❤️ for SNUBUGO Alumni</p>
            </div>
          </div>
        </footer>
      </main>
      
      {/* PDF 뷰어 모달 */}
      {selectedMagazine && (
        <MagazineViewer
          magazine={selectedMagazine}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
}

export default App;
