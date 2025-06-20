// Firebase 설정 파일
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Firebase 설정 객체
const firebaseConfig = {
  apiKey: "AIzaSyAxZH44BgF0DmGKzKQD8_W8kEDV-Kyc7RI",
  authDomain: "snubugo-magazine.firebaseapp.com",
  projectId: "snubugo-magazine",
  storageBucket: "snubugo-magazine.firebasestorage.app",
  messagingSenderId: "451560685047",
  appId: "1:451560685047:web:641f19728accf6a2e902f2",
  measurementId: "G-SSX13V1Z8P"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase Storage 인스턴스
export const storage = getStorage(app);

// 기본 앱 내보내기
export default app;
