'use client'

import { useState, useEffect } from 'react'

interface PromptData {
  systemPrompt: string
  mainPrompt: string
  lastUpdated: string
}

export default function AdminPage() {
  const [promptData, setPromptData] = useState<PromptData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedSystemPrompt, setEditedSystemPrompt] = useState('')
  const [editedMainPrompt, setEditedMainPrompt] = useState('')
  const [activeTab, setActiveTab] = useState<'system' | 'main'>('system')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // 프롬프트 데이터 로드
  const loadPromptData = async () => {
    try {
      const response = await fetch('/api/admin/system-prompt')
      if (!response.ok) {
        throw new Error('프롬프트 데이터를 불러올 수 없습니다.')
      }
      const data = await response.json()
      setPromptData(data)
      setEditedSystemPrompt(data.systemPrompt)
      setEditedMainPrompt(data.mainPrompt)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    }
  }

  // 프롬프트 데이터 저장
  const savePromptData = async () => {
    if (!editedSystemPrompt.trim()) {
      setError('시스템 프롬프트를 입력해주세요.')
      return
    }

    if (!editedMainPrompt.trim()) {
      setError('메인 프롬프트를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/system-prompt', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          systemPrompt: editedSystemPrompt,
          mainPrompt: editedMainPrompt
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '저장에 실패했습니다.')
      }

      const data = await response.json()
      setPromptData({
        systemPrompt: data.systemPrompt,
        mainPrompt: data.mainPrompt,
        lastUpdated: data.lastUpdated
      })
      setIsEditing(false)
      setMessage('프롬프트가 성공적으로 저장되었습니다.')
      
      // 메시지 자동 삭제
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditedSystemPrompt(promptData?.systemPrompt || '')
    setEditedMainPrompt(promptData?.mainPrompt || '')
    setError('')
  }

  useEffect(() => {
    loadPromptData()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ko-KR')
    } catch {
      return dateString
    }
  }

  const getCurrentPrompt = () => {
    if (activeTab === 'system') {
      return isEditing ? editedSystemPrompt : promptData?.systemPrompt || ''
    } else {
      return isEditing ? editedMainPrompt : promptData?.mainPrompt || ''
    }
  }

  const setCurrentPrompt = (value: string) => {
    if (activeTab === 'system') {
      setEditedSystemPrompt(value)
    } else {
      setEditedMainPrompt(value)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                프롬프트 관리
              </h1>
              <p className="text-gray-600">
                AI 문서 분석의 핵심 프롬프트를 관리합니다
              </p>
            </div>
            <a
              href="/"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              메인으로 돌아가기
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* 상태 정보 */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-500">
              {promptData && (
                <>
                  마지막 업데이트: {formatDate(promptData.lastUpdated)}
                </>
              )}
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  편집
                </button>
              ) : (
                <>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={savePromptData}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? '저장 중...' : '저장'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 메시지 표시 */}
          {message && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* 탭 네비게이션 */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'system'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 시스템 프롬프트
            </button>
            <button
              onClick={() => setActiveTab('main')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'main'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎯 메인 프롬프트 (지시사항)
            </button>
          </div>

          {/* 프롬프트 설명 */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            {activeTab === 'system' ? (
              <p className="text-sm text-blue-700">
                <strong>시스템 프롬프트:</strong> AI의 역할과 기본 동작 방식을 정의합니다. AI가 어떤 전문가인지, 어떤 태도로 작업해야 하는지를 설정합니다.
              </p>
            ) : (
              <p className="text-sm text-blue-700">
                <strong>메인 프롬프트:</strong> 구체적인 작업 지시사항, 작성지침, 출력형식을 포함합니다. 
                템플릿 변수 <code>{`{originalDoc}`}</code>와 <code>{`{changes}`}</code>를 사용할 수 있습니다.
              </p>
            )}
          </div>

          {/* 프롬프트 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activeTab === 'system' ? '시스템 프롬프트' : '메인 프롬프트'}
            </label>
            {isEditing ? (
              <textarea
                value={getCurrentPrompt()}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder={`${activeTab === 'system' ? '시스템' : '메인'} 프롬프트를 입력하세요...`}
              />
            ) : (
              <div className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-y-auto font-mono text-sm whitespace-pre-wrap">
                {getCurrentPrompt() || '프롬프트를 불러오는 중...'}
              </div>
            )}
          </div>

          {/* 문자 수 표시 */}
          <div className="mt-2 text-sm text-gray-500 text-right">
            {getCurrentPrompt().length} 문자
          </div>

          {/* 도움말 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">💡 프롬프트 작성 가이드</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-700 mb-1">시스템 프롬프트</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• AI의 역할과 전문성 정의</li>
                  <li>• 작업 태도와 접근 방식</li>
                  <li>• 전반적인 품질 기준</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-1">메인 프롬프트</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• 구체적인 작업 지시사항</li>
                  <li>• 단계별 작성지침</li>
                  <li>• 출력 형식과 템플릿</li>
                  <li>• <code>{`{originalDoc}`}</code>, <code>{`{changes}`}</code> 변수 활용</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 