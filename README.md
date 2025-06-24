# 스마트 파일 버전 매니저

AI 기반 문서 변경사항 분석 시스템입니다. OpenAI API를 활용하여 원본 문서와 변경 요청사항을 비교 분석하고, 상세한 diff 결과를 제공합니다.

## 주요 기능

- **문서 업로드 지원**: PDF, Word 문서 (.pdf, .doc, .docx)
- **AI 기반 분석**: GPT-4 모델을 사용한 정확한 변경사항 분석
- **상세 Diff 결과**: 섹션별 변경사항을 시각적으로 표시
- **현대적 UI**: 드래그앤드롭, 반응형 디자인 지원

## 기술 스택

- **프론트엔드**: Next.js 14, React, TypeScript, Tailwind CSS
- **백엔드**: Next.js API Routes
- **AI 서비스**: OpenAI API (GPT-4)
- **문서 파싱**: pdf-parse, mammoth
- **배포**: Vercel

## 시작하기

### 1. 의존성 설치

\`\`\`bash
npm install
\`\`\`

### 2. 환경 변수 설정

프로젝트 루트에 \`.env.local\` 파일을 생성하고 다음 내용을 추가하세요:

\`\`\`
OPENAI_API_KEY=your_openai_api_key_here
\`\`\`

### 3. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 사용 방법

1. **원본 문서 업로드**: PDF 또는 Word 문서를 드래그하거나 클릭하여 업로드
2. **변경사항 입력**: 원하는 변경사항을 텍스트로 입력
3. **분석 실행**: "문서 분석하기" 버튼 클릭
4. **결과 확인**: AI가 분석한 상세 diff 결과 확인

## API 응답 형식

\`\`\`json
{
  "summary": "변경사항 요약 (200자 이내)",
  "diffList": [
    {
      "section": "변경 위치 식별자",
      "original": "변경 전 문장",
      "updated": "변경 후 문장"
    }
  ]
}
\`\`\`

## 배포

Vercel을 통한 배포:

1. GitHub 저장소에 코드 푸시
2. Vercel에서 프로젝트 연결
3. 환경 변수 설정 (OPENAI_API_KEY)
4. 자동 배포 완료

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request 