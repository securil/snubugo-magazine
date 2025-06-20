# 서울사대부고 동창회보 디지털 아카이브 프로젝트 명세서

## 📋 프로젝트 개요

### 프로젝트명
**SNUBUGO Magazine Digital Archive** - 서울대학교 사범대학 부설고등학교 동창회보 디지털 아카이브

### 프로젝트 목적
- 서울사대부고 동창회보의 체계적인 디지털 아카이브 구축
- 웹 기반 PDF 뷰어를 통한 온라인 열람 서비스 제공
- 계절별/연도별 분류 시스템을 통한 효율적인 콘텐츠 관리
- 반응형 웹 디자인을 통한 다양한 디바이스 지원

### 프로젝트 범위
- **아카이브 대상**: 2021년 116호 ~ 2025년 131호 (총 16개 호수)
- **발간 주기**: 분기별 (봄/여름/가을/겨울호)
- **지원 기능**: PDF 뷰어, 썸네일 미리보기, 검색/필터링, 반응형 UI

---

## 🛠️ 기술 스택 및 아키텍처

### Frontend Stack
```yaml
Framework: React 18 + TypeScript
Build Tool: Vite 6.x
Styling: Tailwind CSS 4.x
PDF Processing: React-PDF + PDF.js
State Management: Zustand 5.x
Routing: React Router DOM 7.x
Icons: Lucide React
```

### Backend & Storage
```yaml
File Storage: Firebase Storage
Database: JSON-based metadata (Static)
Authentication: None (Public Access)
CDN: Firebase Storage CDN
```

### Development Tools
```yaml
Package Manager: npm
Linting: ESLint + TypeScript ESLint
Code Formatting: Prettier (via ESLint)
Version Control: Git
CI/CD: GitHub Actions
```

---

## 🚀 배포 계획 및 환경 구성

### 개발 환경 (Development)
```yaml
Environment: Local Development Server
Branch: main (primary development branch)
Server: Vite Dev Server (localhost:3000)
Hot Reload: Enabled
Source Maps: Enabled
Debug Mode: Enabled
```

### 스테이징 환경 (Staging)
```yaml
Environment: GitHub Pages Preview
Branch: main (auto-deploy on push)
URL: https://securil.github.io/snubugo-magazine/
Build: Production build with source maps
Testing: Manual QA testing
```

### 프로덕션 환경 (Production)
```yaml
Environment: GitHub Pages
Branch: gh-pages (auto-deployed via GitHub Actions)
URL: https://securil.github.io/snubugo-magazine/
Build: Optimized production build
Monitoring: GitHub Pages Analytics
CDN: GitHub Pages CDN + Firebase Storage CDN
```

### CI/CD Pipeline
```yaml
Trigger: Push to main branch
Build Process:
  1. Install dependencies (npm ci)
  2. Type checking (tsc --noEmit)
  3. Linting (eslint)
  4. Build production bundle (npm run build)
  5. Deploy to gh-pages branch
  6. Update GitHub Pages deployment
```

---

## 📁 프로젝트 구조 및 파일 기능

### 루트 디렉토리 구조
```
snubugo-magazine/
├── 📁 .github/workflows/          # GitHub Actions CI/CD
│   └── deploy.yml                # 자동 배포 워크플로우
├── 📁 public/                    # 정적 자산
│   ├── 📁 pdfs/                  # PDF 파일 (로컬 개발용)
│   ├── 📁 thumbnails/            # 썸네일 이미지 (GitHub 호스팅)
│   ├── magazines.json            # 동창회보 메타데이터
│   ├── favicon.ico               # 사이트 아이콘
│   └── index.html               # HTML 엔트리 포인트
├── 📁 scripts/                   # 유틸리티 스크립트
│   └── upload-to-firebase.js     # Firebase 업로드 스크립트
├── 📁 src/                       # 소스 코드
│   ├── 📁 components/            # React 컴포넌트
│   ├── 📁 firebase/              # Firebase 설정
│   ├── 📁 hooks/                 # 커스텀 React 훅
│   ├── 📁 store/                 # 상태 관리 (Zustand)
│   ├── 📁 types/                 # TypeScript 타입 정의
│   ├── 📁 utils/                 # 유틸리티 함수
│   ├── App.tsx                   # 메인 애플리케이션 컴포넌트
│   ├── main.tsx                  # 앱 진입점
│   └── index.css                 # 전역 스타일
├── package.json                  # 패키지 의존성 및 스크립트
├── vite.config.ts               # Vite 빌드 설정
├── tailwind.config.js           # Tailwind CSS 설정
├── tsconfig.json                # TypeScript 설정
└── README.md                    # 프로젝트 개요 및 사용법
```

