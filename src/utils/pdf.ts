/**
 * Firebase Storage와 PDF 로딩을 위한 유틸리티 함수들
 */

/**
 * PDF URL에 CORS 헤더를 추가하여 가져오기
 */
export const fetchPdfWithCors = async (url: string): Promise<ArrayBuffer> => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
        'Content-Type': 'application/pdf',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('PDF 가져오기 실패:', error);
    throw error;
  }
};

/**
 * Firebase Storage URL이 유효한지 확인
 */
export const validateFirebaseUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('firebasestorage.googleapis.com');
  } catch {
    return false;
  }
};

/**
 * PDF URL에 캐시 버스터 추가
 */
export const addCacheBuster = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}`;
};

/**
 * PDF 로딩을 위한 프록시 URL 생성 (필요시)
 */
export const createProxyUrl = (originalUrl: string): string => {
  // 개발 환경에서는 원본 URL 사용
  if (import.meta.env.DEV) {
    return originalUrl;
  }
  
  // 프로덕션에서 CORS 문제가 있을 경우 프록시 사용
  return originalUrl;
};

/**
 * Firebase Storage URL에서 파일 메타데이터 추출
 */
export const extractFileInfo = (url: string) => {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const encodedFileName = pathSegments[pathSegments.length - 1];
    const fileName = decodeURIComponent(encodedFileName);
    
    return {
      fileName,
      bucket: pathSegments[3],
      path: pathSegments.slice(4).join('/'),
    };
  } catch (error) {
    console.error('URL 파싱 실패:', error);
    return null;
  }
};
