# 🎓 서울사대부고 동창회보 디지털 아카이브

Firebase Storage 기반의 React PDF 뷰어 웹 애플리케이션

## 🌐 Live Demo

**🔗 [https://securil.github.io/snubugo-magazine/](https://securil.github.io/snubugo-magazine/)**

## ✨ 주요 기능

- 📱 **반응형 웹 디자인** - 모바일/태블릿/데스크톱 최적화
- 📄 **PDF 뷰어** - React-PDF 기반 고성능 뷰어
- 🔍 **검색 및 필터링** - 연도별/계절별 필터링
- 🎨 **계절별 테마** - 시각적으로 구분되는 색상 체계
- ☁️ **Firebase Storage** - 클라우드 기반 파일 관리
- 🚀 **자동 배포** - GitHub Actions로 자동 빌드/배포

## 🏗️ 기술 스택

- **Frontend**: React 19.1 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.x
- **PDF Viewer**: React-PDF + PDF.js
- **Storage**: Firebase Storage
- **Deployment**: GitHub Pages (gh-pages branch)

## 📂 프로젝트 구조

```
main 브랜치 (개발):
├── src/                 # React 소스 코드
├── public/              # 정적 파일
├── .github/workflows/   # GitHub Actions
└── package.json         # 프로젝트 설정

gh-pages 브랜치 (배포):
└── dist/               # 빌드된 정적 파일들
```

## 🚀 개발 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/securil/snubugo-magazine.git
cd snubugo-magazine

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 빌드
npm run build
```

## 📋 배포 프로세스

1. **main** 브랜치에 push
2. **GitHub Actions** 자동 실행
3. **빌드** (`npm run build`)
4. **gh-pages** 브랜치에 자동 배포
5. **GitHub Pages**에서 웹사이트 제공

## 🗂️ 데이터 구조

### Firebase Storage
- `pdfs/` - PDF 파일들
- `thumbnails/` - 썸네일 이미지들

### 메타데이터 (magazines.json)
```json
{
  "magazines": [
    {
      "id": "2025-여름-131",
      "year": 2025,
      "season": "여름",
      "title": "2025년 131호 서울사대부고 여름호",
      "pdfUrl": "Firebase Storage URL",
      "thumbnailUrl": "Firebase Storage URL"
    }
  ]
}
```

## 🎨 UI/UX 특징

- **계절별 색상 구분**:
  - 🌸 봄: 연분홍/연두
  - ☀️ 여름: 하늘색/노랑
  - 🍂 가을: 주황/갈색
  - ❄️ 겨울: 파랑/회색

- **반응형 그리드**:
  - 모바일: 1열
  - 태블릿: 2열
  - 데스크톱: 3-4열

## 📱 지원 브라우저

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 라이선스

MIT License

---

**개발팀**: securil  
**최종 업데이트**: 2025.06.20
