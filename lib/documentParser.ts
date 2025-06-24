import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export async function parseDocument(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return await parsePdf(uint8Array, file.name);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
             file.type === 'application/msword' ||
             file.type === 'application/haansoftdocx' ||
             file.name.toLowerCase().endsWith('.docx') ||
             file.name.toLowerCase().endsWith('.doc')) {
    return await parseDocx(buffer);
  }
  
  throw new Error('지원되지 않는 파일 형식입니다. PDF 또는 Word 문서만 업로드 가능합니다.');
}

async function parsePdf(data: Uint8Array, fileName: string): Promise<string> {
  try {
    console.log(`PDF 파싱 시작: ${fileName}, 크기: ${data.length} bytes`);
    
    // PDF 유효성 검사
    if (data.length < 100) {
      throw new Error('PDF 파일이 너무 작습니다.');
    }
    
    // PDF 헤더 확인
    const header = Array.from(data.slice(0, 4)).map(b => String.fromCharCode(b)).join('');
    if (!header.startsWith('%PDF')) {
      throw new Error('유효하지 않은 PDF 파일입니다.');
    }
    
    // pdf-parse 옵션 설정
    const options = {
      // 최대 페이지 수 제한
      max: 50,
    };
    
    const pdfData = await pdfParse(Buffer.from(data), options);
    
    console.log(`PDF 파싱 완료: 페이지 ${pdfData.numpages}개, 텍스트 길이 ${pdfData.text?.length || 0}자`);
    
    if (!pdfData.text || pdfData.text.trim().length < 10) {
      // 텍스트 추출이 불가능한 경우 메타데이터 기반 응답
      const fallbackText = createPdfFallbackText(fileName, pdfData);
      console.log('PDF 텍스트 추출 실패, 대체 텍스트 생성');
      return fallbackText;
    }
    
    return pdfData.text.trim();
    
  } catch (error) {
    console.error('PDF 파싱 오류:', error);
    
    // 오류 발생 시 기본 메타데이터 응답
    const errorFallbackText = `PDF 문서: ${fileName}
    
파일 크기: ${Math.round(data.length / 1024)}KB

[파싱 오류 발생]
PDF 파일에서 텍스트를 자동으로 추출할 수 없습니다.
변경사항 분석을 위해 문서의 주요 내용을 변경사항 입력란에 직접 입력해주세요.

예시: "1페이지: 제목과 개요, 2페이지: 상세 내용, 3페이지: 결론"`;
    
    console.log('PDF 오류 처리, 대체 텍스트 반환');
    return errorFallbackText;
  }
}

function createPdfFallbackText(fileName: string, pdfData: any): string {
  const title = pdfData.info?.Title || '제목 없음';
  const author = pdfData.info?.Author || '작성자 없음';
  const pages = pdfData.numpages || 0;
  
  return `PDF 문서: ${fileName}

제목: ${title}
작성자: ${author}
페이지 수: ${pages}페이지

[텍스트 추출 제한]
이 PDF에서 자동 텍스트 추출이 불가능합니다.
정확한 변경사항 분석을 위해 문서의 주요 내용을 변경사항 입력란에 추가로 입력해주세요.

입력 예시:
"페이지 1: 문서 제목과 개요 내용
페이지 2: 주요 항목들과 세부 설명
페이지 3: 결론 및 요약"`;
}

async function parseDocx(buffer: ArrayBuffer): Promise<string> {
  try {
    console.log('Word 문서 파싱 시작, 크기:', buffer.byteLength, 'bytes');
    
    // Node.js Buffer로 변환 (가장 안정적인 방법)
    const nodeBuffer = Buffer.from(new Uint8Array(buffer));
    
    const result = await mammoth.extractRawText({ buffer: nodeBuffer });
    
    console.log('Word 문서 파싱 완료, 텍스트 길이:', result.value?.length || 0);
    
    if (!result.value || !result.value.trim()) {
      throw new Error('Word 문서에서 텍스트를 추출할 수 없습니다.');
    }
    
    return result.value.trim();
  } catch (error) {
    console.error('Word 문서 파싱 오류:', error);
    throw new Error(`Word 문서 파싱 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

export function cleanText(text: string): string {
  // 불필요한 공백과 특수문자 정리
  return text
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .replace(/\n\s*\n/g, '\n\n') // 연속된 줄바꿈을 두 개로
    .trim()
} 