### 핵심 컴포넌트 아키텍처

#### 📱 UI Components (`src/components/`)
```yaml
Header.tsx:
  기능: 브랜딩, 네비게이션, 검색 인터페이스
  책임: 전역 헤더 UI, 브랜드 아이덴티티

MagazineList.tsx:
  기능: 동창회보 목록 표시, 필터링, 정렬
  책임: 카드 레이아웃, 무한 스크롤, 검색 결과

MagazineCard.tsx:
  기능: 개별 동창회보 미리보기 카드
  책임: 썸네일 표시, 메타데이터 출력, 클릭 핸들링

MagazineViewer.tsx:
  기능: PDF 뷰어 (단일/2페이지 모드)
  책임: PDF 렌더링, 페이지 네비게이션, 확대/축소

ViewerControls.tsx:
  기능: 뷰어 컨트롤 패널
  책임: 페이지 이동, 모드 전환, 확대/축소 컨트롤

LoadingSpinner.tsx:
  기능: 로딩 상태 표시
  책임: 사용자 피드백, 로딩 애니메이션

ErrorBoundary.tsx:
  기능: 오류 처리 및 복구
  책임: 오류 캐치, 사용자 친화적 오류 메시지
```

#### 🔥 Firebase Integration (`src/firebase/`)
```yaml
config.ts:
  기능: Firebase 초기화 및 설정
  책임: Firebase 앱 인스턴스, Storage 설정

storage.ts:
  기능: Firebase Storage 상호작용
  책임: 파일 다운로드 URL 생성, 메타데이터 관리

types.ts:
  기능: Firebase 관련 타입 정의
  책임: Storage 응답 타입, 에러 타입 정의
```

#### 🎣 Custom Hooks (`src/hooks/`)
```yaml
useMagazineData.ts:
  기능: 동창회보 데이터 관리
  책임: 데이터 페칭, 캐싱, 상태 관리

usePdfViewer.ts:
  기능: PDF 뷰어 상태 관리
  책임: 페이지 상태, 확대/축소, 모드 전환

useSearch.ts:
  기능: 검색 및 필터링 로직
  책임: 검색어 처리, 필터 적용, 결과 정렬

useResponsive.ts:
  기능: 반응형 디자인 지원
  책임: 화면 크기 감지, 브레이크포인트 관리
```

#### 🗄️ State Management (`src/store/`)
```yaml
magazineStore.ts:
  기능: 전역 동창회보 상태 관리
  책임: 메타데이터 캐시, 검색 상태, 사용자 설정

viewerStore.ts:
  기능: PDF 뷰어 전역 상태
  책임: 현재 문서, 페이지 상태, 뷰어 설정

uiStore.ts:
  기능: UI 상태 관리
  책임: 모달 상태, 로딩 상태, 에러 상태
```

#### 📝 Type Definitions (`src/types/`)
```yaml
magazine.ts:
  정의: 동창회보 관련 타입
  타입: Magazine, MagazineMetadata, Season

viewer.ts:
  정의: PDF 뷰어 관련 타입
  타입: ViewerMode, PageInfo, ZoomLevel

api.ts:
  정의: API 응답 타입
  타입: ApiResponse, ErrorResponse, LoadingState
```

---

## 🏗️ 데이터 아키텍처

### 메타데이터 구조 (`magazines.json`)
```typescript
interface MagazineData {
  magazines: Magazine[];
  settings: ProjectSettings;
}

interface Magazine {
  id: string;                    // 고유 식별자 (YYYY-season-issue)
  year: number;                  // 발간 연도
  season: Season;                // 계절 (봄/여름/가을/겨울)
  issue: number;                 // 호수
  month: number;                 // 발간 월 (3,6,9,12)
  title: string;                 // 동창회보 제목
  description: string;           // 간단한 설명
  pdfUrl: string;               // Firebase Storage PDF URL
  thumbnailUrl: string;         // Firebase Storage 썸네일 URL
  pageCount: number;            // 페이지 수
  publishDate: string;          // 발간일 (YYYY-MM-DD)
  fileSize: string;             // 파일 크기
  isLatest: boolean;            // 최신호 여부
  featured: boolean;            // 추천호 여부
  tags: string[];              // 태그 배열
  category: string;            // 카테고리
}

type Season = '봄' | '여름' | '가을' | '겨울';
```

