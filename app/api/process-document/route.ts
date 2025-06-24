import { NextRequest, NextResponse } from 'next/server'
import { parseDocument } from '@/lib/documentParser'
import { generateDiff } from '@/lib/openaiClient'

export async function POST(request: NextRequest) {
  console.log('=== API 요청 시작 ===')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const changes = formData.get('changes') as string

    console.log('요청 데이터:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      changesLength: changes?.length,
      userAgent: request.headers.get('user-agent'),
      host: request.headers.get('host')
    })

    if (!file) {
      console.log('파일이 없음')
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      )
    }

    if (!changes) {
      console.log('변경사항이 없음')
      return NextResponse.json(
        { error: '변경사항이 없습니다.' },
        { status: 400 }
      )
    }

    // 파일 타입 검증
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/haansoftdocx'
    ]
    
    const isValidType = allowedTypes.includes(file.type) || 
                       file.name.toLowerCase().endsWith('.pdf') ||
                       file.name.toLowerCase().endsWith('.docx') ||
                       file.name.toLowerCase().endsWith('.doc')

    if (!isValidType) {
      console.log('지원되지 않는 파일 타입:', file.type, file.name)
      return NextResponse.json(
        { error: 'PDF 또는 Word 문서만 업로드 가능합니다.' },
        { status: 400 }
      )
    }

    console.log('파일 타입:', file.type, '파일명:', file.name)
    console.log('문서 파싱 시작...')
    
    let documentContent: string
    try {
      documentContent = await parseDocument(file)
      console.log('문서 파싱 완료, 텍스트 길이:', documentContent.length)
    } catch (parseError) {
      console.error('문서 파싱 오류:', parseError)
      return NextResponse.json(
        { error: `문서 파싱 중 오류가 발생했습니다: ${parseError instanceof Error ? parseError.message : '알 수 없는 오류'}` },
        { status: 400 }
      )
    }

    if (!documentContent || documentContent.trim().length === 0) {
      console.log('문서 내용이 비어있음')
      return NextResponse.json(
        { error: '문서에서 텍스트를 추출할 수 없습니다.' },
        { status: 400 }
      )
    }

    console.log('OpenAI 분석 시작...')
    try {
      const result = await generateDiff(documentContent, changes)
      console.log('OpenAI 분석 완료')
      return NextResponse.json(result)
    } catch (aiError) {
      console.error('OpenAI 분석 오류:', aiError)
      return NextResponse.json(
        { error: `AI 분석 중 오류가 발생했습니다: ${aiError instanceof Error ? aiError.message : '알 수 없는 오류'}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('API 전체 오류:', error)
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'POST 요청만 지원됩니다.' },
    { status: 405 }
  )
}

// OPTIONS 메서드도 추가하여 CORS 이슈 방지
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 