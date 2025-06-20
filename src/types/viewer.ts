// PDF 뷰어 관련 타입 정의

export type ViewerMode = 'single' | 'dual';
export type ZoomLevel = number; // 0.25 ~ 5.0

export interface PageInfo {
  current: number;
  total: number;
}

export interface ViewerState {
  mode: ViewerMode;
  zoom: ZoomLevel;
  page: PageInfo;
  isFullscreen: boolean;
  isLoading: boolean;
}

export interface ViewerActions {
  setMode: (mode: ViewerMode) => void;
  setZoom: (zoom: ZoomLevel) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  toggleFullscreen: () => void;
  resetZoom: () => void;
}

// PDF.js 관련 타입
export interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
}

export interface PDFPageProxy {
  render: (renderContext: any) => any;
  getViewport: (options: { scale: number }) => any;
}