### Firebase Storage 구조
```
snubugo-magazine.firebasestorage.app/
├── 📁 pdfs/                          # PDF 파일 저장소
│   ├── 2021년 116호-서울사대부고 봄호.pdf
│   ├── 2021년 117호-서울사대부고 여름호.pdf
│   └── ... (총 16개 파일)
└── 📁 thumbnails/                    # 썸네일 이미지 저장소
    ├── 2021년 116호-서울사대부고 봄호.png
    ├── 2021년 117호-서울사대부고 여름호.png
    └── ... (총 16개 파일)
```

---

## 🎨 사용자 인터페이스 설계

### Design System
```yaml
Color Scheme:
  Primary: '#1e40af' (Blue 800)
  Secondary: '#3b82f6' (Blue 500)
  Accent: '#f59e0b' (Amber 500)
  Neutral: '#6b7280' (Gray 500)

Seasonal Colors:
  Spring: '#10b981' (Emerald 500)
  Summer: '#f59e0b' (Amber 500)
  Fall: '#f97316' (Orange 500)
  Winter: '#3b82f6' (Blue 500)

Typography:
  Headings: Inter, system fonts
  Body: Inter, system fonts
  Monospace: JetBrains Mono, monospace

Spacing Scale: Tailwind default (4px base unit)
Border Radius: Tailwind default (0.25rem base unit)
```

### 반응형 브레이크포인트
```yaml
Mobile: 320px - 768px (sm)
Tablet: 768px - 1024px (md)
Desktop: 1024px - 1280px (lg)
Large Desktop: 1280px+ (xl)

PDF Viewer:
  Single Page: < 1920px width
  Dual Page: >= 1920px width (auto-enabled)
```

### 접근성 (Accessibility)
```yaml
WCAG Level: AA 준수
Keyboard Navigation: 전체 지원
Screen Reader: 시맨틱 마크업
Color Contrast: 4.5:1 이상
Focus Management: 명확한 포커스 표시
```

---

## 📱 주요 기능 명세

### 1. 동창회보 목록 (Magazine List)
```yaml
기능:
  - 그리드/리스트 레이아웃 지원
  - 계절별 색상 구분 표시
  - 연도별/계절별 필터링
  - 제목 기반 검색
  - 최신호/추천호 하이라이트

상호작용:
  - 카드 클릭 시 뷰어 모드로 전환
  - 썸네일 호버 시 확대 프리뷰
  - 무한 스크롤 또는 페이지네이션

성능:
  - 가상화된 리스트 (16개 아이템)
  - 썸네일 지연 로딩 (Lazy Loading)
  - 메타데이터 캐싱
```

### 2. PDF 뷰어 (PDF Viewer)
```yaml
기본 기능:
  - PDF 렌더링 (PDF.js 기반)
  - 페이지 네비게이션 (이전/다음)
  - 확대/축소 (25% ~ 500%)
  - 전체화면 모드

고급 기능:
  - 2페이지 보기 모드 (1920px+ 자동 활성화)
  - 페이지 직접 이동 (점프)
  - 키보드 단축키 지원
  - 브라우저 뒤로가기 지원

모바일 최적화:
  - 터치 제스처 (핀치 줌, 스와이프)
  - 세로 방향 최적화
  - 가상 키보드 대응
```

### 3. 검색 및 필터링
```yaml
검색 기능:
  - 제목 기반 실시간 검색
  - 한글/영문 혼합 지원
  - 검색어 하이라이트
  - 검색 히스토리 (로컬 저장)

필터링 옵션:
  - 연도별 필터 (2021-2025)
  - 계절별 필터 (봄/여름/가을/겨울)
  - 태그 기반 필터
  - 정렬 옵션 (최신순/오래된순/제목순)
```

---

## ⚡ 성능 최적화 전략

### Bundle Optimization
```yaml
Code Splitting:
  - 라우트 기반 청크 분할
  - 동적 import 활용
  - Vendor 패키지 분리

Asset Optimization:
  - 이미지 최적화 (WebP, AVIF)
  - PDF 스트리밍 로딩
  - 폰트 서브셋팅

Caching Strategy:
  - 메타데이터 캐싱 (Browser Cache)
  - PDF 캐싱 (Service Worker)
  - 썸네일 캐싱 (Memory + Disk)
```

