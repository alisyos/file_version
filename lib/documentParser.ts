import mammoth from 'mammoth';

// PDF 처리를 위한 대체 함수
async function parsePDFWithFallback(buffer: ArrayBuffer): Promise<string> {
  try {
    // 동적 import로 pdf-parse 로드
    const pdfParse = await import('pdf-parse');
    const data = await pdfParse.default(Buffer.from(buffer));
    return data.text || '';
  } catch (error) {
    console.warn('PDF parsing failed, using fallback:', error);
    
    // PDF 파싱 실패 시 대체 텍스트 반환
    return `PDF 문서가 업로드되었습니다. 
    
파일 크기: ${(buffer.byteLength / 1024).toFixed(2)} KB

PDF 텍스트 추출에 실패했습니다. 다음과 같은 이유일 수 있습니다:
- 스캔된 이미지 PDF
- 보안이 설정된 PDF
- 서버 환경 제한

변경사항을 입력하시면 해당 내용을 기반으로 분석을 진행합니다.`;
  }
}

export async function parseDocument(file: File): Promise<string> {
  console.log('문서 파싱 시작:', file.name, file.type);
  
  try {
    const buffer = await file.arrayBuffer();
    console.log('파일 버퍼 크기:', buffer.byteLength);

    // PDF 파일 처리
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      console.log('PDF 파싱 시작...');
      return await parsePDFWithFallback(buffer);
    }

    // Word 문서 처리
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword' ||
      file.type === 'application/haansoftdocx' ||
      file.name.toLowerCase().endsWith('.docx') ||
      file.name.toLowerCase().endsWith('.doc')
    ) {
      console.log('Word 문서 파싱 시작...');
      try {
        const result = await mammoth.extractRawText({
          buffer: Buffer.from(new Uint8Array(buffer))
        });
        
        if (!result.value || result.value.trim().length === 0) {
          throw new Error('문서에서 텍스트를 추출할 수 없습니다.');
        }
        
        console.log('Word 문서 파싱 완료, 텍스트 길이:', result.value.length);
        return result.value;
      } catch (mammothError) {
        console.error('Mammoth 파싱 오류:', mammothError);
        throw new Error(`Word 문서 파싱 중 오류가 발생했습니다: ${mammothError}`);
      }
    }

    throw new Error('지원되지 않는 파일 형식입니다.');
    
  } catch (error) {
    console.error('문서 파싱 오류:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('문서 파싱 중 알 수 없는 오류가 발생했습니다.');
  }
}

export function cleanText(text: string): string {
  // 불필요한 공백과 특수문자 정리
  return text
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .replace(/\n\s*\n/g, '\n\n') // 연속된 줄바꿈을 두 개로
    .trim();
} 