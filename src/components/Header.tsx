import React, { useState } from 'react';
import { BookOpen, Search, Menu, X, Github } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          
          {/* 로고 및 타이틀 */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div 
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                서울사대부고 동창회보
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                SNUBUGO Magazine Digital Archive
              </p>
            </div>
          </div>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:flex items-center space-x-6">
            {/* 검색 바 */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="동창회보 검색..."
                className="block w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </form>

            {/* 네비게이션 링크 */}
            <nav className="flex items-center space-x-4">
              <a 
                href="#latest" 
                className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors"
              >
                최신호
              </a>
              <a 
                href="#archive" 
                className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors"
              >
                아카이브
              </a>
              <a 
                href="https://github.com/securil/snubugo-magazine" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                title="GitHub Repository"
              >
                <Github className="h-5 w-5" />
              </a>
            </nav>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-slide-up">
            <div className="space-y-4">
              {/* 모바일 검색 */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="동창회보 검색..."
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </form>

              {/* 모바일 네비게이션 */}
              <nav className="space-y-2">
                <a 
                  href="#latest" 
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📚 최신호
                </a>
                <a 
                  href="#archive" 
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📖 아카이브
                </a>
                <a 
                  href="https://github.com/securil/snubugo-magazine" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  💻 GitHub
                </a>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* 계절별 테마 인디케이터 */}
      <div 
        className="h-1"
        style={{ background: 'var(--theme-gradient)' }}
      />
    </header>
  );
};

// 기존 컴포넌트 호환성
export default Header;