### Runtime Performance
```yaml
React Optimization:
  - React.memo로 불필요한 렌더링 방지
  - useMemo/useCallback 적절한 사용
  - 컴포넌트 지연 로딩

PDF Rendering:
  - 가시 영역 페이지만 렌더링
  - Worker 스레드 활용
  - Canvas 메모리 관리

State Management:
  - 필요한 상태만 구독
  - 불변성 유지
  - 정규화된 상태 구조
```

---

## 🔒 보안 고려사항

### Firebase Security Rules
```javascript
// 읽기 전용 액세스
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pdfs/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
    match /thumbnails/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 클라이언트 보안
```yaml
XSS Prevention:
  - React의 기본 XSS 보호 활용
  - innerHTML 대신 textContent 사용
  - 신뢰할 수 없는 입력 검증

Content Security Policy:
  - 엄격한 CSP 헤더 설정
  - 인라인 스크립트 제한
  - 외부 리소스 제한

Privacy:
  - 개인정보 수집 최소화
  - 쿠키 사용 최소화
  - GDPR 고려사항 (해당시)
```

---

## 🧪 테스트 전략

### Unit Testing
```yaml
Framework: Jest + React Testing Library
Coverage Target: 80% 이상
Test Scope:
  - 유틸리티 함수
  - 커스텀 훅
  - 컴포넌트 로직
```

### Integration Testing
```yaml
PDF Viewer Integration:
  - PDF 로딩 테스트
  - 페이지 네비게이션 테스트
  - 모드 전환 테스트

Firebase Integration:
  - 데이터 페칭 테스트
  - 에러 핸들링 테스트
  - 캐싱 동작 테스트
```

### E2E Testing
```yaml
Framework: Playwright
Scenarios:
  - 사용자 플로우 테스트
  - 크로스 브라우저 테스트
  - 성능 회귀 테스트
```

---

## 📈 모니터링 및 분석

### 성능 모니터링
```yaml
Core Web Vitals:
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1

Custom Metrics:
  - PDF 로딩 시간
  - 검색 응답 시간
  - 에러 발생률
```

### 사용자 분석
```yaml
Analytics Platform: Google Analytics 4
Tracking Events:
  - 페이지 조회수
  - 동창회보 열람률
  - 검색 키워드 분석
  - 사용자 이탈률
```

---

## 🚀 로드맵 및 향후 계획

### Phase 1: MVP (현재)
```yaml
기간: 2주
목표: 기본 동창회보 뷰어 완성
포함 기능:
  - 동창회보 목록
  - PDF 뷰어
  - 기본 검색/필터링
```

### Phase 2: Enhanced Features
```yaml
기간: 1개월
목표: 사용자 경험 개선
포함 기능:
  - 북마크 시스템
  - 다크 모드
  - 고급 검색
  - 소셜 공유
```

### Phase 3: Advanced Features
```yaml
기간: 2개월
목표: 고급 기능 추가
포함 기능:
  - 사용자 주석/하이라이트
  - 오프라인 지원
  - PWA 변환
  - 관리자 대시보드
```

---

## 👥 팀 구성 및 역할

### 개발팀
```yaml
Frontend Developer:
  - React/TypeScript 개발
  - UI/UX 구현
  - 성능 최적화

DevOps Engineer:
  - CI/CD 파이프라인 구축
  - 배포 환경 관리
  - 모니터링 시스템 구축

QA Engineer:
  - 테스트 케이스 작성
  - 수동/자동화 테스트 수행
  - 버그 추적 및 검증
```

---

## 📞 연락처 및 참고자료

### 프로젝트 정보
```yaml
Repository: https://github.com/securil/snubugo-magazine
Live Demo: https://securil.github.io/snubugo-magazine/
Documentation: /docs/
Issue Tracker: GitHub Issues
```

### 기술 문서
```yaml
React: https://react.dev/
TypeScript: https://www.typescriptlang.org/
Vite: https://vitejs.dev/
Tailwind CSS: https://tailwindcss.com/
Firebase: https://firebase.google.com/
PDF.js: https://mozilla.github.io/pdf.js/
```

---

**Last Updated**: 2025.06.20  
**Document Version**: 1.0.0  
**Project Status**: In Development
