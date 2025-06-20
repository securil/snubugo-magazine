// ES Module 형식의 Firebase Storage 업로드 스크립트
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname 대체 (ES Module에서)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAxZH44BgF0DmGKzKQD8_W8kEDV-Kyc7RI",
  authDomain: "snubugo-magazine.firebaseapp.com",
  projectId: "snubugo-magazine",
  storageBucket: "snubugo-magazine.firebasestorage.app",
  messagingSenderId: "451560685047",
  appId: "1:451560685047:web:641f19728accf6a2e902f2",
  measurementId: "G-SSX13V1Z8P"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// 파일 업로드 함수
async function uploadFile(filePath, storagePath, contentType) {
  try {
    console.log(`📤 업로드 시작: ${path.basename(filePath)}`);
    
    // 파일 읽기
    const fileBuffer = fs.readFileSync(filePath);
    
    // Storage 참조 생성
    const storageRef = ref(storage, storagePath);
    
    // 파일 업로드
    const snapshot = await uploadBytes(storageRef, fileBuffer, {
      contentType: contentType
    });
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`✅ 업로드 완료: ${path.basename(filePath)}`);
    return downloadURL;
    
  } catch (error) {
    console.error(`❌ 업로드 실패 ${path.basename(filePath)}:`, error.message);
    return null;
  }
}

// 모든 파일 업로드
async function uploadAllFiles() {
  const publicDir = path.join(__dirname, '..', 'public');
  const pdfsDir = path.join(publicDir, 'pdfs');
  const thumbnailsDir = path.join(publicDir, 'thumbnails');
  
  console.log('🚀 Firebase Storage 업로드 시작...');
  console.log(`📁 PDF 디렉토리: ${pdfsDir}`);
  console.log(`📁 썸네일 디렉토리: ${thumbnailsDir}`);
  
  try {
    // 디렉토리 존재 확인
    if (!fs.existsSync(pdfsDir)) {
      throw new Error(`PDF 디렉토리를 찾을 수 없습니다: ${pdfsDir}`);
    }
    
    // PDF 파일 목록 가져오기
    const pdfFiles = fs.readdirSync(pdfsDir).filter(file => file.endsWith('.pdf'));
    console.log(`📄 발견된 PDF 파일: ${pdfFiles.length}개`);
    
    if (pdfFiles.length === 0) {
      console.log('📄 업로드할 PDF 파일이 없습니다.');
      return;
    }
    
    const results = [];
    
    // 각 PDF 파일과 썸네일 업로드
    for (let i = 0; i < pdfFiles.length; i++) {
      const pdfFile = pdfFiles[i];
      const pdfPath = path.join(pdfsDir, pdfFile);
      const thumbnailFile = pdfFile.replace('.pdf', '.png');
      const thumbnailPath = path.join(thumbnailsDir, thumbnailFile);
      
      console.log(`\n📋 처리 중 (${i + 1}/${pdfFiles.length}): ${pdfFile}`);
      
      // PDF 업로드
      const pdfUrl = await uploadFile(pdfPath, `pdfs/${pdfFile}`, 'application/pdf');
      
      // 썸네일 업로드
      let thumbnailUrl = null;
      if (fs.existsSync(thumbnailPath)) {
        thumbnailUrl = await uploadFile(thumbnailPath, `thumbnails/${thumbnailFile}`, 'image/png');
      } else {
        console.log(`⚠️  썸네일 없음: ${thumbnailFile}`);
      }
      
      results.push({
        fileName: pdfFile,
        pdfUrl,
        thumbnailUrl,
        success: pdfUrl !== null
      });
      
      // 업로드 간격 (Rate Limiting 방지)
      if (i < pdfFiles.length - 1) {
        console.log('⏳ 2초 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n🎉 업로드 프로세스 완료!');
    
    // 결과 통계
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    console.log('\n📊 업로드 결과:');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${failCount}개`);
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.fileName} ${result.success ? '✅' : '❌'}`);
    });
    
    // 결과를 JSON 파일로 저장
    const outputPath = path.join(__dirname, '..', 'firebase-urls.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 결과 저장됨: ${outputPath}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ 업로드 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 실행
uploadAllFiles()
  .then(() => {
    console.log('\n✨ 스크립트 완료');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 스크립트 실패:', error);
    process.exit(1);
  });
