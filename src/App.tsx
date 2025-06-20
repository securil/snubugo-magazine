import { useState, useEffect } from 'react';
import Header from './components/Header';
import MagazineList from './components/MagazineList';
import MagazineViewer from './components/MagazineViewer';

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
        
        setMagazines(data.magazines);
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

  const handleViewMagazine = (magazine: Magazine) => {
    console.log('[App] 매거진 뷰어 열기:', magazine.title);
    console.log('[App] PDF URL:', magazine.pdfUrl);
    console.log('[App] 썸네일 URL:', magazine.thumbnailUrl);
    setSelectedMagazine(magazine);
  };

  const handleCloseViewer = () => {
    console.log('[App] 매거진 뷰어 닫기');
    setSelectedMagazine(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">동창회보 목록을 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">⚠️ 오류가 발생했습니다</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 btn-primary"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <MagazineList 
          magazines={magazines}
          onViewMagazine={handleViewMagazine}
        />
      </main>
      
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
