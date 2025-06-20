// Firebase Storage에 PDF 파일들을 업로드하는 스크립트
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';
import * as fs from 'fs';
import * as path from 'path';

// PDF 파일 업로드 함수
export async function uploadPdfFile(filePath: string, fileName: string): Promise<string> {
  try {
    // 파일 읽기
    const fileBuffer = fs.readFileSync(filePath);
    
    // Storage 참조 생성
    const storageRef = ref(storage, `pdfs/${fileName}`);
    
    // 파일 업로드
    const snapshot = await uploadBytes(storageRef, fileBuffer, {
      contentType: 'application/pdf'
    });
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`✅ ${fileName} 업로드 완료: ${downloadURL}`);
    return downloadURL;
    
  } catch (error) {
    console.error(`❌ ${fileName} 업로드 실패:`, error);
    throw error;
  }
}

// 썸네일 업로드 함수
export async function uploadThumbnail(filePath: string, fileName: string): Promise<string> {
  try {
    // 파일 읽기
    const fileBuffer = fs.readFileSync(filePath);
    
    // Storage 참조 생성
    const storageRef = ref(storage, `thumbnails/${fileName}`);
    
    // 파일 업로드
    const snapshot = await uploadBytes(storageRef, fileBuffer, {
      contentType: 'image/png'
    });
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`✅ ${fileName} 썸네일 업로드 완료: ${downloadURL}`);
    return downloadURL;
    
  } catch (error) {
    console.error(`❌ ${fileName} 썸네일 업로드 실패:`, error);
    throw error;
  }
}

// 모든 파일 업로드 함수
export async function uploadAllFiles() {
  const publicDir = path.join(process.cwd(), 'public');
  const pdfsDir = path.join(publicDir, 'pdfs');
  const thumbnailsDir = path.join(publicDir, 'thumbnails');
  
  try {
    // PDF 파일 목록 가져오기
    const pdfFiles = fs.readdirSync(pdfsDir).filter(file => file.endsWith('.pdf'));
    
    console.log(`📁 발견된 PDF 파일: ${pdfFiles.length}개`);
    
    // 각 PDF 파일과 썸네일 업로드
    for (const pdfFile of pdfFiles) {
      const pdfPath = path.join(pdfsDir, pdfFile);
      const thumbnailFile = pdfFile.replace('.pdf', '.png');
      const thumbnailPath = path.join(thumbnailsDir, thumbnailFile);
      
      // PDF 업로드
      await uploadPdfFile(pdfPath, pdfFile);
      
      // 썸네일 업로드 (파일이 존재하는 경우만)
      if (fs.existsSync(thumbnailPath)) {
        await uploadThumbnail(thumbnailPath, thumbnailFile);
      } else {
        console.log(`⚠️  썸네일 없음: ${thumbnailFile}`);
      }
      
      // 업로드 간격 (Firebase 제한 방지)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('🎉 모든 파일 업로드 완료!');
    
  } catch (error) {
    console.error('❌ 업로드 중 오류 발생:', error);
  }
}
