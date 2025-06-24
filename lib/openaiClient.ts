import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

function getPromptData(): { systemPrompt: string; mainPrompt: string } {
  try {
    const promptPath = path.join(process.cwd(), 'lib', 'systemPrompt.json')
    const promptData = JSON.parse(fs.readFileSync(promptPath, 'utf-8'))
    return {
      systemPrompt: promptData.systemPrompt,
      mainPrompt: promptData.mainPrompt
    }
  } catch (error) {
    console.error('프롬프트 파일 읽기 오류:', error)
    // 기본 프롬프트 반환
    return {
      systemPrompt: '당신은 문서 변경사항을 분석하는 전문가입니다. 주어진 원본 문서와 변경사항을 비교하여 정확한 diff 결과를 JSON 형태로 제공해주세요.',
      mainPrompt: '원본 문서: {originalDoc}\n\n변경사항: {changes}\n\n위 내용을 분석하여 diff 결과를 JSON 형태로 제공해주세요.'
    }
  }
}

export interface DiffItem {
  section: string
  original: string | null
  updated: string | null
}

export interface DiffResult {
  summary: string
  diffList: DiffItem[]
}

export async function generateDiff(originalDoc: string, changes: string): Promise<DiffResult> {
  const { systemPrompt, mainPrompt } = getPromptData()
  
  // 메인 프롬프트에서 템플릿 변수를 실제 값으로 치환
  const processedPrompt = mainPrompt
    .replace('{originalDoc}', originalDoc)
    .replace('{changes}', changes)

  try {
    const openai = getOpenAIClient()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1', // GPT-4.1 최신 모델 사용
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: processedPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('OpenAI API에서 응답을 받지 못했습니다.')
    }

    // JSON 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('올바른 JSON 형식의 응답을 받지 못했습니다.')
    }

    const result = JSON.parse(jsonMatch[0]) as DiffResult
    
    // 결과 검증
    if (!result.summary || !Array.isArray(result.diffList)) {
      throw new Error('응답 형식이 올바르지 않습니다.')
    }

    return result
  } catch (error) {
    console.error('OpenAI API 오류:', error)
    if (error instanceof Error) {
      throw new Error(`AI 분석 중 오류가 발생했습니다: ${error.message}`)
    }
    throw new Error('AI 분석 중 알 수 없는 오류가 발생했습니다.')
  }
} 