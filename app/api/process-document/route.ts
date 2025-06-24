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
      changesLength: changes?.length
    })

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      )
    }

    if (!changes) {
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

    console.log('문서 파싱 시작...')
    const documentContent = await parseDocument(file)
    console.log('문서 파싱 완료, 텍스트 길이:', documentContent.length)

    console.log('OpenAI 분석 시작...')
    const result = await generateDiff(documentContent, changes)
    console.log('OpenAI 분석 완료')

    return NextResponse.json(result)

  } catch (error) {
    console.error('API 에러:', error)
    
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