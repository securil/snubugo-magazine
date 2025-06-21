/**
 * 계절별 테마 및 색상 시스템
 * 서울사대부고 동창회보의 계절별 비주얼 아이덴티티
 */

export type Season = '봄' | '여름' | '가을' | '겨울';

export interface SeasonalTheme {
  season: Season;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    gradient: string;
    text: string;
    textSecondary: string;
  };
  icon: string;
  emoji: string;
  description: string;
}

export const SEASONAL_THEMES: Record<Season, SeasonalTheme> = {
  '봄': {
    season: '봄',
    colors: {
      primary: '#FFB7C5',      // 벚꽃 핑크
      secondary: '#98FB98',    // 연두색
      accent: '#FF69B4',       // 진한 핑크
      background: '#FFF5F8',   // 매우 연한 핑크
      gradient: 'linear-gradient(135deg, #FFB7C5 0%, #98FB98 100%)',
      text: '#2D3748',         // 다크 그레이
      textSecondary: '#718096' // 미디엄 그레이
    },
    icon: '🌸',
    emoji: '🌸',
    description: '새로운 시작과 희망의 계절'
  },
  '여름': {
    season: '여름',
    colors: {
      primary: '#87CEEB',      // 하늘색
      secondary: '#F0E68C',    // 연한 노란색
      accent: '#4169E1',       // 로얄 블루
      background: '#F0F9FF',   // 매우 연한 블루
      gradient: 'linear-gradient(135deg, #87CEEB 0%, #F0E68C 100%)',
      text: '#2D3748',
      textSecondary: '#718096'
    },
    icon: '☀️',
    emoji: '🌊',
    description: '활기찬 에너지와 성장의 계절'
  },
  '가을': {
    season: '가을',
    colors: {
      primary: '#DEB887',      // 갈색
      secondary: '#FF8C00',    // 주황색
      accent: '#CD853F',       // 페루 색상
      background: '#FDF6E3',   // 매우 연한 주황
      gradient: 'linear-gradient(135deg, #DEB887 0%, #FF8C00 100%)',
      text: '#2D3748',
      textSecondary: '#718096'
    },
    icon: '🍂',
    emoji: '🍁',
    description: '성숙과 결실의 계절'
  },
  '겨울': {
    season: '겨울',
    colors: {
      primary: '#B0C4DE',      // 연한 파랑
      secondary: '#F8F8FF',    // 거의 흰색
      accent: '#4682B4',       // 스틸 블루
      background: '#F8FAFC',   // 매우 연한 그레이
      gradient: 'linear-gradient(135deg, #B0C4DE 0%, #F8F8FF 100%)',
      text: '#2D3748',
      textSecondary: '#718096'
    },
    icon: '❄️',
    emoji: '☃️',
    description: '고요한 성찰과 준비의 계절'
  }
};

/**
 * 계절에 따른 테마 가져오기
 */
export const getSeasonalTheme = (season: Season): SeasonalTheme => {
  return SEASONAL_THEMES[season];
};

/**
 * 현재 월에 따른 계절 자동 감지
 */
export const getCurrentSeason = (): Season => {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 3 && month <= 5) return '봄';
  if (month >= 6 && month <= 8) return '여름';
  if (month >= 9 && month <= 11) return '가을';
  return '겨울';
};

/**
 * 발행 월에 따른 계절 감지
 */
export const getSeasonByMonth = (month: number): Season => {
  if (month >= 3 && month <= 5) return '봄';
  if (month >= 6 && month <= 8) return '여름';
  if (month >= 9 && month <= 11) return '가을';
  return '겨울';
};

/**
 * CSS 변수로 테마 적용
 */
export const applyThemeToRoot = (theme: SeasonalTheme): void => {
  const root = document.documentElement;
  
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-background', theme.colors.background);
  root.style.setProperty('--theme-gradient', theme.colors.gradient);
  root.style.setProperty('--theme-text', theme.colors.text);
  root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
};

/**
 * 계절별 Tailwind 클래스명 생성
 */
export const getSeasonalClasses = (season: Season) => {
  const baseClasses = {
    '봄': {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      text: 'text-pink-800',
      accent: 'text-pink-600',
      hover: 'hover:bg-pink-100'
    },
    '여름': {
      bg: 'bg-blue-50',
      border: 'border-blue-200', 
      text: 'text-blue-800',
      accent: 'text-blue-600',
      hover: 'hover:bg-blue-100'
    },
    '가을': {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800', 
      accent: 'text-orange-600',
      hover: 'hover:bg-orange-100'
    },
    '겨울': {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-800',
      accent: 'text-slate-600', 
      hover: 'hover:bg-slate-100'
    }
  };
  
  return baseClasses[season];
};
